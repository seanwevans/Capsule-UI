import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buttonCss = readFileSync(
  resolve(__dirname, '../../../packages/core/button.module.css'),
  'utf8'
);

export function createServer() {
  return http.createServer((req, res) => {
    if (req.url && req.url.endsWith('.js')) {
      try {
        const js = readFileSync(
          resolve(__dirname, '../../../packages/core' + req.url),
          'utf8'
        );
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(js);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Light DOM SSR</title>
<style>${buttonCss}</style>
<script>
  let cls = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) cls += entry.value;
    }
  }).observe({ type: 'layout-shift', buffered: true });
  window.__getCLS = () => cls;
</script>
</head>
<body>
<button data-caps-button class="button">Hello from SSR</button>
<script type="module">
  import './button.js';
  const btn = document.querySelector('[data-caps-button]');
  const ce = document.createElement('caps-button');
  ce.textContent = btn.textContent;
  btn.replaceWith(ce);
</script>
</body>
</html>`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer();
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Light DOM SSR example running at http://localhost:${port}`);
  });
}
