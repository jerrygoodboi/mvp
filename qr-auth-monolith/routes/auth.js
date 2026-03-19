const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { generateQRCode } = require('../utils/qrGenerator');
const { authenticateToken } = require('../middleware/auth');
const WebSocket = require('ws');

// Get the JWT secret from env or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Pass wss to router (will be set in server.js)
let wss;
router.setWss = (webSocketServer) => {
    wss = webSocketServer;
};

/**
 * POST /api/auth/generate-qr
 * Generates a unique QR code and creates a session
 */
router.post('/generate-qr', async (req, res) => {
    try {
        const sessionId = uuidv4();
        
        // QR token containing session info
        const qrTokenPayload = { sessionId, type: 'qr_login' };
        const qrToken = jwt.sign(qrTokenPayload, JWT_SECRET, { expiresIn: '60s' });
        
        // Generate QR code base64 image
        const qrImageBase64 = await generateQRCode(qrToken);
        
        // Calculate expiration (60 seconds from now)
        const expiresAt = new Date(Date.now() + 60000).toISOString();
        
        // Save session in DB
        const stmt = db.prepare('INSERT INTO sessions (sessionId, qrToken, expiresAt) VALUES (?, ?, ?)');
        stmt.run(sessionId, qrToken, expiresAt);
        
        console.log(`QR Session created: ${sessionId}`);
        
        res.status(200).json({
            sessionId,
            qrCode: qrImageBase64,
            expiresIn: 60
        });
    } catch (err) {
        console.error('Error in /generate-qr:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/verify-qr
 * Validates the session and returns an authentication token
 */
router.post('/verify-qr', (req, res) => {
    const { sessionId, studentId } = req.body;

    if (!sessionId || !studentId) {
        return res.status(400).json({ error: 'Session ID and Student ID are required' });
    }

    try {
        // Find user
        const userStmt = db.prepare('SELECT * FROM users WHERE studentId = ?');
        const user = userStmt.get(studentId);
        
        if (!user) {
            console.log(`Verification failed: User ${studentId} not found`);
            // Log failed attempt
            const logStmt = db.prepare('INSERT INTO loginHistory (studentId, method, success) VALUES (?, ?, ?)');
            logStmt.run(studentId, 'qr', 0);
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check session
        const sessionStmt = db.prepare('SELECT * FROM sessions WHERE sessionId = ?');
        const session = sessionStmt.get(sessionId);
        
        if (!session) {
            console.log(`Verification failed: Session ${sessionId} not found`);
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if scanned already
        if (session.scanned) {
            console.log(`Verification failed: Session ${sessionId} already scanned`);
            return res.status(400).json({ error: 'QR code already scanned' });
        }

        // Check expiration
        if (new Date(session.expiresAt) < new Date()) {
            console.log(`Verification failed: Session ${sessionId} expired`);
            return res.status(400).json({ error: 'QR code session expired' });
        }

        // Mark as scanned
        const updateStmt = db.prepare('UPDATE sessions SET scanned = 1 WHERE sessionId = ?');
        updateStmt.run(sessionId);

        // Generate 24-hour auth token
        const authToken = jwt.sign(
            { id: user.id, studentId: user.studentId, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log successful attempt
        const logStmt = db.prepare('INSERT INTO loginHistory (studentId, method, success) VALUES (?, ?, ?)');
        logStmt.run(studentId, 'qr', 1);

        console.log(`User ${studentId} successfully verified QR session ${sessionId}`);

        // Notify WebSocket clients (e.g., the browser displaying the QR code)
        if (wss) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    // Send to all clients, or you could map sessionId to client connection for targeted messages
                    client.send(JSON.stringify({
                        event: 'authenticated',
                        sessionId,
                        studentInfo: {
                            studentId: user.studentId,
                            name: user.name,
                            email: user.email
                        }
                    }));
                }
            });
            console.log(`Emitted 'authenticated' event for session ${sessionId}`);
        }

        res.status(200).json({
            message: 'Authentication successful',
            token: authToken,
            user: {
                studentId: user.studentId,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Error in /verify-qr:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/auth/validate
 * Validates the auth token and returns user info
 */
router.get('/validate', authenticateToken, (req, res) => {
    // If authenticateToken passes, req.user will be populated
    console.log(`Token validated for user: ${req.user.studentId}`);
    res.status(200).json({
        valid: true,
        user: req.user
    });
});

module.exports = router;
