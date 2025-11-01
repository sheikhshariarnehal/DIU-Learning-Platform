"use client"

import { memo, useRef, useState, useEffect, useCallback } from "react"
import { OptimizedTopicItem } from "./optimized-topic-item"

interface Topic {
  id: string
  title: string
  order_index: number
  [key: string]: any
}

interface VirtualTopicListProps {
  topics: Topic[]
  courseId: string
  courseTitle: string
  selectedContentId?: string
  expandedTopicIds: Set<string>
  onContentSelect: (type: string, title: string, url: string, id: string, topicTitle?: string, courseTitle?: string) => void
  onTopicToggle: (topicId: string) => void
  itemHeight?: number
  overscan?: number
}

/**
 * Virtual scrolling list for topics
 * Only renders visible topics for better performance with large lists
 */
export const VirtualTopicList = memo(({
  topics,
  courseId,
  courseTitle,
  selectedContentId,
  expandedTopicIds,
  onContentSelect,
  onTopicToggle,
  itemHeight = 60, // Estimated height per topic
  overscan = 3 // Number of items to render outside viewport
}: VirtualTopicListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Calculate which items should be visible
  const visibleRange = useCallback(() => {
    if (!containerHeight) return { start: 0, end: topics.length }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      topics.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { start, end }
  }, [scrollTop, containerHeight, topics.length, itemHeight, overscan])

  const { start, end } = visibleRange()

  // Handle scroll with throttling
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Update scroll position on scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const totalHeight = topics.length * itemHeight
  const offsetY = start * itemHeight

  return (
    <div 
      ref={containerRef}
      className="overflow-y-auto max-h-[500px] relative"
      style={{ height: '100%' }}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {topics.slice(start, end).map((topic, index) => (
            <OptimizedTopicItem
              key={topic.id}
              topic={topic}
              index={start + index}
              courseId={courseId}
              courseTitle={courseTitle}
              selectedContentId={selectedContentId}
              onContentSelect={onContentSelect}
              onTopicExpand={onTopicToggle}
              isExpanded={expandedTopicIds.has(topic.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

VirtualTopicList.displayName = "VirtualTopicList"

/**
 * Standard (non-virtual) topic list for smaller lists
 * Use this when you have fewer than ~20 topics
 */
export const StandardTopicList = memo(({
  topics,
  courseId,
  courseTitle,
  selectedContentId,
  expandedTopicIds,
  onContentSelect,
  onTopicToggle
}: Omit<VirtualTopicListProps, 'itemHeight' | 'overscan'>) => {
  return (
    <div className="ml-6 space-y-1 min-w-0">
      {topics.map((topic, index) => (
        <OptimizedTopicItem
          key={topic.id}
          topic={topic}
          index={index}
          courseId={courseId}
          courseTitle={courseTitle}
          selectedContentId={selectedContentId}
          onContentSelect={onContentSelect}
          onTopicExpand={onTopicToggle}
          isExpanded={expandedTopicIds.has(topic.id)}
        />
      ))}
    </div>
  )
})

StandardTopicList.displayName = "StandardTopicList"

/**
 * Smart topic list that automatically switches between virtual and standard
 * based on the number of topics
 */
export const SmartTopicList = memo((props: Omit<VirtualTopicListProps, 'itemHeight' | 'overscan'>) => {
  const VIRTUAL_THRESHOLD = 20 // Use virtual scrolling for more than 20 topics

  if (props.topics.length > VIRTUAL_THRESHOLD) {
    return <VirtualTopicList {...props} />
  }

  return <StandardTopicList {...props} />
})

SmartTopicList.displayName = "SmartTopicList"
