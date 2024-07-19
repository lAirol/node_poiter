const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 5500;

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const url = req.url;
        const filePath = __dirname + url;
        // Check for static file requests (index.html or Elements.js)
        if (url === '/' || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html')) {
            try {
                const readStream = fs.createReadStream(filePath);
                readStream.on('error', (err) => {
                    console.error(`Error reading file: ${err}`);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                });

                const contentType = url.endsWith('.js') ? 'text/javascript' : (url.endsWith('.css') ? "text/css" :'text/html'); // Set appropriate content type
                res.writeHead(200, { 'Content-Type': contentType });
                readStream.pipe(res);
            } catch (err) {
                console.error(`Error serving file: ${err}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' }); // Handle non-GET methods (optional)
        res.end('Method Not Allowed');
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
