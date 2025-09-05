import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';

const port = Number(process.env.FIGMA_SYNC_PORT) || 4141;
const root = path.join(__dirname, '..');
const tokensPath = path.join(root, 'tokens', 'source', 'tokens.json');

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
        child.on('close', code => {
          res.statusCode = code === 0 ? 200 : 500;
          res.end(code === 0 ? 'ok' : 'build failed');
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
