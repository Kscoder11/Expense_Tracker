const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Placeholder routes - will be implemented in later tasks
router.get('/', requireAdmin, (req, res) => {
  res.json({ message: 'Companies endpoint - to be implemented' });
});

module.exports = router;