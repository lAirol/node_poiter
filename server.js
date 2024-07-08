const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 5500;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(__dirname + '/index.html').pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket connected!');

  clients.add(ws);

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    let formattedMessage = `${message}`;
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log(formattedMessage);
        client.send(formattedMessage);
      }
    });
  });

  ws.send('Подключен');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
