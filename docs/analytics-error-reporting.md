# Analytics and Error Reporting

Capsule UI exposes opt-in hooks to record anonymous usage metrics and report runtime errors.

## Usage analytics

```js
import { enableAnalytics, disableAnalytics } from '@capsule-ui/core';

enableAnalytics({ endpoint: '/internal/analytics' });
```

Components report load counts and variant selections. Data is aggregated in-memory and periodically POSTed to the provided endpoint. Call `disableAnalytics()` to stop reporting.

## Error reporting

```js
import { enableErrorReporting, disableErrorReporting } from '@capsule-ui/core';

enableErrorReporting(); // uses window.Sentry.captureException if present
```

Lifecycle methods are wrapped in `try/catch` blocks; any exceptions are forwarded to the configured handler. Provide a custom function to send errors elsewhere, or call `disableErrorReporting()` to turn it off.
