import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Temporarily disable middleware to debug
  console.log("Middleware called for:", pathname)

  // Check if the path matches our shareable URL patterns
  const shareablePatterns = [
    /^\/video\/[a-f0-9-]{36}$/i,
    /^\/slide\/[a-f0-9-]{36}$/i,
    /^\/study-tool\/[a-f0-9-]{36}$/i
  ]

  const isShareableUrl = shareablePatterns.some(pattern => pattern.test(pathname))
  console.log("Is shareable URL:", isShareableUrl, "for path:", pathname)

  if (isShareableUrl) {
    // Rewrite to the main page but keep the original URL in the browser
    const url = request.nextUrl.clone()
    url.pathname = '/'

    // Add the original path as a query parameter so we can access it
    url.searchParams.set('share_path', pathname)

    console.log("Rewriting to:", url.toString())
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/video/:path*',
    '/slide/:path*',
    '/study-tool/:path*'
  ]
}
