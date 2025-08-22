import React from 'react'
import { cn } from '@/lib/utils'

interface ProfessionalTopicTitleProps {
  index?: number
  title: string
  maxLength?: number
  className?: string
  showIndex?: boolean
  showCharacterCount?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

// Smart text truncation utility
const smartTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  
  // Try to find a good breaking point (space, dash, colon, period)
  const breakPoints = [' ', '-', ':', '.', ',', ';']
  let bestBreak = -1
  
  // Look for break points in the latter half of the allowed length
  for (let i = Math.floor(maxLength * 0.6); i < maxLength; i++) {
    if (breakPoints.includes(text[i])) {
      bestBreak = i
    }
  }
  
  // If we found a good break point, use it
  if (bestBreak > 0) {
    return text.substring(0, bestBreak) + '...'
  }
  
  // Otherwise, truncate at maxLength and add ellipsis
  return text.substring(0, maxLength - 3) + '...'
}

// Format topic title with professional truncation
const formatTopicTitle = (
  title: string, 
  index?: number, 
  maxLength: number = 45,
  showIndex: boolean = true
): string => {
  if (!showIndex) {
    return smartTruncate(title, maxLength)
  }
  
  const prefix = `${(index ?? 0) + 1}. `
  const availableLength = maxLength - prefix.length
  
  if (title.length <= availableLength) {
    return `${prefix}${title}`
  }
  
  return `${prefix}${smartTruncate(title, availableLength)}`
}

export const ProfessionalTopicTitle: React.FC<ProfessionalTopicTitleProps> = ({
  index,
  title,
  maxLength = 45,
  className,
  showIndex = true,
  showCharacterCount = false,
  variant = 'default'
}) => {
  const isTruncated = title.length > maxLength
  const displayTitle = formatTopicTitle(title, index, maxLength, showIndex)
  
  const baseClasses = "topic-title-professional"
  const variantClasses = {
    default: "text-sm font-medium",
    compact: "text-xs font-medium",
    detailed: "text-base font-semibold"
  }
  
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          baseClasses,
          variantClasses[variant],
          isTruncated && "text-truncate-fade truncated",
          className
        )}
        title={showIndex ? `${(index ?? 0) + 1}. ${title}` : title}
      >
        {displayTitle}
      </span>
      
      {showCharacterCount && isTruncated && (
        <span className="text-xs text-muted-foreground mt-0.5">
          {title.length} characters
        </span>
      )}
    </div>
  )
}

// Hook for responsive max length based on container width
export const useResponsiveMaxLength = (containerRef: React.RefObject<HTMLElement>) => {
  const [maxLength, setMaxLength] = React.useState(45)
  
  React.useEffect(() => {
    const updateMaxLength = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        if (width < 200) {
          setMaxLength(25)
        } else if (width < 300) {
          setMaxLength(35)
        } else if (width < 400) {
          setMaxLength(45)
        } else {
          setMaxLength(60)
        }
      }
    }
    
    updateMaxLength()
    window.addEventListener('resize', updateMaxLength)
    
    return () => window.removeEventListener('resize', updateMaxLength)
  }, [containerRef])
  
  return maxLength
}

export default ProfessionalTopicTitle
