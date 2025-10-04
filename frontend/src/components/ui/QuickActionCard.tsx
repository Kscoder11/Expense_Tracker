import React from 'react'
import { clsx } from 'clsx'

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  gradient: string
  delay?: number
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  gradient,
  delay = 0
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-6 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm',
        'hover:shadow-xl hover:-translate-y-2 hover:border-purple-300/50',
        'transition-all duration-300 group animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start space-x-4">
        <div className={clsx(
          'w-14 h-14 rounded-xl flex items-center justify-center text-white',
          'transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
          gradient
        )}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
    </button>
  )
}