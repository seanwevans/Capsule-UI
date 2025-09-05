# Testing Strategy

Capsule UI encourages a multi-layered approach to testing to keep components reliable, inclusive, and fast.

## Unit tests

Use Node's built-in [`node:test`](https://nodejs.org/api/test.html) module for logic and utilities. Tests live in the `tests/` directory and follow a simple pattern:

```js
const test = require('node:test');
...
test('traverseTokens visits all tokens', async () => {
  ...
});
```

Run all unit tests with:

```bash
pnpm test
```

## Accessibility tests

Automated accessibility checks prevent regressions. Capsule runs [`pa11y`](https://pa11y.org/) against example pages via `pnpm test:a11y`:

```js
await pa11y('examples/index.html', {
  chromeLaunchConfig: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});
```

For component-level accessibility, integrate [`axe-core`](https://github.com/dequelabs/axe-core) in browser-based tests (e.g., Playwright, Cypress).

## Visual regression tests

Visual regressions are best caught with screenshot comparisons. The project aims to use Storybook with Chromatic for cross-browser diffs, or Playwright's [`toMatchSnapshot`](https://playwright.dev/docs/test-assertions#to-match-snapshot) for code-driven comparisons.

## Performance budgets

Define budgets for bundle size and runtime metrics. Lighthouse CI, WebPageTest, or custom scripts can enforce limits. See the existing [performance benchmark](./performance-cost.md) for container queries and CSS variables as a starting point.

```bash
# Example: run Lighthouse with performance budgets
lighthouse http://localhost:3000 --budget-path=budgets.json
```

Keeping these tests in CI helps ensure Capsule UI stays correct, accessible, visually stable, and fast.
