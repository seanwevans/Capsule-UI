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

  const light: string[] = [];
  const dark: string[] = [];
  const jsonOut: Record<string, { light: string; dark: string }> = {};

  for (const t of tokens) {
    const cssVar = '--' + t.name.replace(/\./g, '-');
    let lightVal: string;
    let darkVal: string;
    if (typeof t.value === 'object') {
      lightVal = t.value.light;
      darkVal = t.value.dark ?? t.value.light;
    } else {
      lightVal = t.value;
      darkVal = t.value;
    }
    light.push(`  ${cssVar}: ${lightVal};`);
    dark.push(`  ${cssVar}: ${darkVal};`);
    jsonOut[cssVar] = { light: lightVal, dark: darkVal };
  }

  const css = `:root{\n${light.join('\n')}\n}\n\n[data-theme="dark"]{\n${dark.join('\n')}\n}\n`;
  await fs.writeFile(path.join(dist, 'tokens.css'), css + '\n');
  await fs.writeFile(path.join(dist, 'tokens.json'), JSON.stringify(jsonOut, null, 2) + '\n');

  const names = Object.keys(jsonOut).map(n => `'${n}'`).join(' | ');
  const dts = `export type TokenName = ${names};\nexport interface TokenValues { light: string; dark: string; }\nexport const tokens: Record<TokenName, TokenValues>;\nexport default tokens;\n`;
  await fs.writeFile(path.join(dist, 'tokens.d.ts'), dts + '\n');
}

build().catch(err => { console.error(err); process.exit(1); });
