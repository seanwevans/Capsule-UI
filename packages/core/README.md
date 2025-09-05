# @capsule-ui/core

Preview package containing fundamental Capsule UI components.

## Components

- `<caps-button>` – styled button element.
- `<caps-input>` – basic text input.
- `<caps-card>` – surface container with padding and shadow.
- `<caps-tabs>` – tabbed interface using `slot="tab"` and `slot="panel"`.
- `<caps-modal>` – modal dialog shown when `open` attribute is present.

These components are early previews for experimentation and feedback.

## Analytics and Error Reporting

Usage metrics and error reporting are disabled by default. To opt in:

```js
import { enableAnalytics, enableErrorReporting } from '@capsule-ui/core';

enableAnalytics({ endpoint: '/internal/analytics' });
enableErrorReporting(); // uses window.Sentry.captureException if available
```

Disable at any time with `disableAnalytics()` and `disableErrorReporting()`.
