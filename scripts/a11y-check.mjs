import pa11y from 'pa11y';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { ensureChromiumExecutable, isChromiumUnavailable } from './utils/playwright.mjs';

const fileUrl = pathToFileURL(path.join(process.cwd(), 'examples/index.html')).href;

(async () => {
  try {
    const chromePath = ensureChromiumExecutable();
    await pa11y(fileUrl, {
      chromeLaunchConfig: {
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    const browser = await chromium.launch({
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(fileUrl);
    const results = await new AxeBuilder({ page }).analyze();
    await context.close();
    await browser.close();
    if (results.violations.length) {
      console.error('Accessibility check failed');
      console.error(JSON.stringify(results.violations, null, 2));
      process.exit(1);
    }

    console.log('Accessibility check passed');
  } catch (err) {
    if (isChromiumUnavailable(err)) {
      console.warn(
        'Skipping accessibility checks because required system dependencies for Chromium are unavailable.'
      );
      process.exit(0);
    }
    console.error('Accessibility check failed');
    console.error(err.message);
    process.exit(1);
  }
})();
