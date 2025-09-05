import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

global.HTMLElement = class {};
global.customElements = { define() {}, get() { return undefined; } };

const { App } = await import('./App.js');

const app = express();

app.use('/client.js', express.static('client.js'));

app.get('/', (req, res) => {
  const appHtml = renderToString(
    React.createElement(App, { message: 'Hello from React SSR' })
  );

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>React SSR Example</title>
  <style>
    caps-button[variant="ghost"]::part(button) {
      background: transparent;
      border: 1px solid #4f46e5;
      color: #4f46e5;
    }
  </style>
</head>
<body>
  <div id="root">${appHtml}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000, () => {
  console.log('React SSR server running on http://localhost:3000');
});
