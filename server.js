import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/api.js', ['api.js', 'text/javascript']],
  ['/styles.css', ['styles.css', 'text/css']],
]);

const server = createServer(async (request, response) => {
  if (request.headers.host !== '127.0.0.1:3000' && request.headers.host !== 'localhost:3000') {
    response.writeHead(403).end('Forbidden host');
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const file = files.get(request.url);
  if (!file) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const content = await readFile(new URL(`./public/${file[0]}`, import.meta.url));
    response.writeHead(200, {
      'Content-Type': `${file[1]}; charset=utf-8`,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self'; connect-src https://localhost:5002; script-src 'self'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500).end('Unable to serve application');
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('AUTONAMO v1.0: http://127.0.0.1:3000');
  console.log('API target: https://localhost:5002');
});
