#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const allow = process.env.CAPSULE_ALLOW_RUNTIME_STYLES === 'true';
if (allow) {
  process.exit(0);
}

const banned = ['styled-components', '@emotion/react', '@emotion/styled'];

for (const pkg of banned) {
  const result = spawnSync('rg', ['-l', pkg, '--glob', '!node_modules/**'], { encoding: 'utf8' });
  if (result.stdout.trim()) {
    console.error(
      `Runtime CSS-in-JS package "${pkg}" detected. Set CAPSULE_ALLOW_RUNTIME_STYLES=true to allow.`
    );
    process.exit(1);
  }
}
