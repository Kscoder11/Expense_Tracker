import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { ExpenseSubmissionPage } from './pages/employee/ExpenseSubmissionPage'
import { ApprovalPage } from './pages/manager/ApprovalPage'
import { Toaster } from './lib/toast'
import { AnimatedBackground } from './components/ui/AnimatedBackground'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background */}
        <AnimatedBackground />
        
        {/* Main content */}
        <div className="relative z-10">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            
            {/* Employee routes */}
            <Route
              path="/expenses/new"
              element={
                <ProtectedRoute>
                  <ExpenseSubmissionPage />
                </ProtectedRoute>
              }
            />
            
            {/* Manager routes */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute requiredRole="MANAGER">
                  <ApprovalPage />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App