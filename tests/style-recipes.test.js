const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('core package exports style recipes for each component', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../packages/core/package.json'), 'utf8'));
  const components = ['button', 'card', 'input', 'tabs', 'modal', 'select'];
  for (const name of components) {
    assert.ok(fs.existsSync(path.join(__dirname, `../packages/core/${name}.recipe.js`)), `${name} recipe missing`);
    assert.ok(pkg.exports[`./${name}.recipe`], `package.json missing export for ${name}`);
  }
});

