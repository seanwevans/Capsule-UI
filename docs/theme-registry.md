# Theme registry

A simple file‑based service stores and shares theme token presets for
Capsule UI.

## Run the service

```bash
node theme-registry/server.mjs
```

The server exposes a small API:

- `POST /themes` – upload a JSON token preset. Provide an optional
  `slug` field; otherwise a random one is generated.
- `GET /themes` – list available themes with their shareable URLs.
- `GET /themes/:slug` – fetch the JSON preset for a theme.

Uploaded themes are saved in `theme-registry/themes` and can be served
from any static host or CDN. Teams can point `setTheme` at the URL or
package the JSON for distribution on npm.

## Example

```
curl -X POST http://localhost:8080/themes \
  -H 'Content-Type: application/json' \
  -d '{"slug":"acme","tokens":{"color":{"brand":"#ff3b3b"}}}'

# later
curl http://localhost:8080/themes/acme
```

Use the [theming lab](./theming-lab.md) to craft palettes and export the
resulting JSON for upload.
