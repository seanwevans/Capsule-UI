# Performance Budgets

Capsule enforces budgets for key metrics during continuous integration:

- **Bundle size** – `dist/tokens.js` must not exceed **5KB**. The `check:bundle-size`
  script fails the build if the budget is exceeded.
- **Hydration runtime** – upgrading a server-rendered `<button>` to `<caps-button>` must
  finish in under **50ms** and cause less than **0.01** Cumulative Layout Shift. The
  `ssr-hydration.spec.js` Playwright test verifies these budgets.

These checks run as part of `pnpm test` in CI.
