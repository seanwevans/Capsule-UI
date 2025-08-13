const test = require('node:test');
const assert = require('node:assert/strict');
const { promises: fs } = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'build-tokens.ts');
const tokensPath = path.join(root, 'tokens', 'source', 'tokens.json');

function runBuild() {
  return new Promise((resolve, reject) => {
    execFile(
      'npx',
      ['ts-node', '--compiler-options', '{"module":"commonjs"}', script],
      { cwd: root },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr.trim()));
        else resolve(stdout);
      }
    );
  });
}

test('build tokens validation errors', async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'color', $value: 'nope' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid color value/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'unknown', $value: '#fff' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /Unknown \$type 'unknown'/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'color' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /missing \$value/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});
