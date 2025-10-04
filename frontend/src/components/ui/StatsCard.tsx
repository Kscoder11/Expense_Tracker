import React, { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: React.ReactNode
  gradient: string
  delay?: number
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  gradient,
  delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Animate counter
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      
      if (typeof value === 'number') {
        let start = 0
        const end = value
        const duration = 1000
        const increment = end / (duration / 16)
        
        const counter = setInterval(() => {
          start += increment
          if (start >= end) {
            setDisplayValue(end)
            clearInterval(counter)
          } else {
            setDisplayValue(Math.floor(start))
          }
        }, 16)
        
        return () => clearInterval(counter)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  const changeIcon = change?.type === 'increase' ? '↗' : change?.type === 'decrease' ? '↘' : '→'
  const changeColor = change?.type === 'increase' ? 'text-success-600' : change?.type === 'decrease' ? 'text-danger-600' : 'text-gray-500'

  return (
    <div 
      className={clsx(
        'card-gradient p-6 group cursor-pointer',
        isVisible ? 'animate-slide-up' : 'opacity-0'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </p>
          
          {change && (
            <div className={clsx('flex items-center text-sm font-medium', changeColor)}>
              <span className="mr-1">{changeIcon}</span>
              {change.value}
            </div>
          )}
        </div>
        
        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center text-white transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
          gradient
        )}>
          {icon}
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}