const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters long'),
  body('country').notEmpty().withMessage('Country is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const countryService = require('../config/countries');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// GET /api/auth/countries - Get countries with caching
router.get('/countries', async (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    
    if (includeAll) {
      // Return full list (cached or fetched)
      const countries = await countryService.getFullCountries();
      res.json(countries);
    } else {
      // Return top countries instantly
      const countries = countryService.getTopCountries();
      res.json(countries);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      error: 'Failed to fetch countries',
      message: 'Unable to load country list. Please try again later.'
    });
  }
});

// POST /api/auth/signup - User registration
router.post('/signup', signupValidation, async (req, res) => {
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

    const { email, password, fullName, companyName, country } = req.body;

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'An account with this email already exists'
      });
    }

    // Get currency for the selected country
    const currency = countryService.getCurrencyForCountry(country);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create company and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          country,
          baseCurrency: currency
        }
      });

      // Create user as admin of the company
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: 'ADMIN',
          companyId: company.id,
          isActive: true
        },
        include: {
          company: true
        }
      });

      return { user, company };
    });

    // Generate JWT token
    const token = generateToken(result.user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: 'Unable to create account. Please try again later.'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', loginValidation, async (req, res) => {
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

    const { email, password } = req.body;

    // Find user with company information
    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact your administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'Unable to log in. Please try again later.'
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user information',
      message: 'Please try again later.'
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage. This endpoint exists for consistency
  // and could be extended to implement token blacklisting if needed.
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;