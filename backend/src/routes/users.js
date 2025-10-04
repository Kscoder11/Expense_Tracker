const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, requireManager } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (Admin/Manager only)
router.get('/', requireManager, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    const filters = {
      companyId: req.user.companyId,
      search,
      role
    };

    const users = await db.findManyUsers(filters);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    res.json({
      users: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.length / limit),
        totalUsers: users.length,
        hasNext: endIndex < users.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Please try again later.'
    });
  }
});

// GET /api/users/managers - Get all managers for assignment
router.get('/managers', requireManager, async (req, res) => {
  try {
    const managers = await db.findManyUsers({
      companyId: req.user.companyId,
      role: 'MANAGER'
    });
    
    res.json(managers.map(manager => ({
      id: manager.id,
      fullName: manager.fullName,
      email: manager.email
    })));
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({
      error: 'Failed to fetch managers',
      message: 'Please try again later.'
    });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', requireAdmin, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
  body('role').isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Invalid role'),
  body('managerId').optional().isString().withMessage('Manager ID must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const { email, password, fullName, role, managerId } = req.body;

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email already exists'
      });
    }

    // Validate manager assignment
    if (role === 'EMPLOYEE' && managerId) {
      const manager = await db.findUserById(managerId);
      if (!manager || manager.role !== 'MANAGER' || manager.companyId !== req.user.companyId) {
        return res.status(400).json({
          error: 'Invalid Manager',
          message: 'Selected manager is not valid'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      fullName,
      role,
      companyId: req.user.companyId,
      managerId: role === 'EMPLOYEE' ? managerId : null
    };

    const newUser = await db.createUser(userData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'User Creation Failed',
      message: 'Unable to create user. Please try again later.'
    });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', requireAdmin, [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Invalid role'),
  body('managerId').optional().isString().withMessage('Manager ID must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { fullName, role, managerId, isActive } = req.body;

    // Check if user exists and belongs to same company
    const existingUser = await db.findUserById(id);
    if (!existingUser || existingUser.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found or access denied'
      });
    }

    // Validate manager assignment
    if (role === 'EMPLOYEE' && managerId) {
      const manager = await db.findUserById(managerId);
      if (!manager || manager.role !== 'MANAGER' || manager.companyId !== req.user.companyId) {
        return res.status(400).json({
          error: 'Invalid Manager',
          message: 'Selected manager is not valid'
        });
      }
    }

    // Update user
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (role !== undefined) {
      updateData.role = role;
      updateData.managerId = role === 'EMPLOYEE' ? managerId : null;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await db.updateUser(id, updateData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'User Update Failed',
      message: 'Unable to update user. Please try again later.'
    });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and belongs to same company
    const existingUser = await db.findUserById(id);
    if (!existingUser || existingUser.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found or access denied'
      });
    }

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot Delete Self',
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete user
    await db.deleteUser(id);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'User Deletion Failed',
      message: 'Unable to delete user. Please try again later.'
    });
  }
});

// GET /api/users/stats - Get user statistics (Admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const users = await db.findManyUsers({ companyId: req.user.companyId });
    
    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      managers: users.filter(u => u.role === 'MANAGER').length,
      employees: users.filter(u => u.role === 'EMPLOYEE').length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'Please try again later.'
    });
  }
});

module.exports = router;