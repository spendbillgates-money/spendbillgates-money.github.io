const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
http.createServer((req, res) => {
  let requestUrl = req.url.split('?')[0].split('#')[0];
  
  // Clean URL redirects
  if (requestUrl === '/index.html' || requestUrl === '/index') {
    res.writeHead(301, { 'Location': '/' });
    return res.end();
  }
  if (requestUrl.endsWith('.html')) {
    const cleanUrl = requestUrl.substring(0, requestUrl.length - 5);
    res.writeHead(301, { 'Location': cleanUrl });
    return res.end();
  }

  let filePath = path.join(__dirname, requestUrl);
  if (requestUrl === '/' || requestUrl === '') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    // If the path does not have an extension, append .html for clean URL routing
    const ext = path.extname(filePath);
    if (!ext) {
      filePath += '.html';
    }
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(port);
console.log(`Server running at http://localhost:${port}/`);
