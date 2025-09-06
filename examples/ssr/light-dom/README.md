# Light DOM SSR Example

This example renders a plain `<button>` on the server with precompiled Capsule styles
loaded through a custom `<link rel="stylesheet" is='capsule-style'>` element. On the
client it upgrades the element to `<caps-button>` without causing layout shift.

Server output:

```html
<button data-caps-button class="button">Book now</button>
```

Client hydration:

```js
import './button.js';
const fallback = document.querySelector('[data-caps-button]');
const wc = document.createElement('caps-button');
wc.textContent = fallback.textContent;
fallback.replaceWith(wc);
```

## Running

```bash
node server.js
# visit http://localhost:3000
```
