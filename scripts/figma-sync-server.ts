import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';

const port = Number(process.env.FIGMA_SYNC_PORT) || 4141;
const root = path.join(__dirname, '..');
const tokensPath = path.join(root, 'tokens', 'source', 'tokens.json');
const registryUrl = process.env.THEME_REGISTRY_URL;
const registryToken = process.env.THEME_REGISTRY_TOKEN;
const registrySlug = process.env.THEME_REGISTRY_SLUG || 'figma-sync';

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/tokens') {
    try {
      const json = await fs.readFile(tokensPath, 'utf8');
      res.setHeader('Content-Type', 'application/json');
      res.write(json);
      res.end();
    } catch (err) {
      res.statusCode = 500;
      res.end(String(err));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/tokens') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        await fs.writeFile(tokensPath, body);
        const child = spawn('pnpm', ['tokens:build'], { cwd: root, stdio: 'inherit' });
        child.on('close', async code => {
          if (code === 0) {
            if (registryUrl) {
              try {
                const tokens = JSON.parse(await fs.readFile(tokensPath, 'utf8'));
                const base = registryUrl.replace(/\/$/, '');
                await fetch(`${base}/themes`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(registryToken ? { Authorization: `Bearer ${registryToken}` } : {})
                  },
                  body: JSON.stringify({ slug: registrySlug, tokens })
                });
              } catch (err) {
                console.error('Failed to publish theme', err);
              }
            }
            res.statusCode = 200;
            res.end('ok');
          } else {
            res.statusCode = 500;
            res.end('build failed');
          }
        });
      } catch (err) {
        res.statusCode = 500;
        res.end(String(err));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Figma sync server listening on http://localhost:${port}`);
});
