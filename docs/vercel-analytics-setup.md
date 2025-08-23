# Vercel Analytics Integration

This document outlines how Vercel Analytics has been integrated into the DIU Learning Platform.

## Overview

Vercel Analytics provides real-time insights into your application's performance and user behavior. The integration includes both **Vercel Analytics** for user tracking and **Vercel Speed Insights** for performance monitoring.

## What's Been Added

### 1. Dependencies Installed
- `@vercel/analytics` - For user behavior tracking
- `@vercel/speed-insights` - For performance monitoring

### 2. Core Integration

#### Root Layout (`app/layout.tsx`)
```tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Added to the body of the layout
<Analytics />
<SpeedInsights />
```

### 3. Enhanced Analytics Utility (`lib/analytics.ts`)

A comprehensive analytics utility that combines:
- **Internal analytics** (existing API endpoints)
- **Vercel Analytics** (new tracking)

#### Key Functions:
- `trackContentEvent()` - Track content interactions (view, download, share)
- `trackDownloadEvent()` - Track file downloads
- `trackPerformance()` - Track slow renders and performance issues
- `trackNavigation()` - Track page views
- `trackSearch()` - Track search queries
- `trackEngagement()` - Track user engagement
- `trackError()` - Track errors and exceptions

### 4. Updated Components

#### Main Page (`app/page.tsx`)
- Updated `handleContentSelect()` to use enhanced analytics
- Updated `handleDownload()` to use enhanced analytics
- Added error tracking for failed operations

#### Performance Hook (`hooks/use-performance.ts`)
- Integrated with Vercel Analytics for slow render tracking
- Automatically tracks performance issues in production

## Analytics Events Being Tracked

### Content Interactions
- **Event**: `content_interaction`
- **Data**: content_id, content_type, action, title, topic, course
- **Triggers**: When users view content

### Downloads
- **Event**: `content_download`
- **Data**: content_id, content_type, title, topic, course
- **Triggers**: When users download files

### Performance
- **Event**: `slow_render`
- **Data**: component, render_time
- **Triggers**: When renders take >200ms

### Errors
- **Event**: `error`
- **Data**: error_message, context
- **Triggers**: When operations fail

## Vercel Dashboard Access

Once deployed to Vercel, you can access analytics at:
- **Analytics**: `https://vercel.com/[your-team]/[project-name]/analytics`
- **Speed Insights**: `https://vercel.com/[your-team]/[project-name]/speed-insights`

## Benefits

### User Analytics
- Track which content is most popular
- Understand user navigation patterns
- Monitor engagement metrics
- Identify content performance

### Performance Monitoring
- Real-time Core Web Vitals
- Page load performance
- Component render times
- Performance bottlenecks

### Error Tracking
- Failed content loads
- Download errors
- Performance issues
- User experience problems

## Privacy & Compliance

Vercel Analytics is privacy-friendly:
- No cookies used
- GDPR compliant
- No personal data collection
- Aggregated metrics only

## Development vs Production

- **Development**: Only console logging for performance
- **Production**: Full analytics tracking enabled
- **Error tracking**: Enabled in both environments

## Next Steps

1. **Deploy to Vercel** to start collecting analytics
2. **Monitor the dashboard** for insights
3. **Set up alerts** for performance issues
4. **Analyze user behavior** to improve content strategy

## Custom Events

You can add custom tracking anywhere in the app:

```tsx
import { trackEngagement } from '@/lib/analytics'

// Track custom user actions
trackEngagement('feature_used', {
  feature: 'search',
  query: 'machine learning'
})
```

## Troubleshooting

If analytics aren't showing:
1. Ensure the app is deployed to Vercel
2. Check that the project is properly configured
3. Verify no ad blockers are interfering
4. Check browser console for errors

The integration maintains backward compatibility with existing internal analytics while adding powerful Vercel Analytics capabilities.
