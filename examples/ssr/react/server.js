import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.js';

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
