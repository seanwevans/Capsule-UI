# @capsule-ui/core

Preview package containing fundamental Capsule UI components.

## Components

- `<caps-button>` – styled button element.
- `<caps-input>` – basic text input.
- `<caps-card>` – surface container with padding and shadow.
- `<caps-tabs>` – tabbed interface using `slot="tab"` and `slot="panel"`.
- `<caps-modal>` – modal dialog shown when `open` attribute is present.

These components are early previews for experimentation and feedback.

## Accessibility

| Component | ARIA roles / attributes | Keyboard traps |
| --- | --- | --- |
| `<caps-button>` | inherits native `<button>` semantics | none |
| `<caps-input>` | native `<input type="text">` semantics | none |
| `<caps-card>` | `role="group"` container | none |
| `<caps-tabs>` | host `role="tablist"`; slotted tabs/panels get `role="tab"`/`role="tabpanel"` | none (arrow keys move focus) |
| `<caps-modal>` | `role="dialog"` with `aria-modal="true"` | focus stays inside while open, `Escape` closes |
| `<caps-select>` | wraps native `<select>` element | none |

## Localization

`getLocale`, `setLocale`, `onLocaleChange`, `formatNumber`, and
`formatDate` are exported to make components and host apps locale-aware.

## Analytics and Error Reporting

Usage metrics and error reporting are disabled by default. To opt in:

```js
import { enableAnalytics, enableErrorReporting } from '@capsule-ui/core';

enableAnalytics({ endpoint: '/internal/analytics' });
enableErrorReporting(); // uses window.Sentry.captureException if available
```

Disable at any time with `disableAnalytics()` and `disableErrorReporting()`.
