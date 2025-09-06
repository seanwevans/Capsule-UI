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

Framework integrations under [`examples/ssr`](../examples/ssr/) include concrete setups for
[React](../examples/ssr/react), [Vue](../examples/ssr/vue) and [Svelte](../examples/ssr/svelte).
Each example inlines precompiled Capsule CSS modules to avoid a flash of unstyled
content before hydration. The `light-dom` sample illustrates measuring Cumulative Layout
Shift during upgrade; a passing Playwright test ensures the layout stays stable.
