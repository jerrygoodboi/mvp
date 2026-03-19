const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        console.log('Authentication failed: No token provided');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        req.user = decoded; // Contains studentId and other payload info
        console.log(`Authentication successful for user: ${req.user.studentId}`);
        next();
    } catch (err) {
        console.error('Authentication failed: Invalid token', err.message);
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = {
    authenticateToken
};
