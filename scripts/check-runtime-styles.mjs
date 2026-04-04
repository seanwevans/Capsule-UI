#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const allow = process.env.CAPSULE_ALLOW_RUNTIME_STYLES === 'true';
if (allow) {
  process.exit(0);
}

const includeTests = process.env.CAPSULE_CHECK_RUNTIME_STYLES_INCLUDE_TESTS === 'true';

const banned = [
  'styled-components',
  '@emotion/react',
  '@emotion/styled',
  'aphrodite',
  'jss'
];

const sourceExtensions = ['js', 'jsx', 'cjs', 'mjs', 'ts', 'tsx'];
const sourceGlobs = [];

for (const ext of sourceExtensions) {
  sourceGlobs.push(`packages/**/*.${ext}`);
  sourceGlobs.push(`scripts/**/*.${ext}`);
}

sourceGlobs.push('packages/**/*.svelte', 'packages/**/*.vue');

if (includeTests) {
  for (const ext of sourceExtensions) {
    sourceGlobs.push(`tests/**/*.${ext}`);
  }
}

const ignoreGlobs = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/docs/**',
  '**/changelog/**',
  '**/*.min.*'
];

function buildImportPattern(pkg) {
  const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String.raw`\b(import\s+([^'"();\n]+\s+from\s*)?['"]${escaped}['"]|require\s*\(\s*['"]${escaped}['"]\s*\)|import\s*\(\s*['"]${escaped}['"]\s*\))`;
}

for (const pkg of banned) {
  const args = ['-l', buildImportPattern(pkg)];

  for (const glob of sourceGlobs) {
    args.push('--glob', glob);
  }

  for (const glob of ignoreGlobs) {
    args.push('--glob', `!${glob}`);
  }

  args.push('.');

  const result = spawnSync('rg', args, { encoding: 'utf8' });

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

  if (typeof result.status === 'number' && result.status > 1) {
    const stderr = typeof result.stderr === 'string' ? result.stderr.trim() : '';
    throw new Error(stderr || `rg failed while checking "${pkg}"`);
  }

  if (result.error) {
    throw result.error;
  }
}
