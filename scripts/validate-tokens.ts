import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import type { TokenNode } from './token-types.js';
import { traverseTokens } from './token-utils.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function validate() {
  const src = path.join(root, 'tokens', 'source', 'tokens.json');
  const raw = JSON.parse(await fs.readFile(src, 'utf8')) as TokenNode;

  const schemaPath = path.join(root, 'tokens', 'token.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validateSchema = ajv.compile(schema);
  if (!validateSchema(raw)) {
    const msg = (validateSchema.errors || [])
      .map(e => `${e.instancePath || '/'} ${e.message}`.trim())
      .join('; ');
    throw new Error(`Token schema validation failed: ${msg}`);
  }

  traverseTokens(raw);
}

validate()
  .then(() => console.log('Token validation passed.'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

