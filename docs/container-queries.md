# Container queries

Capsule components rely on CSS `@container` rules to adapt to the size
of their host element instead of the viewport. Each component defines a
logical container so padding, layout and orientation respond to local
space.

## Approach

- Scope queries to the smallest element that needs them to limit style
  recalculations.
- Use semantic breakpoints like `--caps-size-md` instead of hard-coded
  pixel values when possible.

## Testing

Use a browser automation tool to resize the component's container and
assert style changes. Example with Playwright:

```ts
import { test, expect } from '@playwright/test';

test('card padding updates at 600px', async ({ page }) => {
  await page.goto('/examples/index.html');
  const card = page.locator('caps-card').first();
  await card.evaluate(el => (el.style.width = '400px'));
  await expect(card).toHaveCSS('padding', '16px');
  await card.evaluate(el => (el.style.width = '700px'));
  await expect(card).toHaveCSS('padding', '24px');
});
```

Include these checks in CI to ensure responsive behaviour stays intact.
