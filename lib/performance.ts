// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  cacheHitRate: number
  memoryUsage: number
  bundleSize?: number
}

interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: string
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming)
          }
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming)
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.recordPaintMetrics(entry)
          }
        })
      })
      paintObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(paintObserver)

    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const loadTime = entry.loadEventEnd - entry.navigationStart
    const renderTime = entry.domContentLoadedEventEnd - entry.navigationStart
    
    this.metrics.set('navigation', {
      loadTime,
      renderTime,
      cacheHitRate: 0,
      memoryUsage: this.getMemoryUsage()
    })
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    // Track resource loading performance
    const duration = entry.responseEnd - entry.startTime
    const resourceType = this.getResourceType(entry.name)
    
    if (resourceType === 'script' || resourceType === 'stylesheet') {
      this.metrics.set(`resource-${resourceType}`, {
        loadTime: duration,
        renderTime: 0,
        cacheHitRate: entry.transferSize === 0 ? 1 : 0,
        memoryUsage: this.getMemoryUsage()
      })
    }
  }

  private recordPaintMetrics(entry: PerformanceEntry) {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.set('fcp', {
        loadTime: entry.startTime,
        renderTime: entry.startTime,
        cacheHitRate: 0,
        memoryUsage: this.getMemoryUsage()
      })
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    return 'other'
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Public methods
  startTiming(name: string) {
    if (typeof window !== 'undefined') {
      performance.mark(`${name}-start`)
    }
  }

  endTiming(name: string) {
    if (typeof window !== 'undefined') {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measure = performance.getEntriesByName(name, 'measure')[0]
      if (measure) {
        this.metrics.set(name, {
          loadTime: measure.duration,
          renderTime: measure.duration,
          cacheHitRate: 0,
          memoryUsage: this.getMemoryUsage()
        })
      }
    }
  }

  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name)
  }

  // Core Web Vitals
  getCoreWebVitals(): Promise<{
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
  }> {
    return new Promise((resolve) => {
      const vitals: any = {}

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
          lcpObserver.disconnect()
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      }

      // Cumulative Layout Shift
      if ('PerformanceObserver' in window) {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          vitals.cls = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      }

      // Return after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 2000)
    })
  }

  // Report performance data
  reportPerformance() {
    const metrics = Object.fromEntries(this.metrics)
    console.group('🚀 Performance Metrics')
    console.table(metrics)
    console.groupEnd()
    
    return metrics
  }

  // Cleanup
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions
export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  performanceMonitor.startTiming(name)
  return fn().finally(() => {
    performanceMonitor.endTiming(name)
  })
}

export function measureSync<T>(name: string, fn: () => T): T {
  performanceMonitor.startTiming(name)
  try {
    return fn()
  } finally {
    performanceMonitor.endTiming(name)
  }
}

// Performance optimization helpers
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
