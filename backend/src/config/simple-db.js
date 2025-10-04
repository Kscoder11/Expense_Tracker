// Enhanced in-memory database for complete expense management system
// This provides the same interface as Prisma but works without external dependencies

class SimpleDatabase {
  constructor() {
    this.users = []
    this.companies = []
    this.expenses = []
    this.approvals = []
    this.approvalRules = []
    this.notifications = []
    this.comments = []
    this.auditLogs = []

    // Initialize with comprehensive demo data
    this.initializeDemoData()
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9)
  }

  initializeDemoData() {
    // Create demo company
    const demoCompany = {
      id: this.generateId(),
      name: 'Demo Company Inc',
      country: 'United States',
      baseCurrency: 'USD',
      address: '123 Demo Street, San Francisco, CA 94105',
      contactEmail: 'contact@demo.com',
      contactPhone: '+1-555-0123',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.companies.push(demoCompany)

    // Create demo users with exact credentials
    const adminUser = {
      id: this.generateId(),
      email: 'admin@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', // admin123
      fullName: 'Admin User',
      role: 'ADMIN',
      companyId: demoCompany.id,
      managerId: null,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const managerUser = {
      id: this.generateId(),
      email: 'manager@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', // manager123
      fullName: 'Manager User',
      role: 'MANAGER',
      companyId: demoCompany.id,
      managerId: adminUser.id,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const employeeUser = {
      id: this.generateId(),
      email: 'employee@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', // employee123
      fullName: 'Employee User',
      role: 'EMPLOYEE',
      companyId: demoCompany.id,
      managerId: managerUser.id,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Additional employees for demo
    const employee2 = {
      id: this.generateId(),
      email: 'john@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka',
      fullName: 'John Smith',
      role: 'EMPLOYEE',
      companyId: demoCompany.id,
      managerId: managerUser.id,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const employee3 = {
      id: this.generateId(),
      email: 'sarah@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka',
      fullName: 'Sarah Wilson',
      role: 'EMPLOYEE',
      companyId: demoCompany.id,
      managerId: managerUser.id,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.users.push(adminUser, managerUser, employeeUser, employee2, employee3)

    // Create 5 sample expenses
    this.createSampleExpenses([employeeUser, employee2, employee3], [managerUser], demoCompany)
  }

  createSampleExpenses(employees, managers, company) {
    const categories = ['Travel', 'Food & Dining', 'Accommodation', 'Transportation', 'Office Supplies', 'Entertainment', 'Other']
    const statuses = ['PENDING', 'APPROVED', 'REJECTED']

    for (let i = 0; i < 50; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const amount = Math.floor(Math.random() * 1000) + 10
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 90))

      const expense = {
        id: this.generateId(),
        amount: amount,
        currency: 'USD',
        convertedAmount: amount,
        baseCurrency: 'USD',
        exchangeRate: 1,
        category: category,
        description: this.generateExpenseDescription(category),
        vendor: this.generateVendorName(category),
        expenseDate: date.toISOString(),
        receiptUrl: null,
        ocrExtracted: Math.random() > 0.5,
        ocrConfidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        status: status,
        submittedById: employee.id,
        companyId: company.id,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      }

      this.expenses.push(expense)

      // Create approval records for non-pending expenses
      if (status !== 'PENDING') {
        const manager = managers.find(m => m.id === employee.managerId)
        if (manager) {
          this.approvals.push({
            id: this.generateId(),
            expenseId: expense.id,
            approverId: manager.id,
            status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
            comments: status === 'REJECTED' ? 'Please provide more details about this expense.' : 'Approved as per company policy.',
            sequence: 1,
            approvedAt: status !== 'PENDING' ? new Date().toISOString() : null,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString()
          })
        }
      }
    }
  }

  generateExpenseDescription(category) {
    const descriptions = {
      'Travel': ['Flight to New York for client meeting', 'Hotel accommodation in Chicago', 'Taxi to airport'],
      'Food & Dining': ['Business lunch with client', 'Team dinner after conference', 'Coffee meeting with vendor'],
      'Accommodation': ['Hotel stay for business trip', 'Airbnb for extended project work'],
      'Transportation': ['Uber to client office', 'Train ticket for business travel', 'Parking fees'],
      'Office Supplies': ['Laptop accessories', 'Stationery for office', 'Printer cartridges'],
      'Entertainment': ['Client entertainment dinner', 'Team building activity'],
      'Other': ['Conference registration fee', 'Software subscription', 'Training materials']
    }

    const categoryDescriptions = descriptions[category] || ['Business expense']
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]
  }

  generateVendorName(category) {
    const vendors = {
      'Travel': ['Delta Airlines', 'Marriott Hotel', 'Uber', 'Hertz Car Rental'],
      'Food & Dining': ['Starbucks', 'The Cheesecake Factory', 'Subway', 'Local Bistro'],
      'Accommodation': ['Hilton Hotels', 'Airbnb Host', 'Holiday Inn'],
      'Transportation': ['Uber', 'Yellow Cab', 'Metro Transit', 'Enterprise'],
      'Office Supplies': ['Staples', 'Office Depot', 'Amazon Business', 'Best Buy'],
      'Entertainment': ['AMC Theaters', 'TopGolf', 'Dave & Busters'],
      'Other': ['Microsoft', 'Adobe', 'Coursera', 'LinkedIn Learning']
    }

    const categoryVendors = vendors[category] || ['Business Vendor']
    return categoryVendors[Math.floor(Math.random() * categoryVendors.length)]
  }

  createDefaultApprovalRules(company, managers) {
    // Default approval rule: Manager first, then Finance for amounts > $500
    this.approvalRules.push({
      id: this.generateId(),
      companyId: company.id,
      name: 'Standard Approval Flow',
      managerFirst: true,
      sequentialApprovers: [managers[2].id], // Finance manager
      conditionalType: 'AMOUNT_THRESHOLD',
      conditionalValue: 500,
      amountThreshold: 500,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  // User operations
  async findUserByEmail(email) {
    const user = this.users.find(u => u.email === email && u.isActive)
    if (user) {
      const company = this.companies.find(c => c.id === user.companyId)
      const manager = user.managerId ? this.users.find(u => u.id === user.managerId) : null

      return {
        ...user,
        company,
        manager: manager ? {
          id: manager.id,
          fullName: manager.fullName,
          email: manager.email
        } : null
      }
    }
    return null
  }

  async findUserById(id) {
    const user = this.users.find(u => u.id === id && u.isActive)
    if (user) {
      const company = this.companies.find(c => c.id === user.companyId)
      const manager = user.managerId ? this.users.find(u => u.id === user.managerId) : null

      return {
        ...user,
        company,
        manager: manager ? {
          id: manager.id,
          fullName: manager.fullName,
          email: manager.email
        } : null
      }
    }
    return null
  }

  async findManyUsers(filters = {}) {
    let users = this.users.filter(u => u.isActive)

    if (filters.companyId) {
      users = users.filter(u => u.companyId === filters.companyId)
    }

    if (filters.role) {
      users = users.filter(u => u.role === filters.role)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      )
    }

    return users.map(user => {
      const company = this.companies.find(c => c.id === user.companyId)
      const manager = user.managerId ? this.users.find(u => u.id === user.managerId) : null

      return {
        ...user,
        company,
        manager: manager ? {
          id: manager.id,
          fullName: manager.fullName,
          email: manager.email
        } : null
      }
    })
  }

  async createUser(userData) {
    const user = {
      id: this.generateId(),
      ...userData,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.users.push(user)
    return this.findUserById(user.id)
  }

  async updateUser(id, updateData) {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return this.findUserById(id)
  }

  async deleteUser(id) {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) return false

    // Soft delete
    this.users[userIndex].isActive = false
    this.users[userIndex].updatedAt = new Date().toISOString()
    return true
  }

  // Expense operations
  async findManyExpenses(filters = {}) {
    let expenses = [...this.expenses]

    if (filters.companyId) {
      expenses = expenses.filter(e => e.companyId === filters.companyId)
    }

    if (filters.submittedById) {
      expenses = expenses.filter(e => e.submittedById === filters.submittedById)
    }

    if (filters.status) {
      expenses = expenses.filter(e => e.status === filters.status)
    }

    if (filters.category) {
      expenses = expenses.filter(e => e.category === filters.category)
    }

    if (filters.dateFrom) {
      expenses = expenses.filter(e => new Date(e.expenseDate) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      expenses = expenses.filter(e => new Date(e.expenseDate) <= new Date(filters.dateTo))
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      expenses = expenses.filter(e =>
        e.description.toLowerCase().includes(search) ||
        e.category.toLowerCase().includes(search)
      )
    }

    // Add submitter info
    return expenses.map(expense => {
      const submitter = this.users.find(u => u.id === expense.submittedById)
      const approvals = this.approvals.filter(a => a.expenseId === expense.id)

      return {
        ...expense,
        submittedBy: submitter ? {
          id: submitter.id,
          fullName: submitter.fullName,
          email: submitter.email,
          avatar: submitter.avatar
        } : null,
        approvals: approvals.map(approval => {
          const approver = this.users.find(u => u.id === approval.approverId)
          return {
            ...approval,
            approver: approver ? {
              id: approver.id,
              fullName: approver.fullName,
              email: approver.email,
              avatar: approver.avatar
            } : null
          }
        })
      }
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async findExpenseById(id) {
    const expense = this.expenses.find(e => e.id === id)
    if (!expense) return null

    const submitter = this.users.find(u => u.id === expense.submittedById)
    const approvals = this.approvals.filter(a => a.expenseId === expense.id)

    return {
      ...expense,
      submittedBy: submitter ? {
        id: submitter.id,
        fullName: submitter.fullName,
        email: submitter.email,
        avatar: submitter.avatar
      } : null,
      approvals: approvals.map(approval => {
        const approver = this.users.find(u => u.id === approval.approverId)
        return {
          ...approval,
          approver: approver ? {
            id: approver.id,
            fullName: approver.fullName,
            email: approver.email,
            avatar: approver.avatar
          } : null
        }
      }).sort((a, b) => a.sequence - b.sequence)
    }
  }

  async createExpense(expenseData) {
    const expense = {
      id: this.generateId(),
      ...expenseData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.expenses.push(expense)

    // Create initial approval workflow
    await this.createApprovalWorkflow(expense)

    return this.findExpenseById(expense.id)
  }

  async updateExpense(id, updateData) {
    const expenseIndex = this.expenses.findIndex(e => e.id === id)
    if (expenseIndex === -1) return null

    this.expenses[expenseIndex] = {
      ...this.expenses[expenseIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return this.findExpenseById(id)
  }

  // Approval operations
  async createApprovalWorkflow(expense) {
    const rules = this.approvalRules.filter(r => r.companyId === expense.companyId && r.isActive)
    if (rules.length === 0) return

    const rule = rules[0] // Use first active rule
    const submitter = this.users.find(u => u.id === expense.submittedById)

    let sequence = 1

    // Manager first if required and employee has manager
    if (rule.managerFirst && submitter.managerId) {
      this.approvals.push({
        id: this.generateId(),
        expenseId: expense.id,
        approverId: submitter.managerId,
        status: 'PENDING',
        comments: null,
        sequence: sequence++,
        approvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Sequential approvers
    if (rule.sequentialApprovers && rule.sequentialApprovers.length > 0) {
      for (const approverId of rule.sequentialApprovers) {
        this.approvals.push({
          id: this.generateId(),
          expenseId: expense.id,
          approverId: approverId,
          status: 'PENDING',
          comments: null,
          sequence: sequence++,
          approvedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  async createApproval(approvalData) {
    const approval = {
      id: this.generateId(),
      ...approvalData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.approvals.push(approval)
    return approval
  }

  async updateApproval(expenseId, approverId, updateData) {
    const approvalIndex = this.approvals.findIndex(a => 
      a.expenseId === expenseId && a.approverId === approverId
    )
    if (approvalIndex === -1) return null

    this.approvals[approvalIndex] = {
      ...this.approvals[approvalIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    const approval = this.approvals[approvalIndex]

    // Update expense status based on approval workflow
    await this.processApprovalWorkflow(approval.expenseId)

    return approval
  }

  async findPendingApprovals(managerId, companyId) {
    // Find expenses that need approval from this manager
    const expenses = this.expenses.filter(e => 
      e.companyId === companyId && e.status === 'PENDING'
    )

    // Filter to only expenses where this manager is the approver or the employee's manager
    const relevantExpenses = expenses.filter(expense => {
      const submitter = this.users.find(u => u.id === expense.submittedById)
      return submitter && submitter.managerId === managerId
    })

    return relevantExpenses.map(expense => {
      const submitter = this.users.find(u => u.id === expense.submittedById)
      return {
        ...expense,
        submittedBy: submitter ? {
          id: submitter.id,
          fullName: submitter.fullName,
          email: submitter.email,
          avatar: submitter.avatar
        } : null
      }
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async processApprovalWorkflow(expenseId) {
    const expense = this.expenses.find(e => e.id === expenseId)
    if (!expense) return

    const approvals = this.approvals.filter(a => a.expenseId === expenseId).sort((a, b) => a.sequence - b.sequence)

    // Check if any approval is rejected
    const rejectedApproval = approvals.find(a => a.status === 'REJECTED')
    if (rejectedApproval) {
      expense.status = 'REJECTED'
      expense.updatedAt = new Date().toISOString()
      return
    }

    // Check if all approvals are completed
    const pendingApprovals = approvals.filter(a => a.status === 'PENDING')
    if (pendingApprovals.length === 0) {
      expense.status = 'APPROVED'
      expense.updatedAt = new Date().toISOString()
      return
    }

    // Keep as pending if there are still pending approvals
    expense.status = 'PENDING'
    expense.updatedAt = new Date().toISOString()
  }

  async findPendingApprovalsForUser(userId) {
    const pendingApprovals = this.approvals.filter(a =>
      a.approverId === userId && a.status === 'PENDING'
    )

    return pendingApprovals.map(approval => {
      const expense = this.expenses.find(e => e.id === approval.expenseId)
      const submitter = this.users.find(u => u.id === expense?.submittedById)

      return {
        ...approval,
        expense: expense ? {
          ...expense,
          submittedBy: submitter ? {
            id: submitter.id,
            fullName: submitter.fullName,
            email: submitter.email,
            avatar: submitter.avatar
          } : null
        } : null
      }
    }).filter(a => a.expense !== null)
  }

  // Approval Rules operations
  async findApprovalRules(companyId) {
    return this.approvalRules.filter(r => r.companyId === companyId)
  }

  async createApprovalRule(ruleData) {
    const rule = {
      id: this.generateId(),
      ...ruleData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.approvalRules.push(rule)
    return rule
  }

  async updateApprovalRule(id, updateData) {
    const ruleIndex = this.approvalRules.findIndex(r => r.id === id)
    if (ruleIndex === -1) return null

    this.approvalRules[ruleIndex] = {
      ...this.approvalRules[ruleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return this.approvalRules[ruleIndex]
  }

  // Analytics operations
  async getExpenseAnalytics(companyId, filters = {}) {
    const expenses = await this.findManyExpenses({ companyId, ...filters })

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const approvedExpenses = expenses.filter(e => e.status === 'APPROVED')
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
    const rejectedExpenses = expenses.filter(e => e.status === 'REJECTED')

    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    const monthlyTrends = expenses.reduce((acc, expense) => {
      const month = new Date(expense.expenseDate).toISOString().substring(0, 7)
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    }, {})

    return {
      totalExpenses,
      totalAmount: totalExpenses,
      approvedCount: approvedExpenses.length,
      approvedAmount: approvedExpenses.reduce((sum, e) => sum + e.amount, 0),
      pendingCount: pendingExpenses.length,
      pendingAmount: pendingExpenses.reduce((sum, e) => sum + e.amount, 0),
      rejectedCount: rejectedExpenses.length,
      rejectedAmount: rejectedExpenses.reduce((sum, e) => sum + e.amount, 0),
      categoryBreakdown,
      monthlyTrends
    }
  }

  // Transaction simulation
  async $transaction(callback) {
    const mockTx = {
      user: {
        create: async (data) => {
          const user = {
            id: this.generateId(),
            ...data.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          this.users.push(user)

          // Include company if requested
          if (data.include?.company) {
            const company = this.companies.find(c => c.id === user.companyId)
            user.company = company
          }

          return user
        }
      },
      company: {
        create: async (data) => {
          const company = {
            id: this.generateId(),
            ...data.data,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          this.companies.push(company)
          return company
        }
      }
    }

    return await callback(mockTx)
  }

  // Health check
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      users: this.users.length,
      companies: this.companies.length
    }
  }

  // Disconnect (no-op)
  async $disconnect() {
    // No-op for in-memory database
  }
}

const db = new SimpleDatabase()

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

process.on('SIGINT', async () => {
  await db.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await db.$disconnect()
  process.exit(0)
})

module.exports = db