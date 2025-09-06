# Light DOM SSR Example

This example renders a plain `<button>` on the server with precompiled Capsule styles
loaded through a custom `<link rel="stylesheet" is='capsule-style'>` element. On the
client it upgrades the element to `<caps-button>` without causing layout shift.

## Running

```bash
node server.js
# visit http://localhost:3000
```
