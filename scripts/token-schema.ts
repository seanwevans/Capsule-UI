import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv, { type ValidateFunction } from 'ajv';
import type { TokenNode } from './token-types.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let validator: ValidateFunction<TokenNode> | null = null;

async function loadValidator(): Promise<ValidateFunction<TokenNode>> {
  if (!validator) {
    const schemaPath = path.join(root, 'tokens', 'token.schema.json');
    const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    validator = ajv.compile<TokenNode>(schema);
  }
  return validator;
}

export async function validateTokens(raw: TokenNode): Promise<void> {
  const validate = await loadValidator();
  if (!validate(raw)) {
    const msg = (validate.errors || [])
      .map(e => `${e.instancePath || '/'} ${e.message}`.trim())
      .join('; ');
    throw new Error(`Token schema validation failed: ${msg}`);
  }
}
