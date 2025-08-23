import { track } from '@vercel/analytics'

/**
 * Enhanced analytics utility that combines internal analytics with Vercel Analytics
 */

export interface AnalyticsEvent {
  contentId: string
  contentType: 'slide' | 'video' | 'study_tool'
  action: 'view' | 'download' | 'share'
  metadata?: Record<string, any>
}

export interface PerformanceEvent {
  componentName: string
  renderTime: number
  isSlowRender: boolean
}

/**
 * Track content interactions
 */
export async function trackContentEvent(event: AnalyticsEvent) {
  try {
    // Send to internal analytics API
    await fetch("/api/analytics/content-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: event.contentId,
        contentType: event.contentType,
        timestamp: new Date().toISOString(),
        ...event.metadata,
      }),
    })

    // Send to Vercel Analytics
    track('content_interaction', {
      content_id: event.contentId,
      content_type: event.contentType,
      action: event.action,
      ...event.metadata,
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

/**
 * Track download events
 */
export async function trackDownloadEvent(event: Omit<AnalyticsEvent, 'action'>) {
  try {
    // Send to internal analytics API
    await fetch("/api/analytics/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: event.contentId,
        contentType: event.contentType,
        timestamp: new Date().toISOString(),
        ...event.metadata,
      }),
    })

    // Send to Vercel Analytics
    track('content_download', {
      content_id: event.contentId,
      content_type: event.contentType,
      ...event.metadata,
    })
  } catch (error) {
    console.error('Download analytics error:', error)
  }
}

/**
 * Track performance metrics
 */
export function trackPerformance(event: PerformanceEvent) {
  try {
    // Only track slow renders in production
    if (process.env.NODE_ENV === 'production' && event.isSlowRender) {
      track('slow_render', {
        component: event.componentName,
        render_time: event.renderTime,
      })
    }
  } catch (error) {
    console.error('Performance tracking error:', error)
  }
}

/**
 * Track user navigation
 */
export function trackNavigation(page: string, metadata?: Record<string, any>) {
  try {
    track('page_view', {
      page,
      ...metadata,
    })
  } catch (error) {
    console.error('Navigation tracking error:', error)
  }
}

/**
 * Track search events
 */
export function trackSearch(query: string, results: number, metadata?: Record<string, any>) {
  try {
    track('search', {
      query,
      results_count: results,
      ...metadata,
    })
  } catch (error) {
    console.error('Search tracking error:', error)
  }
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string, metadata?: Record<string, any>) {
  try {
    track('user_engagement', {
      action,
      ...metadata,
    })
  } catch (error) {
    console.error('Engagement tracking error:', error)
  }
}

/**
 * Track errors
 */
export function trackError(error: string, context?: Record<string, any>) {
  try {
    track('error', {
      error_message: error,
      ...context,
    })
  } catch (error) {
    console.error('Error tracking error:', error)
  }
}
