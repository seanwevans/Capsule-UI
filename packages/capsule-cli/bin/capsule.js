#!/usr/bin/env node
import { access, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
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
  .action(async (type, name) => {
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
    const ok = await scaffoldComponent(name);
    process.exitCode = ok ? 0 : 1;
  });

const tokens = program.command('tokens').description('Design token utilities');

tokens
  .command('build')
  .description('Build design tokens')
  .action(() => {
    process.exitCode = runCommand('pnpm', ['run', 'tokens:build']);
  });

tokens
  .command('watch')
  .description('Watch design tokens and rebuild on changes')
  .action(() => {
    process.exitCode = runCommand('pnpm', ['run', 'tokens:watch']);
  });

program
  .command('check')
  .description('Run lint checks')
  .action(() => {
    process.exitCode = runCommand('pnpm', ['run', 'lint']);
  });

if (
  import.meta.url === process.argv[1] ||
  import.meta.url === pathToFileURL(process.argv[1]).href
)
  await program.parseAsync(process.argv);

function runCommand(command, params) {
  try {
    const res = spawnSync(command, params, { stdio: 'inherit' });
    if (res.error && res.error.code === 'ENOENT') {
      console.error(`${command} not found; install ${command} or adjust PATH.`);
      return 1;
    }
    return res.status ?? 1;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`${command} not found; install ${command} or adjust PATH.`);
      return 1;
    }
    throw error;
  }
}

export async function scaffoldComponent(rawName) {
  try {
    const validName = /^[a-z][a-z0-9_-]*$/i;
    if (!validName.test(rawName)) {
      console.error(
        `Invalid component name "${rawName}". Name must start with a letter and may contain only letters, numbers, hyphens, or underscores.`
      );
      return false;
    }
    const name = toPascalCase(rawName);
    const baseDir = join(process.cwd(), 'packages', 'components', name);

    try {
      await access(baseDir);
      console.error(`Component "${name}" already exists`);
      return false;
    } catch {
      // directory does not exist; continue
    }

    await mkdir(baseDir, { recursive: true });
    const testDir = join(baseDir, '__tests__');
    await mkdir(testDir, { recursive: true });

    const componentFile = join(baseDir, `${name}.ts`);
    const styleFile = join(baseDir, 'style.ts');
    const indexFile = join(baseDir, 'index.ts');
    const testFile = join(testDir, `${name}.test.ts`);

    const componentSrc = `export const ${name} = () => {\n  // TODO: implement ${name} component\n};\n`;
    const styleSrc = `export interface ${name}StyleProps {\n  // TODO: define style props\n}\n\nexport const create${name}Styles = (_: ${name}StyleProps) => {\n  // TODO: implement Style API\n};\n`;
    const indexSrc = `export * from './${name}';\n`;
    const testSrc = `describe('${name}', () => {\n  it('should render correctly', () => {\n    expect(true).toBe(true);\n  });\n});\n`;

    await writeFile(componentFile, componentSrc, 'utf8');
    await writeFile(styleFile, styleSrc, 'utf8');
    await writeFile(indexFile, indexSrc, 'utf8');
    await writeFile(testFile, testSrc, 'utf8');

    await updateComponentsIndex(name);
    console.log(`Scaffolded component at ${baseDir}`);
    return true;
  } catch (err) {
    console.error('Error scaffolding component:', err);
    return false;
  }
}

async function updateComponentsIndex(name) {
  const componentsDir = join(process.cwd(), 'packages', 'components');
  await mkdir(componentsDir, { recursive: true });
  const indexPath = join(componentsDir, 'index.ts');
  const exportLine = `export * from './${name}/${name}';\n`;
  try {
    const current = await readFile(indexPath, 'utf8');
    if (!current.includes(exportLine)) {
      await writeFile(indexPath, current + exportLine, 'utf8');
    }
  } catch {
    await writeFile(indexPath, exportLine, 'utf8');
  }
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
