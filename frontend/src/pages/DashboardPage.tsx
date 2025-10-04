import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, MobileMenuButton } from '../components/ui/Sidebar'
import { StatsCard } from '../components/ui/StatsCard'
import { QuickActionCard } from '../components/ui/QuickActionCard'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  FileText, 
  Camera,
  Users,
  Settings,
  BarChart3,
  TrendingUp,
  Calendar,
  Receipt
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getStatsCards = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          {
            title: 'Total Users',
            value: 247,
            change: { value: '+12% this month', type: 'increase' as const },
            icon: <Users className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
          },
          {
            title: 'Total Expenses',
            value: '$124,580',
            change: { value: '+8% this month', type: 'increase' as const },
            icon: <DollarSign className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600'
          },
          {
            title: 'Pending Approvals',
            value: 23,
            change: { value: '-15% this week', type: 'decrease' as const },
            icon: <Clock className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-warning-500 to-warning-600'
          },
          {
            title: 'Active Companies',
            value: 12,
            change: { value: '+2 this month', type: 'increase' as const },
            icon: <BarChart3 className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
          }
        ]
      
      case 'MANAGER':
        return [
          {
            title: 'Team Expenses',
            value: '$12,450',
            change: { value: '+12% this month', type: 'increase' as const },
            icon: <DollarSign className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
          },
          {
            title: 'Pending Approvals',
            value: 8,
            change: { value: '3 urgent', type: 'neutral' as const },
            icon: <Clock className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-warning-500 to-warning-600'
          },
          {
            title: 'Approved Today',
            value: 15,
            change: { value: '+25% vs yesterday', type: 'increase' as const },
            icon: <CheckCircle className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600'
          },
          {
            title: 'Team Members',
            value: 24,
            change: { value: '2 new this month', type: 'increase' as const },
            icon: <Users className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
          }
        ]
      
      default: // EMPLOYEE
        return [
          {
            title: 'This Month',
            value: '$1,245',
            change: { value: '+15% vs last month', type: 'increase' as const },
            icon: <DollarSign className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
          },
          {
            title: 'Pending',
            value: 3,
            change: { value: '2 awaiting approval', type: 'neutral' as const },
            icon: <Clock className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-warning-500 to-warning-600'
          },
          {
            title: 'Approved',
            value: 12,
            change: { value: '+4 this week', type: 'increase' as const },
            icon: <CheckCircle className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600'
          },
          {
            title: 'Rejected',
            value: 1,
            change: { value: 'Review required', type: 'decrease' as const },
            icon: <XCircle className="w-8 h-8" />,
            gradient: 'bg-gradient-to-r from-danger-500 to-danger-600'
          }
        ]
    }
  }

  const getQuickActions = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          {
            title: 'Manage Users',
            description: 'Add, edit, or remove users and assign roles',
            icon: <Users className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
            onClick: () => window.location.href = '/users'
          },
          {
            title: 'Configure Rules',
            description: 'Set up approval workflows and expense policies',
            icon: <Settings className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
            onClick: () => console.log('Navigate to rules')
          },
          {
            title: 'View Analytics',
            description: 'Analyze spending patterns and generate reports',
            icon: <BarChart3 className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600',
            onClick: () => console.log('Navigate to analytics')
          }
        ]
      
      case 'MANAGER':
        return [
          {
            title: 'Review Approvals',
            description: 'Approve or reject pending expense requests',
            icon: <CheckCircle className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600',
            onClick: () => console.log('Navigate to approvals')
          },
          {
            title: 'Team Reports',
            description: 'View detailed reports for your team',
            icon: <BarChart3 className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
            onClick: () => console.log('Navigate to reports')
          },
          {
            title: 'Manage Rules',
            description: 'Configure approval rules for your team',
            icon: <Settings className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
            onClick: () => console.log('Navigate to rules')
          }
        ]
      
      default: // EMPLOYEE
        return [
          {
            title: 'Submit Expense',
            description: 'Add a new business expense with receipt',
            icon: <Plus className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
            onClick: () => window.location.href = '/expenses/new'
          },
          {
            title: 'View History',
            description: 'See all your submitted expenses and their status',
            icon: <FileText className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
            onClick: () => console.log('Navigate to expense history')
          },
          {
            title: 'Scan Receipt',
            description: 'Use OCR to automatically extract expense data',
            icon: <Camera className="w-6 h-6" />,
            gradient: 'bg-gradient-to-r from-success-500 to-success-600',
            onClick: () => window.location.href = '/expenses/new'
          }
        ]
    }
  }

  const statsCards = getStatsCards()
  const quickActions = getQuickActions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getWelcomeMessage()}, {user.fullName.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600">
                  {user.company.name} • {user.company.baseCurrency}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {user.role === 'ADMIN' ? 'System Overview' : 
                     user.role === 'MANAGER' ? 'Team Management' : 
                     'Your Expenses'}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {user.role === 'ADMIN' ? 'Monitor and manage your entire organization' :
                     user.role === 'MANAGER' ? 'Keep track of your team\'s expense activities' :
                     'Track and manage your business expenses efficiently'}
                  </p>
                </div>
                
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {user.role === 'ADMIN' ? <BarChart3 className="w-16 h-16" /> :
                     user.role === 'MANAGER' ? <Users className="w-16 h-16" /> :
                     <Receipt className="w-16 h-16" />}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={stat.title}
                {...stat}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                Most used features
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.title}
                  {...action}
                  delay={index * 150}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-gradient p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">New expense submitted</p>
                    <p className="text-sm text-gray-600">Office supplies - $45.99</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">2 hours ago</p>
                    <span className="badge-pending">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}