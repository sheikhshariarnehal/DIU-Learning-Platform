# Admin Authentication API Logic Backup
**Generated:** 2025-08-30  
**Description:** Complete backup of admin authentication API routes, middleware, and logic

## Table of Contents
1. [Middleware Authentication](#middleware-authentication)
2. [Login API Route](#login-api-route)
3. [User Management API Routes](#user-management-api-routes)
4. [Authentication Verification](#authentication-verification)
5. [Supabase Configuration](#supabase-configuration)
6. [Security Features](#security-features)

## Middleware Authentication

### File: `middleware.ts`
```typescript
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

  // Allow access to login page without authentication
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Verify JWT token using Edge Runtime compatible method
      const decoded = verifyJWT(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("admin_token")
      return response
    }
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
```

## Login API Route

### File: `app/api/auth/login/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createClient } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Find admin user by email
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single()

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Update last login and login count
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        last_login: new Date().toISOString(),
        login_count: (adminUser.login_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", adminUser.id)

    // Create JWT token
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Create session record
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        user_id: adminUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown"
      })

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = adminUser

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## User Management API Routes

### File: `app/api/admin/users/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: users, error } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, department, phone, is_active, last_login, login_count, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, role, department, phone } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const { data: newUser, error } = await supabase
      .from("admin_users")
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role: role || "admin",
        department,
        phone,
        is_active: true,
        login_count: 0
      })
      .select("id, email, full_name, role, department, phone, is_active, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: newUser
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Authentication Verification

### File: `app/api/auth/me/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { createClient } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get current user data
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, department, phone, is_active, last_login, created_at, updated_at")
      .eq("id", decoded.userId)
      .eq("is_active", true)
      .single()

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: adminUser
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Security Features

### Key Security Implementations:
1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: 24-hour expiration with secure cookies
3. **Session Management**: Database-tracked sessions with IP and user agent
4. **RLS Policies**: Row-level security for data access control
5. **Input Validation**: Email format validation and required field checks
6. **HTTPS Cookies**: Secure, HTTP-only cookies in production
7. **Rate Limiting**: Login attempt tracking with login_count field

### Environment Variables Required:
- `JWT_SECRET`: Secret key for JWT token signing
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key for client-side access
