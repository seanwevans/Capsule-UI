# SSR & SEO

Server-side rendering improves perceived performance and lets search engines index
Capsule components.

### Hydrating custom elements with light‑DOM fallbacks

Render minimal light DOM markup on the server and upgrade it on the
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

### Server-rendering CSS Modules

Framework adapters ship a CSS Module for each component. When rendering on the
server, load that stylesheet ahead of time and include it in the HTML so the
first paint is styled (see `examples/ssr/css-modules`):

```js
import { readFileSync } from 'node:fs';
const buttonCss = readFileSync('node_modules/@capsule-ui/core/button.module.css', 'utf8');

res.send(`<!doctype html><head><style>${buttonCss}</style></head>...`);
```

Alternatively, serve the CSS file and link it in the `<head>`:

```html
<link rel="stylesheet" href="/button.css" />
```

### Avoiding flashes of unstyled content

Web Component styles can be pre-registered with a customized link element so
Shadow‑DOM variants adopt the `CSSStyleSheet` immediately during hydration:

```html
<link rel="stylesheet" is="capsule-style" data-module="caps-button" href="/button.css" />
```

The `capsule-style` element registers the loaded sheet and prevents a flash of
unstyled content. The `light-dom` sample illustrates measuring Cumulative Layout
Shift during upgrade and records the hydration time budget with a Playwright
test.

### Framework pitfalls

- **Next.js:** CSS Modules imported only on the client cause class name mismatches
  and FOUC. Import the Capsule stylesheet in the server layer (e.g. `app/layout`)
  or inline it with `next/head`. Streaming responses should flush style links
  before any component markup to avoid unstyled flashes.
- **Nuxt:** Register custom elements in `nuxt.config` under `build.transpile` and
  include the Capsule CSS file in the `css` array. Omitting either results in the
  component rendering without styles until hydration completes.

See `examples/ssr/` for complete integrations and Playwright tests.
