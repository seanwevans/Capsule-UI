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
    if (req.url === '/button.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(buttonCss);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>CSS Modules SSR</title>
<link rel="stylesheet" href="/button.css" />
</head>
<body>
<button class="button variant-outline">Hello from SSR</button>
</body>
</html>`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer();
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`CSS Modules SSR example running at http://localhost:${port}`);
  });
}
