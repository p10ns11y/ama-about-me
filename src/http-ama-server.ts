import http from 'http';

import { setupOllama } from './setup-ollama.ts';
import { check } from './check.ts';

let PORT = 3000;

// TODO: Improve using https://nodejs.org/api/stream.html
const server = http.createServer((req, res) => {
  void setupOllama(); /*.then((status) => {
    res.write(`ollama status is: ${status}`);
  }); */
  void check('retrieveUsingInMemory');

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end('This is a simple Node.js server.\n');
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
