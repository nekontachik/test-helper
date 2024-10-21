const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('server.js: Initializing custom server');
console.log('server.js: Environment:', process.env.NODE_ENV);
console.log('server.js: Current working directory:', process.cwd());

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('server.js: Ready on http://localhost:3000');
  });
});
