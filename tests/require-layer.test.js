const test = require('node:test');
const assert = require('node:assert/strict');
const stylelint = require('stylelint');
const path = require('path');

const pluginPath = path.join(__dirname, '..', 'stylelint', 'require-layer.js');

function lint(code, { fix = false, config = {} } = {}) {
  return stylelint.lint({
    code,
    fix,
    config: {
      plugins: [pluginPath],
      rules: { 'capsule-ui/require-layer': config },
    },
  });
}

test('reports missing layer', async () => {
  const result = await lint('a{color:red}');
  assert.equal(result.errored, true);
  assert.equal(
    result.results[0].warnings[0].text,
    "Expected '@layer components' declaration. (capsule-ui/require-layer)"
  );
});

test('passes when layer is present', async () => {
  const result = await lint('@layer components;\na{color:red}');
  assert.equal(result.errored, false);
  assert.equal(result.results[0].warnings.length, 0);
});

test('auto-fixes missing layer', async () => {
  const result = await lint('a{color:red}', { fix: true });
  assert.equal(result.errored, false);
  assert.equal(result.output, '@layer components;\na{color:red}');
});

test('auto-fixes missing layer after @charset', async () => {
  const result = await lint('@charset "UTF-8";\na{color:red}', { fix: true });
  assert.equal(result.errored, false);
  assert.equal(
    result.output,
    '@charset "UTF-8";\n@layer components;\na{color:red}'
  );
});

test('supports custom layer name', async () => {
  const result = await lint('a{color:red}', { config: { name: 'custom' } });
  assert.equal(result.errored, true);
  assert.equal(
    result.results[0].warnings[0].text,
    "Expected '@layer custom' declaration. (capsule-ui/require-layer)"
  );

  const fixed = await lint('a{color:red}', {
    fix: true,
    config: { name: 'custom' },
  });
  assert.equal(fixed.errored, false);
  assert.equal(fixed.output, '@layer custom;\na{color:red}');
});

test('passes when layer is comma-separated', async () => {
  const result = await lint('@layer base, components;\na{color:red}');
  assert.equal(result.errored, false);
  assert.equal(result.results[0].warnings.length, 0);
});

test('ignores nested layer declarations', async () => {
  const css = '@media print {@layer components{a{color:red}}}';
  const result = await lint(css);
  assert.equal(result.errored, true);
  assert.equal(
    result.results[0].warnings[0].text,
    "Expected '@layer components' declaration. (capsule-ui/require-layer)"
  );
});

test('auto-fixes when only nested layer exists', async () => {
  const css = '@media print {@layer components{a{color:red}}}';
  const result = await lint(css, { fix: true });
  assert.equal(result.errored, false);
  assert.equal(result.output, '@layer components;\n' + css);
});
