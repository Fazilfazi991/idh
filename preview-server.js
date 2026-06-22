const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!target.startsWith(root)) return response.writeHead(403).end('Forbidden');
  fs.readFile(target, (error, body) => {
    if (error) return response.writeHead(404).end('Not found');
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  });
}).listen(8080, '127.0.0.1');
