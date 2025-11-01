import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const services: any = {
      vercel: process.env.VERCEL ? 'deployed' : 'local',
      analytics: 'enabled'
    }

    // Check Supabase configuration
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    services.supabase_configured = hasSupabaseUrl && hasSupabaseKey ? 'yes' : 'no'

    // Test Supabase connection
    if (hasSupabaseUrl && hasSupabaseKey) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { error } = await supabase.from('semesters').select('count', { count: 'exact', head: true })
        services.database = error ? `error: ${error.message}` : 'connected'
      } catch (dbError: any) {
        services.database = `error: ${dbError?.message || 'connection failed'}`
      }
    } else {
      services.database = 'not configured'
    }

    // Basic health check
    const healthData = {
      status: services.database === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      services,
      config: {
        has_supabase_url: hasSupabaseUrl,
        has_supabase_key: hasSupabaseKey,
        has_jwt_secret: !!process.env.JWT_SECRET
      }
    }

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
