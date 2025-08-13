import { promises as fs } from 'fs';
import path from 'path';

const baseDir = path.dirname(new URL(import.meta.url).pathname);

interface TokenNode {
  $type?: string;
  $value?: any;
  [key: string]: any;
}

type FlatToken = { name: string; value: any };

function flattenTokens(obj: TokenNode, prefix: string[] = [], out: FlatToken[] = []): FlatToken[] {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (typeof val === 'object' && '$value' in val) {
      out.push({ name: [...prefix, key].join('.'), value: val.$value });
    } else if (typeof val === 'object') {
      flattenTokens(val, [...prefix, key], out);
    }
  }
  return out;
}

async function build() {
  const src = path.join(baseDir, '..', 'tokens', 'source', 'tokens.json');
  const dist = path.join(baseDir, '..', 'dist');
  await fs.mkdir(dist, { recursive: true });
  const raw = JSON.parse(await fs.readFile(src, 'utf8')) as TokenNode;
  const tokens = flattenTokens(raw);

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
  let css = `:root{\n${themes[defaultTheme].join('\n')}\n}`;
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
