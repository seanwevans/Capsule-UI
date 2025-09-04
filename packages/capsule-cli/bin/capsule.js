#!/usr/bin/env node
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('capsule')
  .description('Command line utilities for Capsule UI')
  .version(pkg.version);

program
  .command('new')
  .description(
    'Scaffold a new resource (component, style, index and test files are generated)'
  )
  .argument('<type>', 'Resource type (currently only "component" is supported)')
  .argument('<name>', 'Name of the component (kebab- or snake-case allowed)')
  .option('--dir <path>', 'Base directory for components', 'packages/components')
  .action(async (type, name, options) => {
    if (type !== 'component') {
      console.error('Error: only "component" type is supported.');
      process.exitCode = 1;
      return;
    }
    if (!name) {
      console.error('Error: component name is required.');
      process.exitCode = 1;
      return;
    }
    const ok = await scaffoldComponent(name, options.dir);
    process.exitCode = ok ? 0 : 1;
  });

const tokens = program.command('tokens').description('Design token utilities');

tokens
  .command('build')
  .description('Build design tokens')
  .action(async () => {
    try {
      process.exitCode = await runCommand('pnpm', ['run', 'tokens:build']);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

tokens
  .command('validate')
  .description('Validate design tokens')
  .action(async () => {
    try {
      process.exitCode = await runCommand('pnpm', ['run', 'tokens:validate']);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

tokens
  .command('watch')
  .description('Watch design tokens and rebuild on changes')
  .action(async () => {
    try {
      process.exitCode = await runCommand('pnpm', ['run', 'tokens:watch']);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

program
  .command('check')
  .description('Run lint checks')
  .action(async () => {
    try {
      process.exitCode = await runCommand('pnpm', ['run', 'lint']);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

if (
  import.meta.url === process.argv[1] ||
  import.meta.url === pathToFileURL(process.argv[1]).href
)
  await program.parseAsync(process.argv);

function runCommand(command, params) {
  return new Promise((resolve, reject) => {
    const cmd =
      process.platform === 'win32' && command === 'pnpm'
        ? `${command}.cmd`
        : command;

    let child;
    try {
      child = spawn(cmd, params, { stdio: 'inherit' });
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`${command} not found; install ${command} or adjust PATH.`);
        return resolve(1);
      }
      return reject(err);
    }

    const forward = (signal) => {
      child.kill(signal);
    };
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    signals.forEach((sig) => process.on(sig, forward));

    child.on('close', (code, signal) => {
      signals.forEach((sig) => process.off(sig, forward));
      if (signal) {
        resolve(1);
      } else {
        resolve(code ?? 1);
      }
    });

    child.on('error', (error) => {
      signals.forEach((sig) => process.off(sig, forward));
      if (error.code === 'ENOENT') {
        console.error(`${command} not found; install ${command} or adjust PATH.`);
        resolve(1);
      } else {
        reject(error);
      }
    });
  });
}

export async function scaffoldComponent(rawName, baseDir = 'packages/components') {
  try {
    const validName = /^[a-z](?:[a-z0-9]*(?:[-_][a-z0-9]+)*)$/i;
    if (!validName.test(rawName)) {
      console.error(
        `Invalid component name "${rawName}". Name must start with a letter, may contain letters, numbers, hyphens, or underscores, and cannot have leading/trailing separators or consecutive separators.`
      );
      return false;
    }
    const name = toPascalCase(rawName);
    const componentsDir = isAbsolute(baseDir)
      ? baseDir
      : join(process.cwd(), baseDir);
    const componentDir = join(componentsDir, name);

    await mkdir(componentsDir, { recursive: true });
    try {
      await mkdir(componentDir, { recursive: false });
    } catch (err) {
      if (err.code === 'EEXIST') {
        console.error('Component already exists');
        return false;
      }
      throw err;
    }
    const testDir = join(componentDir, '__tests__');
    await mkdir(testDir, { recursive: true });

    const componentFile = join(componentDir, `${name}.ts`);
    const styleFile = join(componentDir, 'style.ts');
    const indexFile = join(componentDir, 'index.ts');
    const testFile = join(testDir, `${name}.test.ts`);

    const componentSrc = `export const ${name} = () => {\n  // TODO: implement ${name} component\n};\n`;
    const styleSrc = `export interface ${name}StyleProps {\n  // TODO: define style props\n}\n\nexport const create${name}Styles = (_: ${name}StyleProps) => {\n  // TODO: implement Style API\n};\n`;
    const indexSrc = `export * from './${name}';\nexport * from './style';\n`;
    const testSrc = `describe('${name}', () => {\n  it('should render correctly', () => {\n    expect(true).toBe(true);\n  });\n});\n`;

    const componentsIndexPath = join(componentsDir, 'index.ts');
    let previousIndex = '';
    let indexExisted = true;
    try {
      previousIndex = await readFile(componentsIndexPath, 'utf8');
    } catch {
      indexExisted = false;
    }

    let indexUpdated = false;
    try {
      await writeFile(componentFile, componentSrc, 'utf8');
      await writeFile(styleFile, styleSrc, 'utf8');
      await writeFile(indexFile, indexSrc, 'utf8');
      await writeFile(testFile, testSrc, 'utf8');

      await updateComponentsIndex(name, componentsDir);
      indexUpdated = true;

      console.log(`Scaffolded component at ${componentDir}`);
    } catch (err) {
      if (indexUpdated) {
        if (indexExisted) {
          await writeFile(componentsIndexPath, previousIndex, 'utf8');
        } else {
          await rm(componentsIndexPath, { force: true });
        }
      }
      await rm(componentDir, { recursive: true, force: true });
      console.error('Error scaffolding component:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error scaffolding component:', err);
    return false;
  }
}

async function updateComponentsIndex(name, componentsDir) {
  await mkdir(componentsDir, { recursive: true });
  const indexPath = join(componentsDir, 'index.ts');
  const exportLine = `export * from './${name}/${name}';`;
  let lines = [];
  try {
    const current = await readFile(indexPath, 'utf8');
    lines = current.split(/\r?\n/).filter(Boolean);
  } catch {
    // index.ts does not exist yet
  }
  lines.push(exportLine);
  const uniqueSorted = Array.from(new Set(lines)).sort();
  const content = uniqueSorted.join('\n') + '\n';
  await writeFile(indexPath, content, 'utf8');
}

function toPascalCase(str) {
  return str
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}
