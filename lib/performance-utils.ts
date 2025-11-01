/**
 * Performance optimization utilities for course cards
 */

/**
 * Debounce function for optimizing rapid event calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options)
  } else {
    setTimeout(callback, options.timeout || 100)
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  if (typeof performance === 'undefined') return { start: () => {}, end: () => {} }
  
  const start = () => {
    performance.mark(`${componentName}-start`)
  }
  
  const end = () => {
    performance.mark(`${componentName}-end`)
    performance.measure(
      componentName,
      `${componentName}-start`,
      `${componentName}-end`
    )
    
    const measure = performance.getEntriesByName(componentName)[0]
    if (measure) {
      console.log(`⚡ ${componentName} rendered in ${measure.duration.toFixed(2)}ms`)
    }
    
    // Cleanup
    performance.clearMarks(`${componentName}-start`)
    performance.clearMarks(`${componentName}-end`)
    performance.clearMeasures(componentName)
  }
  
  return { start, end }
}

/**
 * Preload image for faster display
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') {
    return null
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  })
}

/**
 * Optimize animation performance
 */
export function optimizeAnimation() {
  // Enable GPU acceleration hints
  const style = document.createElement('style')
  style.textContent = `
    .will-change-transform {
      will-change: transform;
    }
    .will-change-opacity {
      will-change: opacity;
    }
    .gpu-accelerated {
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
  `
  if (!document.getElementById('animation-optimization')) {
    style.id = 'animation-optimization'
    document.head.appendChild(style)
  }
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(callback: () => void): void {
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(callback)
  } else {
    callback()
  }
}

/**
 * Prefetch links for faster navigation
 */
export function prefetchLink(href: string): void {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Adaptive loading based on network speed
 */
export function getNetworkSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'medium'
  }
  
  const connection = (navigator as any).connection
  const effectiveType = connection?.effectiveType
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow'
  } else if (effectiveType === '3g') {
    return 'medium'
  } else {
    return 'fast'
  }
}

/**
 * Memory-efficient data fetching
 */
export function shouldLoadData(): boolean {
  if (typeof navigator === 'undefined') return true
  
  const connection = (navigator as any).connection
  
  // Don't auto-load on save-data mode
  if (connection?.saveData) {
    return false
  }
  
  // Consider device memory
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory && deviceMemory < 4) {
    return false
  }
  
  return true
}

/**
 * Priority hints for resource loading
 */
export function setPriorityHint(element: HTMLElement, priority: 'high' | 'low' | 'auto'): void {
  element.setAttribute('fetchpriority', priority)
}

/**
 * Optimize scroll performance
 */
export function optimizeScrolling(container: HTMLElement): () => void {
  let ticking = false
  
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Your scroll handling logic here
        ticking = false
      })
      ticking = true
    }
  }
  
  container.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    container.removeEventListener('scroll', handleScroll)
  }
}
