# CSS Modules SSR Example

Renders the CSS Modules flavor of Capsule on the server and preloads the stylesheet to avoid flashes of unstyled content.

Server output:

```html
<button class="button variant-outline">Book now</button>
```

The stylesheet is linked in the document head so the first paint is styled.

## Running

```bash
node server.js
# visit http://localhost:3000
```
