#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const allow = process.env.CAPSULE_ALLOW_RUNTIME_STYLES === 'true';
if (allow) {
  process.exit(0);
}

const banned = [
  'styled-components',
  '@emotion/react',
  '@emotion/styled',
  'aphrodite',
  'jss'
];

for (const pkg of banned) {
  const result = spawnSync('rg', ['-l', pkg, '--glob', '!node_modules/**'], {
    encoding: 'utf8'
  });

  // `result.stdout` can be `null` when the spawned process fails. Guard against
  // this to avoid a `TypeError` when attempting to call `.trim()` on a
  // `null`/`undefined` value.
  const output = typeof result.stdout === 'string' ? result.stdout.trim() : '';

  if (output) {
    console.error(
      `Runtime CSS-in-JS package "${pkg}" detected. Set CAPSULE_ALLOW_RUNTIME_STYLES=true to allow.`
    );
    process.exit(1);
  }

  if (result.error) {
    throw result.error;
  }
}
