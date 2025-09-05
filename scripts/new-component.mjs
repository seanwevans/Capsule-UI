#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [name] = process.argv.slice(2);
if (!name) {
  console.error('Usage: pnpm new:component <Name>');
  process.exit(1);
}

const kebab = name
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase();

const pkgDir = path.join('packages', 'core');
const jsPath = path.join(pkgDir, `${kebab}.js`);
const cssPath = path.join(pkgDir, `${kebab}.module.css`);

if (fs.existsSync(jsPath) || fs.existsSync(cssPath)) {
  console.error('Component already exists');
  process.exit(1);
}

fs.writeFileSync(
  jsPath,
  `import styles from './${kebab}.module.css';\n\nexport function ${name}() {\n  // TODO: implement ${name}\n}\n`
);

fs.writeFileSync(
  cssPath,
  `@layer components;\n\n.${kebab} {\n  /* TODO: component styles */\n}\n`
);

const adrDir = path.join('docs', 'adr');
const files = fs
  .readdirSync(adrDir)
  .map((f) => f.match(/^(\d+)-/))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const next = String(Math.max(0, ...files) + 1).padStart(3, '0');
const template = fs.readFileSync(path.join(adrDir, '000-style-contract-template.md'), 'utf8');
const adrPath = path.join(adrDir, `${next}-${kebab}.md`);
const adrContent = template
  .replace('ADR 000: Style Contract Template', `ADR ${next}: ${name} Component`)
  .replace('Draft', 'Draft');
fs.writeFileSync(adrPath, adrContent);

console.log(`Scaffolded component at ${jsPath} and ${cssPath}`);
console.log(`Created ADR at ${adrPath}`);
