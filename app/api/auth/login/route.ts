import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

    if (updateError) {
      console.error("Error updating login stats:", updateError)
    }

    // Create JWT token
    console.log("🔍 Creating JWT token with secret length:", JWT_SECRET.length)
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    console.log("✅ JWT token created, length:", token.length)
    console.log("🔍 Token preview:", token.substring(0, 50) + "...")

    // Create session in database
    const sessionToken = jwt.sign(
      { userId: adminUser.id, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        user_id: adminUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown"
      })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
    }

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = adminUser

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set HTTP-only cookie
    console.log("🔍 Setting cookie with NODE_ENV:", process.env.NODE_ENV)
    console.log("🔍 Cookie secure setting:", process.env.NODE_ENV === "production")
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 // 24 hours
    })
    console.log("✅ Cookie set successfully with path: /")

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
