import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import { flattenTokens } from './token-utils.js';
import type { TokenNode } from './token-types.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function build() {
  const src = path.join(root, 'tokens', 'source', 'tokens.json');
  const dist = path.join(root, 'dist');
  await fs.mkdir(dist, { recursive: true });
  const raw = JSON.parse(await fs.readFile(src, 'utf8')) as TokenNode;

  // Validate source tokens against the JSON schema before further processing
  const schemaPath = path.join(root, 'tokens', 'token.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
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

  const themesList = [...themeNames].sort();

  // Ensure every token with theme-specific values defines all themes
  for (const t of tokens) {
    if (typeof t.value === 'object') {
      for (const theme of themesList) {
        if (!(theme in t.value)) {
          throw new Error(`Token '${t.name}' is missing theme '${theme}'`);
        }
      }
    }
  }

  // Prepare containers for CSS and JSON outputs
  const themes: Record<string, string[]> = {};
  for (const theme of themesList) {
    themes[theme] = [];
  }
  const jsonOut: Record<string, Record<string, string | number>> = {};

  for (const t of tokens) {
    const cssVar = '--' + t.name.replace(/\./g, '-');
    const defaultVal =
      typeof t.value === 'object'
        ? t.value.light ?? Object.values(t.value)[0]
        : t.value;
    for (const theme of themesList) {
      const val =
        typeof t.value === 'object' ? t.value[theme] ?? defaultVal : defaultVal;
      themes[theme].push(`  ${cssVar}: ${val};`);
      if (!jsonOut[cssVar]) jsonOut[cssVar] = {};
      jsonOut[cssVar][theme] = val;
    }
  }
 
  const defaultTheme = themesList.includes('light') ? 'light' : themesList[0];
  let css = `@layer components;\n:root{\n${themes[defaultTheme].join('\n')}\n}`;
  for (const theme of themesList) {
    if (theme === defaultTheme) continue;
    css += `\n\n[data-theme="${theme}"]{\n${themes[theme].join('\n')}\n}`;
  }
  const js =
    `export const tokens = ${JSON.stringify(jsonOut, null, 2)};\n` +
    `export default tokens;\n`;

  const names = Object.keys(jsonOut)
    .map(n => `'${n}'`)
    .join(' | ');
  const themeUnion = themesList.map(t => `'${t}'`).join(' | ');
  const dts =
    `export type ThemeName = ${themeUnion};\n` +
    `export type TokenName = ${names};\n` +
    `export type TokenValues = Record<ThemeName, string | number>;\n` +
    `export const tokens: Record<TokenName, TokenValues>;\n` +
    `export default tokens;\n`;

  await Promise.all([
    fs.writeFile(path.join(dist, 'tokens.css'), css + '\n'),
    fs.writeFile(
      path.join(dist, 'tokens.json'),
      JSON.stringify(jsonOut, null, 2) + '\n'
    ),
    fs.writeFile(path.join(dist, 'tokens.js'), js),
    fs.writeFile(path.join(dist, 'tokens.d.ts'), dts + '\n')
  ]);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  build().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
