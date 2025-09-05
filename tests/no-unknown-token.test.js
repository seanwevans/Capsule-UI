const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('no-unknown-token rule does nothing when tokens are missing', async () => {
  const code = `
    const fs = require('fs');
    const path = require('path');
    const tokenPath = path.resolve(process.cwd(), 'tokens/source/tokens.json');
    const read = fs.readFileSync;
    fs.readFileSync = (p, ...args) => {
      if (p === tokenPath) throw new Error('ENOENT');
      return read(p, ...args);
    };
    const plugin = require('./packages/eslint-plugin-capsule');
    const { Linter } = require('eslint');
    const linter = new Linter();
    linter.defineRule('no-unknown-token', plugin.rules['no-unknown-token']);
    const messages = linter.verify("<div theme='foo'></div>", {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      rules: { 'no-unknown-token': 'error' }
    });
    console.log(JSON.stringify(messages));
  `;

  const output = await new Promise((resolve, reject) => {
    execFile(process.execPath, ['-e', code], { cwd: root }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.trim());
    });
  });

  const messages = JSON.parse(output);
  assert.equal(messages.length, 0);
});
