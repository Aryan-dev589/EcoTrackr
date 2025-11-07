// backend/middleware/checkAuth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.sendStatus(403); // Forbidden (token is invalid)
        }
        
        req.user = payload.user; 
        next(); // Token is good, proceed
    });
}

module.exports = { authenticateToken };