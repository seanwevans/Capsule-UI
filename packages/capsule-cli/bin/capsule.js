#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:\n  capsule new component <Name>\n  capsule tokens build\n  capsule check`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  usage();
  process.exit(0);
}

const [cmd, subcmd, name] = args;

switch (cmd) {
  case 'new':
    if (subcmd === 'component' && name) {
      scaffoldComponent(name);
    } else {
      usage();
    }
    break;
  case 'tokens':
    if (subcmd === 'build') {
      runCommand('npm', ['run', 'tokens:build']);
    } else {
      usage();
    }
    break;
  case 'check':
    runCommand('npm', ['run', 'lint']);
    break;
  default:
    usage();
}

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
