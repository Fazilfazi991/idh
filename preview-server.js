const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };
const youtubeInsights = require('./api/youtube-insights');

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/api/youtube-insights') {
    youtubeInsights(request, response).catch((error) => {
      console.error(error);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ items: [], fallback: true, error: 'Unable to fetch YouTube videos.' }));
    });
    return;
  }
  const target = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!target.startsWith(root)) return response.writeHead(403).end('Forbidden');
  fs.readFile(target, (error, body) => {
    if (error) return response.writeHead(404).end('Not found');
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  });
}).listen(port, '127.0.0.1');
