import React, { useState } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'glassmorphism'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  ripple?: boolean
  glow?: boolean
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  ripple = true,
  glow = false,
  className,
  onClick,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 600)
    }
    onClick?.(e)
  }

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base'
  }

  const getVariantClasses = () => {
    const baseClasses = 'relative overflow-hidden font-semibold transition-all duration-300 transform'
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-purple-500/20`
      
      case 'glassmorphism':
        return `${baseClasses} bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl hover:scale-105 active:scale-95`
      
      case 'secondary':
        return `${baseClasses} bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-md hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95`
      
      case 'success':
        return `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-green-400/20`
      
      case 'danger':
        return `${baseClasses} bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-red-400/20`
      
      case 'ghost':
        return `${baseClasses} bg-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent hover:border-gray-200`
      
      default:
        return baseClasses
    }
  }

  return (
    <button
      className={clsx(
        'rounded-xl',
        getVariantClasses(),
        sizeClasses[size],
        glow && 'shadow-2xl shadow-purple-500/25',
        loading && 'pointer-events-none opacity-80',
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      {...props}
    >
      {/* Background glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-30 -z-10 animate-pulse" />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="opacity-80">Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="mr-2 transition-transform duration-200">{icon}</span>}
            <span className="transition-all duration-200">{children}</span>
          </>
        )}
      </div>
      
      {/* Ripple effect */}
      {ripple && isClicked && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
        </div>
      )}
      
      {/* Hover shimmer effect */}
      {isHovered && variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
      )}
    </button>
  )
}