import React, { useState, useRef } from 'react'
import { clsx } from 'clsx'

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  error,
  success,
  icon,
  endIcon,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    setHasValue(!!e.target.value)
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value)
    onChange?.(e)
  }

  const isActive = isFocused || hasValue

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          className={clsx(
            'w-full h-14 px-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl',
            'focus:bg-white/90 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20',
            'transition-all duration-300 text-gray-900 placeholder-transparent',
            'shadow-sm hover:shadow-md focus:shadow-lg',
            icon && 'pl-12',
            endIcon && 'pr-12',
            error && 'border-red-300/70 focus:border-red-500 focus:ring-red-500/20 bg-red-50/70',
            success && 'border-green-300/70 focus:border-green-500 focus:ring-green-500/20 bg-green-50/70',
            className
          )}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          {...props}
        />
        
        <label
          className={clsx(
            'absolute left-4 transition-all duration-300 pointer-events-none select-none',
            'text-gray-500 font-medium',
            icon && 'left-12',
            isActive 
              ? 'top-2 text-xs text-purple-600 font-semibold' 
              : 'top-1/2 -translate-y-1/2 text-sm',
            error && (isActive ? 'text-red-600' : 'text-red-500'),
            success && (isActive ? 'text-green-600' : 'text-green-500')
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
        </label>

        {endIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center text-sm text-danger-600 animate-slide-down">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Success message */}
      {success && !error && (
        <div className="mt-2 flex items-center text-sm text-success-600 animate-slide-down">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looks good!
        </div>
      )}
    </div>
  )
}