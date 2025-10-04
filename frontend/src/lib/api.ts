import axios from 'axios'
import type { AuthResponse, Country, User, Expense, ExpenseAnalytics, ApprovalRule } from '../types'
import { cache, CACHE_KEYS } from './cache'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with optimizations
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: async (data: {
    email: string
    password: string
    fullName: string
    companyName: string
    country: string
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data)
    return response.data
  },

  login: async (data: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  getCountries: async (includeAll = false): Promise<Country[]> => {
    const cacheKey = includeAll ? CACHE_KEYS.COUNTRIES_ALL : CACHE_KEYS.COUNTRIES_TOP
    
    // Check cache first
    const cached = cache.get<Country[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await api.get(`/auth/countries${includeAll ? '?all=true' : ''}`)
      const countries = response.data
      
      // Cache for 1 hour
      cache.set(cacheKey, countries, 60 * 60 * 1000)
      
      return countries
    } catch (error) {
      // Return fallback countries if API fails
      const fallbackCountries: Country[] = [
        { name: 'United States', currency: 'USD' },
        { name: 'United Kingdom', currency: 'GBP' },
        { name: 'Canada', currency: 'CAD' },
        { name: 'Australia', currency: 'AUD' },
        { name: 'Germany', currency: 'EUR' },
        { name: 'France', currency: 'EUR' },
        { name: 'India', currency: 'INR' },
        { name: 'Japan', currency: 'JPY' }
      ]
      
      // Cache fallback for 5 minutes
      cache.set(cacheKey, fallbackCountries, 5 * 60 * 1000)
      
      return fallbackCountries
    }
  },
}

// Users API
export const usersAPI = {
  getUsers: async (params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  getManagers: async (): Promise<User[]> => {
    const response = await api.get('/users/managers')
    return response.data
  },

  createUser: async (data: {
    email: string
    password: string
    fullName: string
    role: string
    managerId?: string
  }) => {
    const response = await api.post('/users', data)
    return response.data
  },

  updateUser: async (id: string, data: {
    fullName?: string
    role?: string
    managerId?: string
    isActive?: boolean
  }) => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats')
    return response.data
  }
}

// Expenses API
export const expensesAPI = {
  getExpenses: async (params?: {
    status?: string
    category?: string
    dateFrom?: string
    dateTo?: string
    search?: string
    page?: number
    limit?: number
    submittedById?: string
  }) => {
    const response = await api.get('/expenses', { params })
    return response.data
  },

  getExpense: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`)
    return response.data
  },

  createExpense: async (data: FormData) => {
    const response = await api.post('/expenses', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  updateExpense: async (id: string, data: FormData) => {
    const response = await api.put(`/expenses/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`)
    return response.data
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/expenses/categories')
    return response.data
  },

  getStats: async (): Promise<ExpenseAnalytics> => {
    const response = await api.get('/expenses/stats')
    return response.data
  },

  getPendingApprovals: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses/pending-approvals')
    return response.data
  },

  approveExpense: async (id: string, comments?: string) => {
    const response = await api.post(`/expenses/${id}/approve`, { comments })
    return response.data
  },

  rejectExpense: async (id: string, comments: string) => {
    const response = await api.post(`/expenses/${id}/reject`, { comments })
    return response.data
  }
}

// Approvals API
export const approvalsAPI = {
  getPendingApprovals: async (params?: {
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/approvals/pending', { params })
    return response.data
  },

  approveExpense: async (id: string, comments?: string) => {
    const response = await api.post(`/approvals/${id}/approve`, { comments })
    return response.data
  },

  rejectExpense: async (id: string, comments: string) => {
    const response = await api.post(`/approvals/${id}/reject`, { comments })
    return response.data
  },

  bulkApprove: async (approvalIds: string[], comments?: string) => {
    const response = await api.post('/approvals/bulk-approve', { approvalIds, comments })
    return response.data
  },

  bulkReject: async (approvalIds: string[], comments: string) => {
    const response = await api.post('/approvals/bulk-reject', { approvalIds, comments })
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/approvals/stats')
    return response.data
  }
}

// Rules API
export const rulesAPI = {
  getRules: async (): Promise<ApprovalRule[]> => {
    const response = await api.get('/rules')
    return response.data
  },

  createRule: async (data: {
    name: string
    managerFirst: boolean
    sequentialApprovers: string[]
    conditionalType?: string
    conditionalValue?: number
    amountThreshold?: number
  }) => {
    const response = await api.post('/rules', data)
    return response.data
  },

  updateRule: async (id: string, data: Partial<ApprovalRule>) => {
    const response = await api.put(`/rules/${id}`, data)
    return response.data
  },

  deleteRule: async (id: string) => {
    const response = await api.delete(`/rules/${id}`)
    return response.data
  },

  getTemplates: async () => {
    const response = await api.get('/rules/templates')
    return response.data
  },

  testRule: async (data: {
    ruleId: string
    expenseAmount: number
    employeeId: string
  }) => {
    const response = await api.post('/rules/test', data)
    return response.data
  }
}

export default api