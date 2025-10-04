export interface User {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  isActive: boolean
  companyId: string
  managerId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  company: Company
  manager?: {
    id: string
    fullName: string
    email: string
  }
}

export interface Company {
  id: string
  name: string
  country: string
  baseCurrency: string
  address?: string
  contactEmail?: string
  contactPhone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Country {
  name: string
  currency: string
}

export interface Expense {
  id: string
  amount: number
  currency: string
  convertedAmount?: number
  baseCurrency?: string
  exchangeRate?: number
  category: string
  description: string
  vendor?: string
  expenseDate: string
  receiptUrl?: string
  ocrExtracted: boolean
  ocrConfidence?: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedById: string
  companyId: string
  createdAt: string
  updatedAt: string
  submittedBy?: {
    id: string
    fullName: string
    email: string
    avatar?: string
  }
  approvals?: Approval[]
}

export interface OCRExtractedData {
  amount?: number
  date?: string
  vendor?: string
  category?: string
  confidence?: number
}

export interface CurrencyConversion {
  rate: number
  convertedAmount: number
  fromCurrency: string
  toCurrency: string
}

export interface Approval {
  id: string
  expenseId: string
  approverId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
  sequence: number
  approvedAt?: string
  createdAt: string
  updatedAt: string
  approver?: {
    id: string
    fullName: string
    email: string
    avatar?: string
  }
  expense?: Expense
}

export interface ApprovalRule {
  id: string
  companyId: string
  name: string
  managerFirst: boolean
  sequentialApprovers: string[]
  conditionalType?: 'PERCENTAGE' | 'SPECIFIC_APPROVER' | 'HYBRID' | 'AMOUNT_THRESHOLD'
  conditionalValue?: number
  amountThreshold?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseAnalytics {
  totalExpenses: number
  totalAmount: number
  approvedCount: number
  approvedAmount: number
  pendingCount: number
  pendingAmount: number
  rejectedCount: number
  rejectedAmount: number
  categoryBreakdown: Record<string, number>
  monthlyTrends: Record<string, number>
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ApiError {
  error: string
  message: string
  details?: any[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
}