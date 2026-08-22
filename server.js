const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const DB_FILE = path.join(__dirname, 'db.json');

// MIME types lookup
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.xml': 'text/xml',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    // 1. GET /api/state
    if (req.method === 'GET' && req.url === '/api/state') {
        fs.readFile(DB_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Could not read database file' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // 2. POST /api/state
    if (req.method === 'POST' && req.url === '/api/state') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                // Verify it's valid JSON
                const parsed = JSON.parse(body);
                fs.writeFile(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Could not write database file' }));
                    }

                    // Auto-sync with GitHub
                    console.log("Database updated locally. Syncing changes with GitHub...");
                    exec('git add db.json && git commit -m "data: sync database changes from admin panel" && git push origin main', (gitErr, stdout, stderr) => {
                        if (gitErr) {
                            console.error("Git sync error:", stderr || gitErr.message);
                        } else {
                            console.log("Git sync successful:", stdout.trim());
                        }
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Database updated and synced with GitHub' }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // 3. Static File Server
    let filePath = req.url === '/' || req.url === '' ? 'index.html' : req.url.split('?')[0];
    filePath = path.join(__dirname, filePath);

    // Security check: ensure path is inside __dirname
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Serve 404 page
            fs.readFile(path.join(__dirname, '404.html'), (err404, data404) => {
                if (err404) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data404);
                }
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`VortexApps Local Sync Server running at http://localhost:${PORT}`);
});
