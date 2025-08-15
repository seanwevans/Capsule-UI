const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm, writeFile, chmod } = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');

const root = path.join(__dirname, '..');
const cli = path.join(root, 'packages', 'capsule-cli', 'bin', 'capsule.js');

function run(args, options = {}) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [cli, ...args],
      { cwd: root, env: { ...process.env, ...(options.env || {}) } },
      (error, stdout, stderr) => {
        resolve({
          code: error && typeof error.code === 'number' ? error.code : 0,
          stdout,
          stderr,
        });
      }
    );
  });
}

test('tokens build surfaces pnpm exit code', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const pnpm = path.join(tmp, 'pnpm');
    await writeFile(pnpm, '#!/bin/sh\nexit 0\n');
    await chmod(pnpm, 0o755);
    const { code } = await run(['tokens', 'build'], { env: { PATH: tmp } });
    assert.equal(code, 0);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('check surfaces pnpm failure exit code', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const pnpm = path.join(tmp, 'pnpm');
    await writeFile(pnpm, '#!/bin/sh\nexit 2\n');
    await chmod(pnpm, 0o755);
    const { code } = await run(['check'], { env: { PATH: tmp } });
    assert.equal(code, 2);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('reports error when pnpm is missing', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(['tokens', 'build'], { env: { PATH: tmp } });
    assert.equal(code, 1);
    assert.match(stderr, /pnpm not found/);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

