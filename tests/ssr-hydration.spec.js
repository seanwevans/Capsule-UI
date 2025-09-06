const { test, expect } = require('@playwright/test');

let createServer;
let server;
let port;

test.beforeAll(async () => {
  ({ createServer } = await import('../examples/ssr/light-dom/server.js'));
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

test.afterAll(() => server.close());

test('upgrades light DOM without layout shift', async ({ page }) => {
  await page.goto(`http://localhost:${port}`);
  await page.waitForSelector('caps-button');
  const cls = await page.evaluate(() => window.__getCLS());
  const hydration = await page.evaluate(() => window.__hydrationTime);
  expect(cls).toBeLessThan(0.01);
  expect(hydration).toBeLessThan(50);
  const tag = await page.locator('caps-button').evaluate((el) => el.tagName);
  expect(tag).toBe('CAPS-BUTTON');
});
