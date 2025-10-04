import React from 'react'
import { clsx } from 'clsx'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  lines?: number
  height?: string | number
  width?: string | number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  lines = 1,
  height,
  width
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  }

  const style: React.CSSProperties = {}
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  if (width) style.width = typeof width === 'number' ? `${width}px` : width

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(baseClasses, variantClasses[variant])}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

// Pre-built skeleton components
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <LoadingSkeleton variant="text" width="25%" />
      <LoadingSkeleton height={40} />
    </div>
    <div className="space-y-2">
      <LoadingSkeleton variant="text" width="30%" />
      <LoadingSkeleton height={40} />
    </div>
    <div className="space-y-2">
      <LoadingSkeleton variant="text" width="20%" />
      <LoadingSkeleton height={40} />
    </div>
    <LoadingSkeleton height={48} className="mt-6" />
  </div>
)

export const CardSkeleton: React.FC = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <LoadingSkeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton variant="text" width="60%" />
        <LoadingSkeleton variant="text" width="40%" />
      </div>
    </div>
    <LoadingSkeleton variant="text" lines={2} />
    <div className="flex gap-2">
      <LoadingSkeleton height={32} width={80} />
      <LoadingSkeleton height={32} width={80} />
    </div>
  </div>
)

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-8">
      <LoadingSkeleton variant="text" width="40%" height={32} className="mb-2" />
      <LoadingSkeleton variant="text" width="60%" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="60%" />
              <LoadingSkeleton variant="text" width="40%" height={24} />
            </div>
            <LoadingSkeleton variant="circular" width={48} height={48} />
          </div>
        </div>
      ))}
    </div>
    
    {/* Content Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
)