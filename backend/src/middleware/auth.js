const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist and are active
    const user = await db.findUserById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Invalid or expired token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access Denied',
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Specific role middleware
const requireAdmin = requireRole(['ADMIN']);
const requireManager = requireRole(['ADMIN', 'MANAGER']);
const requireEmployee = requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  requireEmployee
};