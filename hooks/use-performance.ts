import { useEffect, useRef, useState, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1
  })

  useEffect(() => {
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
      
      // Warn about slow renders
      if (renderTime > 100) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }

    // Send metrics to analytics in production (optional)
    if (process.env.NODE_ENV === 'production' && renderTime > 200) {
      // You can send this to your analytics service
      // analytics.track('slow_render', { componentName, renderTime })
    }
  })

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = performance.now()
    }
  }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Optimized form state management
export function useOptimizedFormState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const stateRef = useRef<T>(initialState)

  const updateState = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setState(prev => {
      const newState = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      stateRef.current = newState
      return newState
    })
  }, [])

  const getCurrentState = useCallback(() => stateRef.current, [])

  return {
    state,
    updateState,
    getCurrentState,
    resetState: () => setState(initialState)
  }
}
