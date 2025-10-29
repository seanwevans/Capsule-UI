const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('child_process');

const tsx = require.resolve('tsx');
const root = require('path').join(__dirname, '..');

function runEval(code) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ['--import', tsx, '-e', code],
      { cwd: root },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || stdout.trim()));
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

test('language server extracts button variants with defaultVariants present', async () => {
  const result = await runEval(
    "import { loadVariantsFromDirectory } from './packages/capsule-language-server/src/variant-loader.ts'; const variants = loadVariantsFromDirectory('./packages/core'); console.log(JSON.stringify(variants['caps-button']));"
  );
  const parsed = JSON.parse(result);
  assert.deepEqual(parsed.size, ['sm', 'lg']);
  assert.deepEqual(parsed.variant, ['primary', 'secondary', 'danger', 'outline']);
});

test('language server extracts select variants without defaultVariants', async () => {
  const result = await runEval(
    "import { loadVariantsFromDirectory } from './packages/capsule-language-server/src/variant-loader.ts'; const variants = loadVariantsFromDirectory('./packages/core'); console.log(JSON.stringify(variants['caps-select']));"
  );
  const parsed = JSON.parse(result);
  assert.deepEqual(parsed.variant, ['outline']);
});
