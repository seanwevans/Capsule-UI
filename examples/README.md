# Booking Widget Example

This directory demonstrates a minimal Capsule widget built with Shadow DOM.
Its internal action uses a `<button type="button">` element to avoid
unintended form submissions. The form collects a name, date, time, guest
count and optional notes.

## Usage

Include the widget on a page:

```html
<script type="module" src="./booking-widget.js"></script>
<booking-widget id="w"></booking-widget>
```

Theme it at runtime by changing CSS variables or the document's theme attribute:

```js
const w = document.getElementById('w');
w.style.setProperty('--bk-brand', '#ff3b3b');
document.documentElement.setAttribute('data-theme', 'dark');
```

Customize exposed parts safely:

```css
booking-widget::part(button) { text-transform: uppercase; }
booking-widget::part(card) { border-radius: 24px; }
```

Open `index.html` in a modern browser to see the widget and runtime theming in action.

## RTL and i18n demo

`rtl.html` showcases locale switching and right‑to‑left support for core
components using the exported `setLocale` helper.

`reduced-motion.html` demonstrates how Capsule components honor the user's
`prefers-reduced-motion` setting by disabling animations and smooth
transitions when appropriate.
