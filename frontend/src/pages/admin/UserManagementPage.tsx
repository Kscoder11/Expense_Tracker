import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Crown,
  User as UserIcon
} from 'lucide-react'
import { usersAPI } from '../../lib/api'
import { PremiumButton } from '../../components/ui/PremiumButton'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import type { User } from '../../types'

interface UserManagementPageProps {}

export const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading } = useQuery(
    ['users', { search, role: roleFilter, page }],
    () => usersAPI.getUsers({ search, role: roleFilter, page, limit: 10 }),
    {
      keepPreviousData: true,
      staleTime: 30000
    }
  )

  // Fetch managers for assignment
  const { data: managers } = useQuery('managers', usersAPI.getManagers)

  // Delete user mutation
  const deleteUserMutation = useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users')
    }
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'MANAGER':
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
    
    switch (role) {
      case 'ADMIN':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`
      case 'MANAGER':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-300`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage company users, roles, and permissions</p>
        </div>
        
        <PremiumButton
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-lg"
        >
          Add User
        </PremiumButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-gradient p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {usersData?.pagination.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-gradient p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {usersData?.users.filter((u: User) => u.role === 'ADMIN').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-gradient p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {usersData?.users.filter((u: User) => u.role === 'MANAGER').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card-gradient p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {usersData?.users.filter((u: User) => u.role === 'EMPLOYEE').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input pl-10 pr-8"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <LoadingSkeleton variant="circular" width={40} height={40} />
                        <div className="space-y-2">
                          <LoadingSkeleton width={120} height={16} />
                          <LoadingSkeleton width={160} height={14} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <LoadingSkeleton width={80} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <LoadingSkeleton width={100} height={16} />
                    </td>
                    <td className="px-6 py-4">
                      <LoadingSkeleton width={60} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <LoadingSkeleton width={32} height={32} />
                        <LoadingSkeleton width={32} height={32} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : usersData?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600 mb-4">
                        {search || roleFilter ? 'Try adjusting your filters' : 'Get started by adding your first user'}
                      </p>
                      <PremiumButton
                        onClick={() => setShowCreateModal(true)}
                        icon={<Plus className="w-4 h-4" />}
                        size="sm"
                      >
                        Add User
                      </PremiumButton>
                    </div>
                  </td>
                </tr>
              ) : (
                usersData?.users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getRoleBadge(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.manager ? (
                        <span className="text-sm text-gray-900">{user.manager.fullName}</span>
                      ) : (
                        <span className="text-sm text-gray-500">No manager</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-300">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                          <UserX className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                          disabled={deleteUserMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.pagination && usersData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((usersData.pagination.currentPage - 1) * 10) + 1} to{' '}
              {Math.min(usersData.pagination.currentPage * 10, usersData.pagination.totalUsers)} of{' '}
              {usersData.pagination.totalUsers} users
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!usersData.pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm font-medium">
                Page {usersData.pagination.currentPage} of {usersData.pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={!usersData.pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal would go here */}
      {/* For now, we'll implement this in the next phase */}
    </div>
  )
}