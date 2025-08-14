import { promises as fs } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import * as csstree from 'css-tree';

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
      if (typeof value !== 'string') {
        throw new Error(`Token '${name}' has invalid color value '${value}'`);
      }
      const match = csstree.lexer.matchProperty('color', value);
      if (match.error) {
        throw new Error(`Token '${name}' has invalid color value '${value}'`);
      }
    },
    dimension: value => {
      if (typeof value !== 'string') {
        throw new Error(`Token '${name}' has invalid dimension value '${value}'`);
      }
      const isLength = csstree.lexer.matchType('length', value).error === null;
      const isPercent = csstree.lexer.matchType('percentage', value).error === null;
      if (!isLength && !isPercent) {
        throw new Error(`Token '${name}' has invalid dimension value '${value}'`);
      }
    },
    number: value => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`Token '${name}' has invalid number value '${value}'`);
      }
    },
    'font-size': value => {
      if (typeof value !== 'string') {
        throw new Error(`Token '${name}' has invalid font-size value '${value}'`);
      }
      const match = csstree.lexer.matchProperty('font-size', value);
      if (match.error) {
        throw new Error(`Token '${name}' has invalid font-size value '${value}'`);
      }
    }
  };

  const validate = validators[type];
  if (!validate) throw new Error(`Unknown $type '${type}' for token '${name}'`);

  if (value !== null && typeof value === 'object') {
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
    if (val && typeof val === 'object' && '$value' in val) {
      if (val.$value === undefined) throw new Error(`Token '${name}' is missing $value`);
      validateToken(name, val.$type, val.$value);
      out.push({ name, value: val.$value });
    } else if (val && typeof val === 'object') {
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

  // Validate source tokens against the JSON schema before further processing
  const schemaPath = path.join(root, 'tokens', 'token.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  if (!validate(raw)) {
    const msg = (validate.errors || [])
      .map(e => `${e.instancePath || '/'} ${e.message}`.trim())
      .join('; ');
    throw new Error(`Token schema validation failed: ${msg}`);
  }
  
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
  const jsonOut: Record<string, Record<string, string | number>> = {};

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
    `export type TokenValues = Record<ThemeName, string | number>;\n` +
    `export const tokens: Record<TokenName, TokenValues>;\n` +
    `export default tokens;\n`;
  await fs.writeFile(path.join(dist, 'tokens.d.ts'), dts + '\n');
}

build().catch(err => { console.error(err); process.exit(1); });
