require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'QR Auth Backend is running' });
});

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}/socket`);
});
