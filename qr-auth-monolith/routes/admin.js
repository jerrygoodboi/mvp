const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models/database');

// Secret key (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

/**
 * Admin Login
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // For prototype, we check against the admins table
    const stmt = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?');
    const admin = stmt.get(username, password);

    if (!admin) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '12h' }
    );

    res.json({ message: 'Admin login successful', token });
});

/**
 * Admin Middleware: Check for admin role
 */
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not an admin');
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Access denied: Admin only' });
    }
};

/**
 * GET /api/admin/students
 */
router.get('/students', verifyAdmin, (req, res) => {
    try {
        const students = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * POST /api/admin/students/unbind
 * Reset a student's deviceId
 */
router.post('/students/unbind', verifyAdmin, (req, res) => {
    const { studentId } = req.body;
    try {
        const stmt = db.prepare('UPDATE users SET deviceId = NULL WHERE studentId = ?');
        const result = stmt.run(studentId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        console.log(`Admin unbinded device for ${studentId}`);
        res.json({ message: `Successfully unbinded device for student: ${studentId}` });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * POST /api/admin/students
 * Add a new student
 */
router.post('/students', verifyAdmin, (req, res) => {
    const { studentId, name, email } = req.body;
    if (!studentId || !name || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const stmt = db.prepare('INSERT INTO users (studentId, name, email) VALUES (?, ?, ?)');
        stmt.run(studentId, name, email);
        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Student ID or Email already exists' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * PUT /api/admin/students/:id
 * Update student data
 */
router.put('/students/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { studentId, name, email } = req.body;
    try {
        const stmt = db.prepare('UPDATE users SET studentId = ?, name = ?, email = ? WHERE id = ?');
        const result = stmt.run(studentId, name, email, id);
        if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * DELETE /api/admin/students/:studentId
 */
router.delete('/students/:studentId', verifyAdmin, (req, res) => {
    const { studentId } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM users WHERE studentId = ?');
        const result = stmt.run(studentId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ message: `Successfully deleted student: ${studentId}` });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * GET /api/admin/history
 */
router.get('/history', verifyAdmin, (req, res) => {
    try {
        const history = db.prepare('SELECT h.*, u.name FROM loginHistory h JOIN users u ON h.studentId = u.studentId ORDER BY h.timestamp DESC LIMIT 100').all();
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * GET /api/admin/sessions
 * View active QR sessions
 */
router.get('/sessions', verifyAdmin, (req, res) => {
    try {
        const sessions = db.prepare('SELECT * FROM sessions ORDER BY createdAt DESC LIMIT 20').all();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
