# Booking Widget Example

This directory demonstrates a minimal Capsule widget built with Shadow DOM.

## Usage

Include the widget on a page:

```html
<script type="module" src="./booking-widget.js"></script>
<booking-widget id="w"></booking-widget>
```

Theme it at runtime by changing CSS variables or attributes:

```js
const w = document.getElementById('w');
w.style.setProperty('--bk-brand', '#ff3b3b');
w.setAttribute('theme', 'dark');
```

Customize exposed parts safely:

```css
booking-widget::part(button) { text-transform: uppercase; }
booking-widget::part(card) { border-radius: 24px; }
```

Open `index.html` in a modern browser to see the widget and runtime theming in action.
