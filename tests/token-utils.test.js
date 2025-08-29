const test = require('node:test');
const assert = require('node:assert/strict');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS' } });

const { traverseTokens, flattenTokens, validateToken } = require('../scripts/token-utils.ts');

test('traverseTokens visits all tokens', () => {
  const names = [];
  traverseTokens(
    { color: { bg: { $type: 'color', $value: '#fff' }, text: { $type: 'color', $value: '#000' } } },
    name => names.push(name)
  );
  assert.deepEqual(names.sort(), ['color.bg', 'color.text']);
});

test('validateToken rejects unknown types', () => {
  assert.throws(() => validateToken('foo', 'unknown', '#fff'), /Unknown \$type 'unknown'/);
});

test('flattenTokens detects duplicate names', () => {
  assert.throws(
    () =>
      flattenTokens({
        'a-b': { $type: 'color', $value: '#fff' },
        a: { b: { $type: 'color', $value: '#000' } }
      }),
    /Duplicate token name 'a-b'/
  );
});
