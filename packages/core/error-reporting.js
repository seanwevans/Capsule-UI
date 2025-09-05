let handler = null;

export function enableErrorReporting(customHandler) {
  handler = customHandler || (globalThis.Sentry && globalThis.Sentry.captureException?.bind(globalThis.Sentry));
}

export function disableErrorReporting() {
  handler = null;
}

export function reportError(err) {
  try {
    handler?.(err);
  } catch {
    // ignore secondary errors
  }
}
