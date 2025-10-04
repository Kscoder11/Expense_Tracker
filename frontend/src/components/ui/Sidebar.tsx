import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { 
  LayoutDashboard, 
  Receipt, 
  CheckCircle, 
  Settings, 
  Users, 
  BarChart3,
  Menu,
  X,
  LogOut,
  Building2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Receipt, label: 'Expenses', path: '/expenses' },
    ]

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Settings, label: 'Rules', path: '/rules' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Building2, label: 'Company', path: '/company' },
      ]
    }

    if (user?.role === 'MANAGER') {
      return [
        ...baseItems,
        { icon: CheckCircle, label: 'Approvals', path: '/approvals' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Rules', path: '/rules' },
      ]
    }

    return baseItems
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Expense Manager</h1>
              <p className="text-xs text-gray-500">{user?.company.name}</p>
            </div>
          </div>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
              {user?.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'nav-item group',
                  isActive && 'active'
                )}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
                
                {isActive && (
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <Menu className="w-6 h-6 text-gray-700" />
    </button>
  )
}