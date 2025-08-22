"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  isScrolling: boolean
  isSwiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

interface UseMobileTouchOptions {
  threshold?: number
  preventScroll?: boolean
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
  onTouchStart?: (touch: TouchState) => void
  onTouchMove?: (touch: TouchState) => void
  onTouchEnd?: (touch: TouchState) => void
}

export function useMobileTouch(options: UseMobileTouchOptions = {}) {
  const {
    threshold = 50,
    preventScroll = false,
    onSwipe,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } = options

  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isScrolling: false,
    isSwiping: false,
    direction: null
  })

  const touchStartRef = useRef<TouchState | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const newState: TouchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isScrolling: false,
      isSwiping: false,
      direction: null
    }

    touchStartRef.current = newState
    setTouchState(newState)
    onTouchStart?.(newState)
  }, [onTouchStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.startX
    const deltaY = touch.clientY - touchStartRef.current.startY

    const newState: TouchState = {
      ...touchStartRef.current,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      isScrolling: Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10,
      isSwiping: Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10,
      direction: Math.abs(deltaX) > Math.abs(deltaY) 
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up')
    }

    if (preventScroll && newState.isScrolling) {
      e.preventDefault()
    }

    setTouchState(newState)
    onTouchMove?.(newState)
  }, [preventScroll, onTouchMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const finalState = { ...touchState }

    // Check if it's a swipe gesture
    if (Math.abs(finalState.deltaX) > threshold || Math.abs(finalState.deltaY) > threshold) {
      if (finalState.direction && onSwipe) {
        onSwipe(finalState.direction)
      }
    }

    onTouchEnd?.(finalState)

    // Reset state
    touchStartRef.current = null
    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      isScrolling: false,
      isSwiping: false,
      direction: null
    })
  }, [touchState, threshold, onSwipe, onTouchEnd])

  const bindTouch = useCallback(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }), [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    touchState,
    bindTouch,
    isScrolling: touchState.isScrolling,
    isSwiping: touchState.isSwiping,
    direction: touchState.direction
  }
}

// Hook for detecting mobile device capabilities
export function useMobileCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isTouchDevice: false,
    hasHover: false,
    isHighDPI: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    viewportHeight: 0,
    viewportWidth: 0
  })

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        isHighDPI: window.devicePixelRatio > 1,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      })
    }

    updateCapabilities()
    window.addEventListener('resize', updateCapabilities)
    window.addEventListener('orientationchange', updateCapabilities)

    return () => {
      window.removeEventListener('resize', updateCapabilities)
      window.removeEventListener('orientationchange', updateCapabilities)
    }
  }, [])

  return capabilities
}

// Hook for mobile-optimized scrolling
export function useMobileScroll(elementRef: React.RefObject<HTMLElement>) {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      setIsScrolling(true)
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      element.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [elementRef])

  return { isScrolling }
}
