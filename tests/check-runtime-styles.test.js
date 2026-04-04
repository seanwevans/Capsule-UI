const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { mkdtemp, mkdir, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'check-runtime-styles.mjs');

function runCheck(cwd, env = {}) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [script],
      { cwd, env: { ...process.env, ...env } },
      (error, stdout, stderr) => {
        resolve({
          code: error && typeof error.code === 'number' ? error.code : 0,
          stdout,
          stderr
        });
      }
    );
  });
}

test('ignores plain text mentions outside explicit imports', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-runtime-styles-'));
  try {
    await mkdir(path.join(tmp, 'packages', 'core'), { recursive: true });
    await writeFile(
      path.join(tmp, 'packages', 'core', 'README.md'),
      'Runtime styles note: styled-components may appear in docs.\n',
      'utf8'
    );
    await writeFile(
      path.join(tmp, 'packages', 'core', 'index.js'),
      'export const message = "styled-components is just text here";\n',
      'utf8'
    );

    const result = await runCheck(tmp);
    assert.equal(result.code, 0);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('fails when banned package is imported from source directories', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-runtime-styles-'));
  try {
    await mkdir(path.join(tmp, 'packages', 'core'), { recursive: true });
    await writeFile(
      path.join(tmp, 'packages', 'core', 'index.js'),
      "import styled from 'styled-components';\nexport default styled;\n",
      'utf8'
    );

    const result = await runCheck(tmp);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Runtime CSS-in-JS package "styled-components" detected/);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});
