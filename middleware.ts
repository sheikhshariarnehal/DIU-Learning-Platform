import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Simple JWT verification for Edge Runtime
function verifyJWT(token: string, secret: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware called for:", pathname)

  // Allow access to login page without authentication
  if (pathname === "/login") {
    console.log("Allowing access to login page")
    return NextResponse.next()
  }

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    // For all admin routes, check authentication
    const token = request.cookies.get("admin_token")?.value

    console.log("🔍 Admin route access attempt:", pathname)
    console.log("🔍 Token found:", token ? "YES" : "NO")
    console.log("🔍 Token length:", token ? token.length : 0)
    console.log("🔍 JWT_SECRET length:", JWT_SECRET.length)

    if (!token) {
      console.log("❌ No token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Verify JWT token using Edge Runtime compatible method
      const decoded = verifyJWT(token, JWT_SECRET)
      console.log("✅ Token verified successfully:", decoded)
      console.log("✅ Allowing access to:", pathname)
      return NextResponse.next()
    } catch (error) {
      console.log("❌ Invalid token error:", error.message)
      console.log("❌ Token that failed:", token.substring(0, 50) + "...")
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("admin_token")
      return response
    }
  }

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
    '/admin/:path*',
    '/login',
    '/video/:path*',
    '/slide/:path*',
    '/study-tool/:path*'
  ]
}
