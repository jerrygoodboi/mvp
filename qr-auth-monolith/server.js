require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();

// Load SSL certificates
const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

const server = https.createServer(options, app);

// Environment variables
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // For local dev with IP addresses, allow all
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Initialize WebSocket server on the /socket path
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
        // Optionally handle incoming messages from client
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
    
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Handle upgrade for WebSocket
server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;

    if (pathname === '/socket') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// Pass wss to auth routes
authRoutes.setWss(wss);

// Routes
app.use('/api/auth', authRoutes);

// Serve the PWA scanner
app.use('/scanner', express.static(path.join(__dirname, '../qr-scanner-pwa')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route for any request that doesn't match an API route
app.get('*', (req, res) => {
    // If request is for an API, send the React frontend
    if (!req.url.startsWith('/api') && !req.url.startsWith('/scanner')) {
        const buildPath = path.join(__dirname, 'client', 'build', 'index.html');
        res.sendFile(buildPath);
    } else if (req.url.startsWith('/scanner')) {
        res.sendFile(path.join(__dirname, '../qr-scanner-pwa', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
    console.log(`HTTPS Monolith Server is running on https://localhost:${PORT}`);
    console.log(`Secure WebSocket server is running on wss://localhost:${PORT}/socket`);
});
