const test = require('node:test');
const assert = require('node:assert/strict');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS' } });

const { execFile } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');

function runEval(code) {
  return new Promise((resolve, reject) => {
    execFile(
      'npx',
      ['tsx', '-e', code],
      { cwd: root },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr.trim() || stdout.trim()));
        else resolve(stdout.trim());
      }
    );
  });
}

test('traverseTokens visits all tokens', async () => {
  const result = await runEval(
    "import { traverseTokens } from './scripts/token-utils.ts'; const names=[]; traverseTokens({ color: { bg: { $type: 'color', $value: '#fff' }, text: { $type: 'color', $value: '#000' } } }, n=>names.push(n)); console.log(JSON.stringify(names));"
  );
  const names = JSON.parse(result);
  assert.deepEqual(names.sort(), ['color.bg', 'color.text']);
});

test('validateToken rejects unknown types', async () => {
  await assert.rejects(
    runEval("import { validateToken } from './scripts/token-utils.ts'; validateToken('foo','unknown','#fff');"),
    /Unknown \$type 'unknown'/
  );
});

test('flattenTokens detects duplicate names', async () => {
  await assert.rejects(
    runEval(
      "import { flattenTokens } from './scripts/token-utils.ts'; flattenTokens({ 'a-b': { $type: 'color', $value: '#fff' }, a: { b: { $type: 'color', $value: '#000' } } });"
    ),
    /Duplicate token name 'a-b'/
  );
});
