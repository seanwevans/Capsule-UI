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

const camel = name.charAt(0).toLowerCase() + name.slice(1);

const pkgDir = path.join('packages', 'core');
const jsPath = path.join(pkgDir, `${kebab}.js`);
const cssPath = path.join(pkgDir, `${kebab}.module.css`);
const recipePath = path.join(pkgDir, `${kebab}.recipe.js`);
const dtsPath = path.join(pkgDir, `${kebab}.recipe.d.ts`);

if (fs.existsSync(jsPath) || fs.existsSync(cssPath) || fs.existsSync(recipePath) || fs.existsSync(dtsPath)) {
  console.error('Component already exists');
  process.exit(1);
}

fs.writeFileSync(
  jsPath,
  `import { ${camel}Recipe } from './${kebab}.recipe.js';

export function ${name}(props = {}) {
  return \`<div class=\"\${${camel}Recipe(props)}\"></div>\`;
}
`
);

fs.writeFileSync(
  cssPath,
  `@layer components;

.${kebab} {
  display: block;
}
`
);

fs.writeFileSync(
  recipePath,
  `import { cva } from 'class-variance-authority';
import styles from './${kebab}.module.css';

export const ${camel}Recipe = cva(styles['${kebab}'], {
  variants: {},
  defaultVariants: {}
});
`
);

fs.writeFileSync(
  dtsPath,
  `/* eslint-disable no-unused-vars */
import type { VariantProps } from 'class-variance-authority';

export declare const ${camel}Recipe: (options?: Record<string, string>) => string;

export type ${name}RecipeProps = VariantProps<typeof ${camel}Recipe>;
`
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

console.log(`Scaffolded component at ${jsPath}, ${cssPath}, ${recipePath}, and ${dtsPath}`);
console.log(`Created ADR at ${adrPath}`);
