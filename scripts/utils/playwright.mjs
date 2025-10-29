import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function ensureChromiumExecutable() {
  try {
    const executablePath = chromium.executablePath();
    if (executablePath && existsSync(executablePath)) {
      return executablePath;
    }
  } catch (error) {
    // fall through to installation attempt below
  }

  const playwrightBinary = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'playwright.cmd' : 'playwright'
  );

  const { status } = spawnSync(playwrightBinary, ['install', 'chromium'], {
    stdio: 'inherit'
  });

  if (status !== 0) {
    throw new Error('Failed to install Playwright Chromium browser');
  }

  const executablePath = chromium.executablePath();
  if (!existsSync(executablePath)) {
    throw new Error(`Chromium executable not found at ${executablePath}`);
  }

  return executablePath;
}

export function isChromiumUnavailable(error) {
  if (!error) {
    return false;
  }

  const details = `${error.message ?? ''}\n${error.stack ?? ''}`.toLowerCase();
  return (
    details.includes('error while loading shared libraries') ||
    details.includes('host system is missing dependencies') ||
    details.includes('failed to launch the browser process')
  );
}
