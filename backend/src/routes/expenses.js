const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireEmployee } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// GET /api/expenses - Get expenses with filters
router.get('/', requireEmployee, async (req, res) => {
  try {
    const { 
      status, 
      category, 
      dateFrom, 
      dateTo, 
      search, 
      page = 1, 
      limit = 10,
      submittedById 
    } = req.query;

    const filters = {
      companyId: req.user.companyId
    };

    // Role-based filtering
    if (req.user.role === 'EMPLOYEE') {
      filters.submittedById = req.user.id;
    } else if (submittedById) {
      filters.submittedById = submittedById;
    }

    // Apply other filters
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;

    const expenses = await db.findManyExpenses(filters);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedExpenses = expenses.slice(startIndex, endIndex);
    
    res.json({
      expenses: paginatedExpenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(expenses.length / limit),
        totalExpenses: expenses.length,
        hasNext: endIndex < expenses.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      error: 'Failed to fetch expenses',
      message: 'Please try again later.'
    });
  }
});

// GET /api/expenses/:id - Get expense by ID
router.get('/:id', requireEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await db.findExpenseById(id);

    if (!expense) {
      return res.status(404).json({
        error: 'Expense Not Found',
        message: 'The requested expense was not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'EMPLOYEE' && expense.submittedById !== req.user.id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only view your own expenses'
      });
    }

    if (expense.companyId !== req.user.companyId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You cannot access this expense'
      });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      error: 'Failed to fetch expense',
      message: 'Please try again later.'
    });
  }
});

// POST /api/expenses - Create new expense
router.post('/', requireEmployee, upload.single('receipt'), [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('convertedAmount').optional().isFloat({ min: 0.01 }).withMessage('Converted amount must be a positive number'),
  body('baseCurrency').optional().isLength({ min: 3, max: 3 }).withMessage('Base currency must be a 3-letter code'),
  body('exchangeRate').optional().isFloat({ min: 0.01 }).withMessage('Exchange rate must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('vendor').optional().trim().isLength({ min: 1 }).withMessage('Vendor cannot be empty'),
  body('expenseDate').isISO8601().withMessage('Valid expense date is required'),
  body('ocrExtracted').optional().isBoolean().withMessage('OCR extracted must be boolean'),
  body('ocrConfidence').optional().isFloat({ min: 0, max: 1 }).withMessage('OCR confidence must be between 0 and 1')
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

    const {
      amount,
      currency,
      convertedAmount,
      baseCurrency,
      exchangeRate,
      category,
      description,
      vendor,
      expenseDate,
      ocrExtracted,
      ocrConfidence
    } = req.body;

    // Validate expense date is not in the future
    const expDate = new Date(expenseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (expDate > today) {
      return res.status(400).json({
        error: 'Invalid Date',
        message: 'Expense date cannot be in the future'
      });
    }

    // Create expense data
    const expenseData = {
      amount: parseFloat(amount),
      currency,
      convertedAmount: convertedAmount ? parseFloat(convertedAmount) : null,
      baseCurrency: baseCurrency || null,
      exchangeRate: exchangeRate ? parseFloat(exchangeRate) : null,
      category,
      description,
      vendor: vendor || null,
      expenseDate: expDate.toISOString(),
      receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
      ocrExtracted: ocrExtracted === 'true' || ocrExtracted === true,
      ocrConfidence: ocrConfidence ? parseFloat(ocrConfidence) : null,
      submittedById: req.user.id,
      companyId: req.user.companyId
    };

    const expense = await db.createExpense(expenseData);

    // Create initial approval record
    await db.createApproval({
      expenseId: expense.id,
      approverId: req.user.managerId || req.user.id, // Fallback to self if no manager
      status: 'PENDING'
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      error: 'Expense Creation Failed',
      message: 'Unable to create expense. Please try again later.'
    });
  }
});

// PUT /api/expenses/:id - Update expense (only if pending and own expense)
router.put('/:id', requireEmployee, upload.single('receipt'), [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('expenseDate').optional().isISO8601().withMessage('Valid expense date is required')
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
    const expense = await db.findExpenseById(id);

    if (!expense) {
      return res.status(404).json({
        error: 'Expense Not Found',
        message: 'The requested expense was not found'
      });
    }

    // Check permissions
    if (expense.submittedById !== req.user.id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only edit your own expenses'
      });
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot Edit',
        message: 'You can only edit pending expenses'
      });
    }

    // Prepare update data
    const updateData = {};
    const { amount, currency, category, description, expenseDate } = req.body;

    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (currency !== undefined) updateData.currency = currency;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (expenseDate !== undefined) {
      const expDate = new Date(expenseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (expDate > today) {
        return res.status(400).json({
          error: 'Invalid Date',
          message: 'Expense date cannot be in the future'
        });
      }
      updateData.expenseDate = expDate.toISOString();
    }

    if (req.file) {
      updateData.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    const updatedExpense = await db.updateExpense(id, updateData);

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      error: 'Expense Update Failed',
      message: 'Unable to update expense. Please try again later.'
    });
  }
});

// DELETE /api/expenses/:id - Delete expense (only if pending and own expense)
router.delete('/:id', requireEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await db.findExpenseById(id);

    if (!expense) {
      return res.status(404).json({
        error: 'Expense Not Found',
        message: 'The requested expense was not found'
      });
    }

    // Check permissions
    if (expense.submittedById !== req.user.id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own expenses'
      });
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot Delete',
        message: 'You can only delete pending expenses'
      });
    }

    // For simplicity, we'll mark as deleted rather than actually deleting
    await db.updateExpense(id, { status: 'DELETED' });

    res.json({
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      error: 'Expense Deletion Failed',
      message: 'Unable to delete expense. Please try again later.'
    });
  }
});

// GET /api/expenses/categories - Get expense categories
router.get('/categories', requireEmployee, (req, res) => {
  const categories = [
    'Travel',
    'Food & Dining',
    'Accommodation',
    'Transportation',
    'Office Supplies',
    'Entertainment',
    'Software & Subscriptions',
    'Training & Education',
    'Marketing',
    'Other'
  ];

  res.json(categories);
});

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', requireEmployee, async (req, res) => {
  try {
    const filters = {
      companyId: req.user.companyId
    };

    // Role-based filtering
    if (req.user.role === 'EMPLOYEE') {
      filters.submittedById = req.user.id;
    }

    const analytics = await db.getExpenseAnalytics(req.user.companyId, filters);

    res.json(analytics);
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch expense statistics',
      message: 'Please try again later.'
    });
  }
});

// GET /api/expenses/pending-approvals - Get expenses pending approval (for managers)
router.get('/pending-approvals', authenticateToken, async (req, res) => {
  try {
    // Only managers and admins can access this
    if (req.user.role === 'EMPLOYEE') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Only managers can view pending approvals'
      });
    }

    const expenses = await db.findPendingApprovals(req.user.id, req.user.companyId);

    res.json(expenses);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending approvals',
      message: 'Please try again later.'
    });
  }
});

// POST /api/expenses/:id/approve - Approve expense
router.post('/:id/approve', authenticateToken, [
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
], async (req, res) => {
  try {
    // Only managers and admins can approve
    if (req.user.role === 'EMPLOYEE') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Only managers can approve expenses'
      });
    }

    const { id } = req.params;
    const { comments } = req.body;

    const expense = await db.findExpenseById(id);

    if (!expense) {
      return res.status(404).json({
        error: 'Expense Not Found',
        message: 'The requested expense was not found'
      });
    }

    if (expense.companyId !== req.user.companyId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You cannot approve this expense'
      });
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot Approve',
        message: 'Only pending expenses can be approved'
      });
    }

    // Update expense status
    await db.updateExpense(id, { status: 'APPROVED' });

    // Update approval record
    await db.updateApproval(expense.id, req.user.id, {
      status: 'APPROVED',
      comments: comments || null,
      approvedAt: new Date().toISOString()
    });

    res.json({
      message: 'Expense approved successfully'
    });

  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      error: 'Approval Failed',
      message: 'Unable to approve expense. Please try again later.'
    });
  }
});

// POST /api/expenses/:id/reject - Reject expense
router.post('/:id/reject', authenticateToken, [
  body('comments').notEmpty().trim().isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required and must be less than 500 characters')
], async (req, res) => {
  try {
    // Only managers and admins can reject
    if (req.user.role === 'EMPLOYEE') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Only managers can reject expenses'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide a reason for rejection',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { comments } = req.body;

    const expense = await db.findExpenseById(id);

    if (!expense) {
      return res.status(404).json({
        error: 'Expense Not Found',
        message: 'The requested expense was not found'
      });
    }

    if (expense.companyId !== req.user.companyId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You cannot reject this expense'
      });
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot Reject',
        message: 'Only pending expenses can be rejected'
      });
    }

    // Update expense status
    await db.updateExpense(id, { status: 'REJECTED' });

    // Update approval record
    await db.updateApproval(expense.id, req.user.id, {
      status: 'REJECTED',
      comments: comments,
      approvedAt: new Date().toISOString()
    });

    res.json({
      message: 'Expense rejected successfully'
    });

  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({
      error: 'Rejection Failed',
      message: 'Unable to reject expense. Please try again later.'
    });
  }
});

module.exports = router;