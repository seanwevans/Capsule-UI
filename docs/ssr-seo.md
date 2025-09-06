# SSR & SEO

Server-side rendering improves perceived performance and lets search engines index
Capsule components. Render minimal light DOM markup on the server and upgrade it on the
client once the component JavaScript loads.

```html
<!-- Server output -->
<button data-caps-button class="button">Book now</button>
```

```js
// Client hydration
import './button.js';
const btn = document.querySelector('[data-caps-button]');
const ce = document.createElement('caps-button');
ce.textContent = btn.textContent;
btn.replaceWith(ce);
```

Framework integrations under `examples/ssr/` show the pattern for React, Vue and Svelte.
CSS for Web Components can be loaded ahead of time with a customized link element:

```html
<link rel="stylesheet" is="capsule-style" data-module="caps-button" href="/button.css" />
```

The `capsule-style` element registers the loaded `CSSStyleSheet` so components can
adopt it during hydration and avoid a flash of unstyled content. The `light-dom`
sample illustrates measuring Cumulative Layout Shift during upgrade and records the
hydration time budget with a Playwright test.
