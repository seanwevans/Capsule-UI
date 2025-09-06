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

Automated accessibility checks prevent regressions. Capsule runs both
[`pa11y`](https://pa11y.org/) and [`axe-core`](https://github.com/dequelabs/axe-core)
against example pages via `pnpm test:a11y`:

```js
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const chromePath = chromium.executablePath();
await pa11y('examples/index.html', {
  chromeLaunchConfig: {
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('examples/index.html');
await new AxeBuilder({ page }).analyze();
await context.close();
await browser.close();
```

Playwright, Cypress, or other browser-based tests can also import the
`@axe-core` helpers to validate individual components.

## Visual regression tests

Visual regressions are best caught with screenshot comparisons. The project aims to use Storybook with Chromatic for cross-browser diffs, or Playwright's [`toMatchSnapshot`](https://playwright.dev/docs/test-assertions#to-match-snapshot) for code-driven comparisons.

## Performance budgets

Define budgets for bundle size and runtime metrics. Lighthouse CI, WebPageTest, or custom scripts can enforce limits. See the existing [performance benchmark](./performance-cost.md) for container queries and CSS variables as a starting point.

```bash
# Example: run Lighthouse with performance budgets
lighthouse http://localhost:3000 --budget-path=budgets.json
```

Keeping these tests in CI helps ensure Capsule UI stays correct, accessible, visually stable, and fast.
