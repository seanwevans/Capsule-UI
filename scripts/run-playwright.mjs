import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { ensureChromiumExecutable, isChromiumUnavailable } from './utils/playwright.mjs';

async function ensureChromiumRunnable() {
  const executablePath = ensureChromiumExecutable();
  try {
    const browser = await chromium.launch({
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    await browser.close();
  } catch (error) {
    if (isChromiumUnavailable(error)) {
      console.warn(
        'Skipping Playwright tests because required system dependencies for Chromium are unavailable.'
      );
      process.exit(0);
    }
    throw error;
  }

  return executablePath;
}

(async () => {
  try {
    await ensureChromiumRunnable();
  } catch (error) {
    console.error('Unable to start Chromium for Playwright tests');
    console.error(error.message);
    process.exit(1);
  }

  const playwrightBinary = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'playwright.cmd' : 'playwright'
  );

  const args = process.argv.slice(2);

  const child = spawn(playwrightBinary, ['test', ...args], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_CLI_TARGET_LANG: 'js'
    }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
})();
