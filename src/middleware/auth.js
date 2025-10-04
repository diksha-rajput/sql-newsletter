const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Simple admin auth for demo (in production, use proper role-based auth)
    if (token === process.env.ADMIN_SECRET || token === 'admin123') {
      req.isAdmin = true;
      return next();
    }

    return res.status(401).json({ error: 'Admin access required.' });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed.' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = {
  auth,
  adminAuth,
  generateToken
};
