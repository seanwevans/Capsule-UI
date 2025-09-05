const test = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../packages/eslint-config-capsule/require-layer');

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2022 } });

test('reports missing layer in css tagged template', () => {
  tester.run('capsule-ui/require-layer', rule, {
    valid: [{ code: "css`@layer components { color: red; }`" }],
    invalid: [
      {
        code: "css`color: red;`",
        errors: [{ message: "Expected '@layer components' declaration." }],
      },
    ],
  });
});
