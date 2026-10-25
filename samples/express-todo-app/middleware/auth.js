// middleware/auth.js
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Simulated token validation
  if (token === 'valid-metamorph-secret') {
    req.user = { id: 'user_101', role: 'admin' };
    next();
  } else {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateToken
};
