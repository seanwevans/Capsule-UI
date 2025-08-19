import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import * as csstree from 'css-tree';
import type { TokenNode } from './token-types.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* eslint-disable no-unused-vars */
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
    },
    'font-weight': value => {
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`Token '${name}' has invalid font-weight value '${value}'`);
      }
      const match = csstree.lexer.matchProperty('font-weight', String(value));
      if (match.error) {
        throw new Error(`Token '${name}' has invalid font-weight value '${value}'`);
      }
    },
    duration: value => {
      if (typeof value !== 'string') {
        throw new Error(`Token '${name}' has invalid duration value '${value}'`);
      }
      const isTime = csstree.lexer.matchType('time', value).error === null;
      if (!isTime) {
        throw new Error(`Token '${name}' has invalid duration value '${value}'`);
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

function traverse(obj: TokenNode, prefix: string[] = []): void {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (!/^[a-z0-9_-]+$/.test(key)) {
      const fullName = [...prefix, key].join('.');
      throw new Error(
        `Invalid token key '${fullName}'. Keys may only include lowercase letters, digits, hyphen, and underscore.`
      );
    }
    const name = [...prefix, key].join('.');
    if (val && typeof val === 'object' && '$value' in val) {
      if (val.$value === undefined) throw new Error(`Token '${name}' is missing $value`);
      validateToken(name, val.$type, val.$value);
    } else if (val && typeof val === 'object') {
      if ('$type' in val && !('$value' in val)) {
        throw new Error(`Token '${name}' is missing $value`);
      }
      traverse(val as TokenNode, [...prefix, key]);
    }
  }
}

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

  traverse(raw);
}

validate()
  .then(() => console.log('Token validation passed.'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

