import { promises as fs } from 'fs';
import path from 'path';

interface TokenNode {
  $type?: string;
  $value?: any;
  [key: string]: any;
}

/* eslint-disable no-unused-vars */
type FlatToken = { name: string; value: any };
type Validator = (value: any) => void;
/* eslint-enable no-unused-vars */

function validateToken(name: string, type: string | undefined, value: any) {
  if (!type) throw new Error(`Token '${name}' is missing $type`);

  const validators: Record<string, Validator> = {
    color: value => {
      const hex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
      const rgb = /^rgba?\((\s*\d{1,3}\s*,){2}\s*\d{1,3}(\s*,\s*(0|0?\.\d+|1(?:\.0)?))?\s*\)$/;
      const hsl = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(\s*,\s*(0|0?\.\d+|1(?:\.0)?))?\s*\)$/;
      if (
        typeof value !== 'string' ||
        !(hex.test(value) || rgb.test(value) || hsl.test(value))
      ) {
        throw new Error(`Token '${name}' has invalid color value '${value}'`);
      }
    },
    dimension: value => {
      if (typeof value !== 'string' || !/^\d+(?:\.\d+)?(px|rem|em|%)$/.test(value)) {
        throw new Error(`Token '${name}' has invalid dimension value '${value}'`);
      }
    }
  };

  const validate = validators[type];
  if (!validate) throw new Error(`Unknown $type '${type}' for token '${name}'`);

  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      validate(v);
    }
  } else {
    validate(value);
  }
}

function flattenTokens(obj: TokenNode, prefix: string[] = [], out: FlatToken[] = []): FlatToken[] {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const name = [...prefix, key].join('.');
    if (typeof val === 'object' && '$value' in val) {
      if (val.$value === undefined) throw new Error(`Token '${name}' is missing $value`);
      validateToken(name, val.$type, val.$value);
      out.push({ name, value: val.$value });
    } else if (typeof val === 'object') {
      if ('$type' in val && !('$value' in val)) {
        throw new Error(`Token '${name}' is missing $value`);
      }
      flattenTokens(val, [...prefix, key], out);
    }
  }
  return out;
}

async function build() {
  const root = process.cwd();
  const src = path.join(root, 'tokens', 'source', 'tokens.json');
  const dist = path.join(root, 'dist');
  await fs.mkdir(dist, { recursive: true });
  const raw = JSON.parse(await fs.readFile(src, 'utf8')) as TokenNode;
  const tokens = flattenTokens(raw).sort((a, b) => a.name.localeCompare(b.name));

  // Gather all theme names across tokens
  const themeNames = new Set<string>();
  for (const t of tokens) {
    if (typeof t.value === 'object') {
      for (const theme of Object.keys(t.value)) {
        themeNames.add(theme);
      }
    }
  }
  if (themeNames.size === 0) themeNames.add('light');

  // Prepare containers for CSS and JSON outputs
  const themes: Record<string, string[]> = {};
  for (const theme of themeNames) {
    themes[theme] = [];
  }
  const jsonOut: Record<string, Record<string, string>> = {};

  for (const t of tokens) {
    const cssVar = '--' + t.name.replace(/\./g, '-');
    const defaultVal =
      typeof t.value === 'object'
        ? t.value.light ?? Object.values(t.value)[0]
        : t.value;
    for (const theme of themeNames) {
      const val =
        typeof t.value === 'object' ? t.value[theme] ?? defaultVal : defaultVal;
      themes[theme].push(`  ${cssVar}: ${val};`);
      if (!jsonOut[cssVar]) jsonOut[cssVar] = {};
      jsonOut[cssVar][theme] = val;
    }
  }

  const defaultTheme = themeNames.has('light')
    ? 'light'
    : Array.from(themeNames)[0];
  let css = `@layer components;\n:root{\n${themes[defaultTheme].join('\n')}\n}`;
  for (const theme of themeNames) {
    if (theme === defaultTheme) continue;
    css += `\n\n[data-theme="${theme}"]{\n${themes[theme].join('\n')}\n}`;
  }
  await fs.writeFile(path.join(dist, 'tokens.css'), css + '\n');
  await fs.writeFile(
    path.join(dist, 'tokens.json'),
    JSON.stringify(jsonOut, null, 2) + '\n'
  );

  const names = Object.keys(jsonOut)
    .map(n => `'${n}'`)
    .join(' | ');
  const themeUnion = Array.from(themeNames)
    .map(t => `'${t}'`)
    .join(' | ');
  const dts =
    `export type ThemeName = ${themeUnion};\n` +
    `export type TokenName = ${names};\n` +
    `export type TokenValues = Record<ThemeName, string>;\n` +
    `export const tokens: Record<TokenName, TokenValues>;\n` +
    `export default tokens;\n`;
  await fs.writeFile(path.join(dist, 'tokens.d.ts'), dts + '\n');
}

build().catch(err => { console.error(err); process.exit(1); });
