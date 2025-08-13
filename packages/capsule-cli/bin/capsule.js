#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
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
  .description('Scaffold a new resource')
  .argument('<type>', 'Resource type (currently only "component" is supported)')
  .argument('<name>', 'Name of the component')
  .action((type, name) => {
    if (type !== 'component') {
      console.error('Error: only "component" type is supported.');
      process.exit(1);
    }
    if (!name) {
      console.error('Error: component name is required.');
      process.exit(1);
    }
    scaffoldComponent(name);
  });

const tokens = program.command('tokens').description('Design token utilities');

tokens
  .command('build')
  .description('Build design tokens')
  .action(() => runCommand('pnpm', ['run', 'tokens:build']));

program
  .command('check')
  .description('Run lint checks')
  .action(() => runCommand('pnpm', ['run', 'lint']));

program.parse(process.argv);

function runCommand(command, params) {
  const res = spawnSync(command, params, { stdio: 'inherit' });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function scaffoldComponent(rawName) {
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const baseDir = join(process.cwd(), 'packages', 'components', name);
  if (existsSync(baseDir)) {
    console.error(`Component "${name}" already exists`);
    process.exit(1);
  }
  mkdirSync(baseDir, { recursive: true });

  const componentFile = join(baseDir, `${name}.ts`);
  const styleFile = join(baseDir, 'style.ts');

  const componentSrc = `export const ${name} = () => {\n  // TODO: implement ${name} component\n};\n`;
  const styleSrc = `export interface ${name}StyleProps {\n  // TODO: define style props\n}\n\nexport const create${name}Styles = (_: ${name}StyleProps) => {\n  // TODO: implement Style API\n};\n`;

  writeFileSync(componentFile, componentSrc, 'utf8');
  writeFileSync(styleFile, styleSrc, 'utf8');
  console.log(`Scaffolded component at ${baseDir}`);
}
