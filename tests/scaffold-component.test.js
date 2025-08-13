const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm, access } = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');

const cli = path.join(
  __dirname,
  '..',
  'packages',
  'capsule-cli',
  'bin',
  'capsule.js'
);

function run(args, options = {}) {
  return new Promise((resolve) => {
    execFile('node', [cli, ...args], options, (error, stdout, stderr) => {
      resolve({
        code: error && typeof error.code === 'number' ? error.code : 0,
        stdout,
        stderr,
      });
    });
  });
}

test('scaffolds component with valid name', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code } = await run(['new', 'component', 'valid-name'], { cwd: tmp });
    assert.equal(code, 0);
    await access(path.join(tmp, 'packages', 'components', 'ValidName'));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('rejects invalid component name', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(
      ['new', 'component', 'invalid name!'],
      { cwd: tmp }
    );
    assert.equal(code, 1);
    assert.match(stderr, /Invalid component name/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('fails when component already exists', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    let res = await run(['new', 'component', 'dupe'], { cwd: tmp });
    assert.equal(res.code, 0);
    res = await run(['new', 'component', 'dupe'], { cwd: tmp });
    assert.equal(res.code, 1);
    assert.match(res.stderr, /already exists/);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

