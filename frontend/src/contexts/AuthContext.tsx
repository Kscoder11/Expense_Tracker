import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { authAPI } from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsInitialized(true)
  }, [])

  // Verify token and get current user
  const { isLoading } = useQuery(
    'currentUser',
    authAPI.me,
    {
      enabled: !!token && isInitialized,
      retry: false,
      onSuccess: (data) => {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      },
      onError: () => {
        // Token is invalid, clear auth state
        logout()
      },
    }
  )

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Call logout API (optional, for server-side cleanup)
    authAPI.logout().catch(console.error)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading: !isInitialized || (!!token && isLoading),
    isAuthenticated: !!user && !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}