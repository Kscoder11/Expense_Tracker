import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../lib/api'
import { AnimatedBackground, GlassMorphismCard, FloatingElement } from '../../components/ui/AnimatedBackground'
import { PremiumButton } from '../../components/ui/PremiumButton'
import { FloatingLabelInput } from '../../components/ui/FloatingLabelInput'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import type { ApiError } from '../../types'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  companyName: string
  country: string
}

export const SignupPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>()

  const password = watch('password')
  const watchedValues = watch()

  const [loadingFullCountries, setLoadingFullCountries] = useState(false)

  // Fetch top countries immediately for instant display
  const { data: countries, isLoading: countriesLoading } = useQuery(
    'countries-top',
    () => authAPI.getCountries(false),
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 1,
      onError: (error: any) => {
        console.error('Failed to fetch countries:', error)
      },
    }
  )

  // Load full countries list in background
  const { data: allCountries } = useQuery(
    'countries-all',
    () => authAPI.getCountries(true),
    {
      enabled: !countriesLoading && !!countries,
      staleTime: 60 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000,
      retry: 1,
      onSuccess: () => setLoadingFullCountries(false),
      onError: (error: any) => {
        console.error('Failed to fetch full countries:', error)
        setLoadingFullCountries(false)
      },
    }
  )

  // Use full list if available, otherwise use top countries
  const displayCountries = allCountries || countries || []

  useEffect(() => {
    if (countries && !allCountries) {
      setLoadingFullCountries(true)
    }
  }, [countries, allCountries])

  const signupMutation = useMutation(authAPI.signup, {
    onSuccess: (data) => {
      login(data.token, data.user)
    },
    onError: (error: any) => {
      const apiError = error.response?.data as ApiError
      setError(apiError?.message || 'Signup failed. Please try again.')
    },
  })

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = (data: SignupFormData) => {
    setError('')
    const { confirmPassword, ...signupData } = data
    signupMutation.mutate(signupData)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <FloatingElement delay={0}>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h1 className="text-5xl font-bold mb-4">
                <span className="block">Join the</span>
                <span className="block text-gradient bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Revolution
                </span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-md leading-relaxed">
                Transform how your company manages expenses with our cutting-edge platform
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">⚡</div>
                  <div className="text-sm text-white/80 mt-2">Lightning Fast</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">🔒</div>
                  <div className="text-sm text-white/80 mt-2">Bank-Level Security</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">📊</div>
                  <div className="text-sm text-white/80 mt-2">Smart Analytics</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">🌍</div>
                  <div className="text-sm text-white/80 mt-2">Global Support</div>
                </div>
              </div>
            </div>
          </FloatingElement>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gradient">Expense Manager</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Start managing expenses like a pro</p>
          </div>

          <GlassMorphismCard className="animate-slide-up">
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 text-danger-700 rounded-xl animate-scale-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelInput
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Full name must be at least 2 characters',
                    },
                  })}
                  label="Full Name"
                  type="text"
                  error={errors.fullName?.message}
                  success={watchedValues.fullName && !errors.fullName}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <FloatingLabelInput
                  {...register('companyName', {
                    required: 'Company name is required',
                    minLength: {
                      value: 2,
                      message: 'Company name must be at least 2 characters',
                    },
                  })}
                  label="Company Name"
                  type="text"
                  error={errors.companyName?.message}
                  success={watchedValues.companyName && !errors.companyName}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>

              <FloatingLabelInput
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                label="Email address"
                type="email"
                error={errors.email?.message}
                success={watchedValues.email && !errors.email}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <div className="space-y-2">
                <label className="label">Country</label>
                {countriesLoading ? (
                  <LoadingSkeleton height={48} className="rounded-xl" />
                ) : (
                  <div className="relative">
                    <select
                      {...register('country', {
                        required: 'Country is required',
                      })}
                      className="input pl-12"
                    >
                      <option value="">
                        Select your country
                        {loadingFullCountries && ' (loading more...)'}
                      </option>
                      {displayCountries.map((country) => (
                        <option key={country.name} value={country.name}>
                          {country.name} ({country.currency})
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                )}
                {errors.country && (
                  <p className="text-sm text-danger-600 flex items-center mt-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelInput
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  label="Password"
                  type="password"
                  error={errors.password?.message}
                  success={watchedValues.password && !errors.password}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <FloatingLabelInput
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  label="Confirm Password"
                  type="password"
                  error={errors.confirmPassword?.message}
                  success={watchedValues.confirmPassword && !errors.confirmPassword}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <PremiumButton
                type="submit"
                variant="primary"
                size="lg"
                loading={signupMutation.isLoading}
                className="w-full"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
              >
                {signupMutation.isLoading ? 'Creating account...' : 'Create account'}
              </PremiumButton>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </GlassMorphismCard>
        </div>
      </div>
    </div>
  )
}