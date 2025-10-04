const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo company
  const company = await prisma.company.upsert({
    where: { name: 'Demo Company' },
    update: {},
    create: {
      name: 'Demo Company',
      country: 'United States',
      baseCurrency: 'USD',
      address: '123 Demo Street, Demo City, DC 12345',
      contactEmail: 'contact@democompany.com',
      contactPhone: '+1-555-0123',
    },
  });

  console.log('✅ Created demo company');

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedManagerPassword = await bcrypt.hash('manager123', 10);
  const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedAdminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      email: 'manager@demo.com',
      password: hashedManagerPassword,
      fullName: 'Manager User',
      role: 'MANAGER',
      companyId: company.id,
    },
  });

  // Create employee user
  const employee = await prisma.user.upsert({
    where: { email: 'employee@demo.com' },
    update: {},
    create: {
      email: 'employee@demo.com',
      password: hashedEmployeePassword,
      fullName: 'Employee User',
      role: 'EMPLOYEE',
      companyId: company.id,
      managerId: manager.id,
    },
  });

  console.log('✅ Created demo users');

  // Create sample expenses
  const sampleExpenses = [
    {
      amount: 45.67,
      currency: 'USD',
      convertedAmount: 45.67,
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      category: 'meals',
      description: 'Business lunch with client',
      vendor: 'Restaurant ABC',
      expenseDate: new Date('2024-01-15'),
      ocrExtracted: true,
      ocrConfidence: 0.95,
      status: 'PENDING',
      submittedById: employee.id,
      companyId: company.id,
    },
    {
      amount: 120.00,
      currency: 'USD',
      convertedAmount: 120.00,
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      category: 'travel',
      description: 'Taxi to airport',
      vendor: 'City Taxi Co',
      expenseDate: new Date('2024-01-14'),
      ocrExtracted: true,
      ocrConfidence: 0.88,
      status: 'APPROVED',
      submittedById: employee.id,
      companyId: company.id,
    },
    {
      amount: 89.99,
      currency: 'USD',
      convertedAmount: 89.99,
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      category: 'software',
      description: 'Monthly software subscription',
      vendor: 'SoftwareCorp',
      expenseDate: new Date('2024-01-13'),
      ocrExtracted: false,
      status: 'APPROVED',
      submittedById: employee.id,
      companyId: company.id,
    },
    {
      amount: 25.50,
      currency: 'USD',
      convertedAmount: 25.50,
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      category: 'office',
      description: 'Office supplies',
      vendor: 'Office Depot',
      expenseDate: new Date('2024-01-12'),
      ocrExtracted: true,
      ocrConfidence: 0.92,
      status: 'REJECTED',
      submittedById: employee.id,
      companyId: company.id,
    },
    {
      amount: 75.25,
      currency: 'EUR',
      convertedAmount: 82.15,
      baseCurrency: 'USD',
      exchangeRate: 1.092,
      category: 'travel',
      description: 'Hotel accommodation',
      vendor: 'Hotel Europa',
      expenseDate: new Date('2024-01-11'),
      ocrExtracted: true,
      ocrConfidence: 0.87,
      status: 'PENDING',
      submittedById: employee.id,
      companyId: company.id,
    },
  ];

  for (const expenseData of sampleExpenses) {
    await prisma.expense.create({
      data: expenseData,
    });
  }

  console.log('✅ Created 5 sample expenses');

  // Create approvals for the expenses that need them
  const expenses = await prisma.expense.findMany({
    where: { submittedById: employee.id },
  });

  for (const expense of expenses) {
    await prisma.approval.create({
      data: {
        expenseId: expense.id,
        approverId: manager.id,
        status: expense.status === 'APPROVED' ? 'APPROVED' : 
                expense.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        approvedAt: expense.status !== 'PENDING' ? new Date() : null,
        comments: expense.status === 'REJECTED' ? 'Receipt not clear enough' : null,
      },
    });
  }

  console.log('✅ Created approval records');

  // Create a basic approval rule
  await prisma.approvalRule.create({
    data: {
      name: 'Default Manager Approval',
      minAmount: 0,
      approverType: 'MANAGER',
      companyId: company.id,
      createdById: admin.id,
    },
  });

  console.log('✅ Created default approval rule');
  console.log('🎉 Database seeded successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Manager: manager@demo.com / manager123');
  console.log('Employee: employee@demo.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });