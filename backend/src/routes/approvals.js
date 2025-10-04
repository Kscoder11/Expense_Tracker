const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/approvals/pending - Get pending approvals for current user
router.get('/pending', requireManager, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pendingApprovals = await db.findPendingApprovalsForUser(req.user.id);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedApprovals = pendingApprovals.slice(startIndex, endIndex);
    
    res.json({
      approvals: paginatedApprovals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(pendingApprovals.length / limit),
        totalApprovals: pendingApprovals.length,
        hasNext: endIndex < pendingApprovals.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending approvals',
      message: 'Please try again later.'
    });
  }
});

// POST /api/approvals/:id/approve - Approve an expense
router.post('/:id/approve', requireManager, [
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
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
    const { comments } = req.body;

    // Find the approval
    const approval = await db.db.approvals.find(a => a.id === id);
    if (!approval) {
      return res.status(404).json({
        error: 'Approval Not Found',
        message: 'The requested approval was not found'
      });
    }

    // Check if user is the assigned approver
    if (approval.approverId !== req.user.id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You are not authorized to approve this expense'
      });
    }

    // Check if already processed
    if (approval.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Already Processed',
        message: 'This approval has already been processed'
      });
    }

    // Update approval
    const updatedApproval = await db.updateApproval(id, {
      status: 'APPROVED',
      comments: comments || null
    });

    // Get updated expense with approval trail
    const expense = await db.findExpenseById(approval.expenseId);

    res.json({
      message: 'Expense approved successfully',
      approval: updatedApproval,
      expense
    });

  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      error: 'Approval Failed',
      message: 'Unable to approve expense. Please try again later.'
    });
  }
});

// POST /api/approvals/:id/reject - Reject an expense
router.post('/:id/reject', requireManager, [
  body('comments').notEmpty().trim().isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required and must be less than 500 characters')
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
    const { comments } = req.body;

    // Find the approval
    const approval = await db.db.approvals.find(a => a.id === id);
    if (!approval) {
      return res.status(404).json({
        error: 'Approval Not Found',
        message: 'The requested approval was not found'
      });
    }

    // Check if user is the assigned approver
    if (approval.approverId !== req.user.id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You are not authorized to reject this expense'
      });
    }

    // Check if already processed
    if (approval.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Already Processed',
        message: 'This approval has already been processed'
      });
    }

    // Update approval
    const updatedApproval = await db.updateApproval(id, {
      status: 'REJECTED',
      comments
    });

    // Get updated expense with approval trail
    const expense = await db.findExpenseById(approval.expenseId);

    res.json({
      message: 'Expense rejected successfully',
      approval: updatedApproval,
      expense
    });

  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({
      error: 'Rejection Failed',
      message: 'Unable to reject expense. Please try again later.'
    });
  }
});

// POST /api/approvals/bulk-approve - Bulk approve expenses
router.post('/bulk-approve', requireManager, [
  body('approvalIds').isArray({ min: 1 }).withMessage('At least one approval ID is required'),
  body('approvalIds.*').isString().withMessage('Each approval ID must be a string'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
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

    const { approvalIds, comments } = req.body;
    const results = [];
    const errors_list = [];

    for (const approvalId of approvalIds) {
      try {
        // Find the approval
        const approval = await db.db.approvals.find(a => a.id === approvalId);
        
        if (!approval) {
          errors_list.push({ id: approvalId, error: 'Approval not found' });
          continue;
        }

        // Check if user is the assigned approver
        if (approval.approverId !== req.user.id) {
          errors_list.push({ id: approvalId, error: 'Not authorized' });
          continue;
        }

        // Check if already processed
        if (approval.status !== 'PENDING') {
          errors_list.push({ id: approvalId, error: 'Already processed' });
          continue;
        }

        // Update approval
        const updatedApproval = await db.updateApproval(approvalId, {
          status: 'APPROVED',
          comments: comments || null
        });

        results.push({
          id: approvalId,
          status: 'success',
          approval: updatedApproval
        });

      } catch (error) {
        errors_list.push({ id: approvalId, error: error.message });
      }
    }

    res.json({
      message: `Bulk approval completed. ${results.length} approved, ${errors_list.length} failed.`,
      results,
      errors: errors_list
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      error: 'Bulk Approval Failed',
      message: 'Unable to process bulk approval. Please try again later.'
    });
  }
});

// POST /api/approvals/bulk-reject - Bulk reject expenses
router.post('/bulk-reject', requireManager, [
  body('approvalIds').isArray({ min: 1 }).withMessage('At least one approval ID is required'),
  body('approvalIds.*').isString().withMessage('Each approval ID must be a string'),
  body('comments').notEmpty().trim().isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required and must be less than 500 characters')
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

    const { approvalIds, comments } = req.body;
    const results = [];
    const errors_list = [];

    for (const approvalId of approvalIds) {
      try {
        // Find the approval
        const approval = await db.db.approvals.find(a => a.id === approvalId);
        
        if (!approval) {
          errors_list.push({ id: approvalId, error: 'Approval not found' });
          continue;
        }

        // Check if user is the assigned approver
        if (approval.approverId !== req.user.id) {
          errors_list.push({ id: approvalId, error: 'Not authorized' });
          continue;
        }

        // Check if already processed
        if (approval.status !== 'PENDING') {
          errors_list.push({ id: approvalId, error: 'Already processed' });
          continue;
        }

        // Update approval
        const updatedApproval = await db.updateApproval(approvalId, {
          status: 'REJECTED',
          comments
        });

        results.push({
          id: approvalId,
          status: 'success',
          approval: updatedApproval
        });

      } catch (error) {
        errors_list.push({ id: approvalId, error: error.message });
      }
    }

    res.json({
      message: `Bulk rejection completed. ${results.length} rejected, ${errors_list.length} failed.`,
      results,
      errors: errors_list
    });

  } catch (error) {
    console.error('Bulk reject error:', error);
    res.status(500).json({
      error: 'Bulk Rejection Failed',
      message: 'Unable to process bulk rejection. Please try again later.'
    });
  }
});

// GET /api/approvals/stats - Get approval statistics for manager
router.get('/stats', requireManager, async (req, res) => {
  try {
    const pendingApprovals = await db.findPendingApprovalsForUser(req.user.id);
    
    // Get team expenses if user is a manager
    const teamExpenses = await db.findManyExpenses({
      companyId: req.user.companyId
    });

    // Filter team expenses for employees under this manager
    const teamMembers = await db.findManyUsers({
      companyId: req.user.companyId,
      role: 'EMPLOYEE'
    });
    
    const myTeamMembers = teamMembers.filter(member => member.managerId === req.user.id);
    const myTeamExpenses = teamExpenses.filter(expense => 
      myTeamMembers.some(member => member.id === expense.submittedById)
    );

    const stats = {
      pendingApprovals: pendingApprovals.length,
      teamExpenses: myTeamExpenses.length,
      teamExpensesThisMonth: myTeamExpenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      }).length,
      totalTeamAmount: myTeamExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      approvedThisWeek: myTeamExpenses.filter(expense => {
        const expenseDate = new Date(expense.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return expense.status === 'APPROVED' && expenseDate >= weekAgo;
      }).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch approval statistics',
      message: 'Please try again later.'
    });
  }
});

module.exports = router;