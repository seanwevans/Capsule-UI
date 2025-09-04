import { validators } from './token-validators.ts';
import type { TokenNode } from './token-types.js';

export function validateToken(name: string, type: string | undefined, value: any) {
  if (!type) throw new Error(`Token '${name}' is missing $type`);

  const validate = validators[type];
  if (!validate) throw new Error(`Unknown $type '${type}' for token '${name}'`);

  if (value !== null && typeof value === 'object') {
    for (const v of Object.values(value)) {
      validate(name, v);
    }
  } else {
    validate(name, value);
  }
}

export function traverseTokens(
  obj: TokenNode,
  cb: (name: string, token: TokenNode) => void = () => {},
  prefix: string[] = []
): void {
  if (Array.isArray(obj)) {
    const fullName = prefix.join('.') || '(root)';
    throw new Error(`Token group '${fullName}' must be an object, not an array`);
  }
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
      cb(name, val as TokenNode);
    } else if (val && typeof val === 'object') {
      if ('$type' in val && !('$value' in val)) {
        throw new Error(`Token '${name}' is missing $value`);
      }
      traverseTokens(val as TokenNode, cb, [...prefix, key]);
    }
  }
}

export function flattenTokens(obj: TokenNode): { name: string; value: any }[] {
  const out: { name: string; value: any }[] = [];
  const seen = new Set<string>();
  traverseTokens(obj, (name, token) => {
    const nameKey = name.replace(/\./g, '-');
    if (seen.has(nameKey)) {
      throw new Error(`Duplicate token name '${nameKey}'`);
    }
    seen.add(nameKey);
    out.push({ name, value: token.$value });
  });
  return out;
}
