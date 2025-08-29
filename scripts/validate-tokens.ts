import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TokenNode } from './token-types.js';
import { traverseTokens } from './token-utils.js';
import { validateTokens } from './token-schema.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function validate() {
  const src = path.join(root, 'tokens', 'source', 'tokens.json');
  const raw = JSON.parse(await fs.readFile(src, 'utf8')) as TokenNode;

  await validateTokens(raw);

  traverseTokens(raw);
}

validate()
  .then(() => console.log('Token validation passed.'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

