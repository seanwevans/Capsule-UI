# @capsule-ui/core

Preview package containing fundamental Capsule UI components.

## Components

- `<caps-button>` – styled button element.
- `<caps-input>` – basic text input.
- `<caps-card>` – surface container with padding and shadow.
- `<caps-tabs>` – tabbed interface using `slot="tab"` and `slot="panel"`.
- `<caps-modal>` – modal dialog shown when `open` attribute is present.

These components are early previews for experimentation and feedback.

The package also exposes a tiny theme runtime:

- `getTheme()` – returns the current theme name.
- `setTheme(name)` – sets `document.documentElement.dataset.theme` and emits a `capsule:themechange` event.
- `onThemeChange(cb)` – subscribe to theme changes; returns an unsubscribe function.
