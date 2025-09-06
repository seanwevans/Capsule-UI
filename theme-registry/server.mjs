import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const themesDir = path.join(process.cwd(), 'theme-registry', 'themes');
await fs.mkdir(themesDir, { recursive: true });

const authToken = process.env.THEME_REGISTRY_TOKEN;
const baseUrl = (process.env.THEME_REGISTRY_BASE_URL || '').replace(/\/$/, '');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sanitizeSlug(slug) {
  const s = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!s) throw new Error('invalid slug');
  return s;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/themes') {
    const files = await fs.readdir(themesDir);
    const themes = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const slug = f.replace(/\.json$/i, '');
        const url = `${baseUrl}/themes/${slug}`;
        return { slug, url };
      });
    return send(res, 200, themes);
  }
  if (req.method === 'GET' && url.pathname.startsWith('/themes/')) {
    const slug = url.pathname.split('/')[2];
    const file = path.join(themesDir, `${slug}.json`);
    try {
      const json = await fs.readFile(file, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(json);
    } catch {
      return send(res, 404, { error: 'not found' });
    }
  }
  if (req.method === 'POST' && url.pathname === '/themes') {
    if (authToken && req.headers.authorization !== `Bearer ${authToken}`) {
      return send(res, 401, { error: 'unauthorized' });
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const slug = sanitizeSlug(data.slug || randomUUID());
        const file = path.join(themesDir, `${slug}.json`);
        try {
          await fs.access(file);
          return send(res, 409, { error: 'slug exists' });
        } catch {
          await fs.writeFile(file, JSON.stringify(data.tokens || data, null, 2));
          const url = `${baseUrl}/themes/${slug}`;
          return send(res, 201, { slug, url });
        }
      } catch {
        return send(res, 400, { error: 'invalid JSON' });
      }
    });
    return;
  }
  return send(res, 404, { error: 'not found' });
});

const port = Number(process.env.PORT) || 8080;
server.listen(port, () => {
  console.log(`Theme registry running at http://localhost:${port}`);
});
