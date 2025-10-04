const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireManager, requireAdmin } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/rules - Get approval rules for company
router.get('/', requireManager, async (req, res) => {
  try {
    const rules = await db.findApprovalRules(req.user.companyId);
    res.json(rules);
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({
      error: 'Failed to fetch approval rules',
      message: 'Please try again later.'
    });
  }
});

// POST /api/rules - Create new approval rule (Admin only)
router.post('/', requireAdmin, [
  body('name').trim().isLength({ min: 1 }).withMessage('Rule name is required'),
  body('managerFirst').isBoolean().withMessage('Manager first must be a boolean'),
  body('sequentialApprovers').optional().isArray().withMessage('Sequential approvers must be an array'),
  body('conditionalType').optional().isIn(['PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID', 'AMOUNT_THRESHOLD']).withMessage('Invalid conditional type'),
  body('conditionalValue').optional().isNumeric().withMessage('Conditional value must be numeric'),
  body('amountThreshold').optional().isFloat({ min: 0 }).withMessage('Amount threshold must be a positive number')
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
      name,
      managerFirst,
      sequentialApprovers,
      conditionalType,
      conditionalValue,
      amountThreshold
    } = req.body;

    // Validate sequential approvers exist and are managers/admins
    if (sequentialApprovers && sequentialApprovers.length > 0) {
      for (const approverId of sequentialApprovers) {
        const approver = await db.findUserById(approverId);
        if (!approver || 
            approver.companyId !== req.user.companyId || 
            !['MANAGER', 'ADMIN'].includes(approver.role)) {
          return res.status(400).json({
            error: 'Invalid Approver',
            message: 'All sequential approvers must be valid managers or admins in your company'
          });
        }
      }
    }

    const ruleData = {
      companyId: req.user.companyId,
      name,
      managerFirst: managerFirst || false,
      sequentialApprovers: sequentialApprovers || [],
      conditionalType: conditionalType || null,
      conditionalValue: conditionalValue || null,
      amountThreshold: amountThreshold || null
    };

    const rule = await db.createApprovalRule(ruleData);

    res.status(201).json({
      message: 'Approval rule created successfully',
      rule
    });

  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({
      error: 'Rule Creation Failed',
      message: 'Unable to create approval rule. Please try again later.'
    });
  }
});

// PUT /api/rules/:id - Update approval rule (Admin only)
router.put('/:id', requireAdmin, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Rule name cannot be empty'),
  body('managerFirst').optional().isBoolean().withMessage('Manager first must be a boolean'),
  body('sequentialApprovers').optional().isArray().withMessage('Sequential approvers must be an array'),
  body('conditionalType').optional().isIn(['PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID', 'AMOUNT_THRESHOLD']).withMessage('Invalid conditional type'),
  body('conditionalValue').optional().isNumeric().withMessage('Conditional value must be numeric'),
  body('amountThreshold').optional().isFloat({ min: 0 }).withMessage('Amount threshold must be a positive number'),
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
    const updateData = req.body;

    // Check if rule exists and belongs to company
    const existingRule = await db.db.approvalRules.find(r => r.id === id);
    if (!existingRule || existingRule.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'Rule Not Found',
        message: 'Approval rule not found or access denied'
      });
    }

    // Validate sequential approvers if provided
    if (updateData.sequentialApprovers && updateData.sequentialApprovers.length > 0) {
      for (const approverId of updateData.sequentialApprovers) {
        const approver = await db.findUserById(approverId);
        if (!approver || 
            approver.companyId !== req.user.companyId || 
            !['MANAGER', 'ADMIN'].includes(approver.role)) {
          return res.status(400).json({
            error: 'Invalid Approver',
            message: 'All sequential approvers must be valid managers or admins in your company'
          });
        }
      }
    }

    const updatedRule = await db.updateApprovalRule(id, updateData);

    res.json({
      message: 'Approval rule updated successfully',
      rule: updatedRule
    });

  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({
      error: 'Rule Update Failed',
      message: 'Unable to update approval rule. Please try again later.'
    });
  }
});

// DELETE /api/rules/:id - Delete approval rule (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rule exists and belongs to company
    const existingRule = await db.db.approvalRules.find(r => r.id === id);
    if (!existingRule || existingRule.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'Rule Not Found',
        message: 'Approval rule not found or access denied'
      });
    }

    // Soft delete by marking as inactive
    await db.updateApprovalRule(id, { isActive: false });

    res.json({
      message: 'Approval rule deleted successfully'
    });

  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({
      error: 'Rule Deletion Failed',
      message: 'Unable to delete approval rule. Please try again later.'
    });
  }
});

// GET /api/rules/templates - Get rule templates
router.get('/templates', requireManager, (req, res) => {
  const templates = [
    {
      id: 'basic',
      name: 'Basic Approval',
      description: 'Manager approval only',
      config: {
        managerFirst: true,
        sequentialApprovers: [],
        conditionalType: null,
        conditionalValue: null
      }
    },
    {
      id: 'standard',
      name: 'Standard Approval',
      description: 'Manager first, then Finance for amounts over $500',
      config: {
        managerFirst: true,
        sequentialApprovers: [], // Would be populated with Finance manager ID
        conditionalType: 'AMOUNT_THRESHOLD',
        conditionalValue: null,
        amountThreshold: 500
      }
    },
    {
      id: 'advanced',
      name: 'Advanced Multi-Level',
      description: 'Manager → Finance → Director for high amounts',
      config: {
        managerFirst: true,
        sequentialApprovers: [], // Would be populated with Finance and Director IDs
        conditionalType: 'AMOUNT_THRESHOLD',
        conditionalValue: null,
        amountThreshold: 1000
      }
    },
    {
      id: 'percentage',
      name: 'Percentage Based',
      description: 'Approve when 60% of approvers agree',
      config: {
        managerFirst: false,
        sequentialApprovers: [], // Would be populated with multiple approver IDs
        conditionalType: 'PERCENTAGE',
        conditionalValue: 60
      }
    }
  ];

  res.json(templates);
});

// POST /api/rules/test - Test approval rule against sample expense
router.post('/test', requireManager, [
  body('ruleId').notEmpty().withMessage('Rule ID is required'),
  body('expenseAmount').isFloat({ min: 0.01 }).withMessage('Expense amount must be positive'),
  body('employeeId').notEmpty().withMessage('Employee ID is required')
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

    const { ruleId, expenseAmount, employeeId } = req.body;

    // Get the rule
    const rule = await db.db.approvalRules.find(r => r.id === ruleId);
    if (!rule || rule.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'Rule Not Found',
        message: 'Approval rule not found'
      });
    }

    // Get the employee
    const employee = await db.findUserById(employeeId);
    if (!employee || employee.companyId !== req.user.companyId) {
      return res.status(404).json({
        error: 'Employee Not Found',
        message: 'Employee not found'
      });
    }

    // Simulate approval workflow
    const workflow = [];
    let sequence = 1;

    // Manager first if required and employee has manager
    if (rule.managerFirst && employee.managerId) {
      const manager = await db.findUserById(employee.managerId);
      workflow.push({
        sequence: sequence++,
        approver: {
          id: manager.id,
          fullName: manager.fullName,
          role: manager.role
        },
        required: true,
        reason: 'Direct manager approval'
      });
    }

    // Sequential approvers
    if (rule.sequentialApprovers && rule.sequentialApprovers.length > 0) {
      for (const approverId of rule.sequentialApprovers) {
        const approver = await db.findUserById(approverId);
        if (approver) {
          workflow.push({
            sequence: sequence++,
            approver: {
              id: approver.id,
              fullName: approver.fullName,
              role: approver.role
            },
            required: true,
            reason: 'Sequential approver'
          });
        }
      }
    }

    // Apply conditional rules
    let conditionalApplies = false;
    if (rule.conditionalType === 'AMOUNT_THRESHOLD' && rule.amountThreshold) {
      conditionalApplies = expenseAmount >= rule.amountThreshold;
    }

    const result = {
      ruleName: rule.name,
      expenseAmount,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        manager: employee.managerId ? workflow.find(w => w.sequence === 1)?.approver : null
      },
      workflow,
      conditionalRules: {
        type: rule.conditionalType,
        value: rule.conditionalValue,
        threshold: rule.amountThreshold,
        applies: conditionalApplies
      },
      estimatedApprovers: workflow.length,
      estimatedTime: `${workflow.length * 24} hours` // Rough estimate
    };

    res.json(result);

  } catch (error) {
    console.error('Test approval rule error:', error);
    res.status(500).json({
      error: 'Rule Test Failed',
      message: 'Unable to test approval rule. Please try again later.'
    });
  }
});

module.exports = router;