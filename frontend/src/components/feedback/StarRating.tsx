// frontend/src/components/feedback/StarRating.tsx
'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md'
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div 
      className="flex gap-1"
      onMouseLeave={handleMouseLeave}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= (hoverRating || rating)
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            disabled={readonly}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 rounded'
            )}
            aria-label={`Rate ${index} out of 5 stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-none text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
