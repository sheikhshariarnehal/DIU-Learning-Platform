import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("🔍 Debug Login - Starting login process for:", email)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json(
        { success: false, error: "Email and password are required", step: "validation" },
        { status: 400 }
      )
    }

    const supabase = createClient()
    console.log("✅ Supabase client created")

    // Find admin user by email
    console.log("🔍 Looking for user with email:", email.toLowerCase())
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single()

    console.log("📊 User query result:", { adminUser: adminUser ? "found" : "not found", userError })

    if (userError || !adminUser) {
      console.log("❌ User not found or error:", userError)
      return NextResponse.json(
        { success: false, error: "Invalid credentials", step: "user_lookup", details: userError },
        { status: 401 }
      )
    }

    console.log("✅ User found:", { id: adminUser.id, email: adminUser.email, role: adminUser.role })

    // Verify password
    console.log("🔍 Verifying password...")
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    console.log("📊 Password verification result:", isValidPassword)
    
    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json(
        { success: false, error: "Invalid credentials", step: "password_verification" },
        { status: 401 }
      )
    }

    console.log("✅ Password verified")

    // Create JWT token
    console.log("🔍 Creating JWT token...")
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )
    console.log("✅ JWT token created")

    // Create session in database
    console.log("🔍 Creating session in database...")
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
      console.error("❌ Error creating session:", sessionError)
      return NextResponse.json(
        { success: false, error: "Session creation failed", step: "session_creation", details: sessionError },
        { status: 500 }
      )
    }

    console.log("✅ Session created successfully")

    // Update last login and login count
    console.log("🔍 Updating login stats...")
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        last_login: new Date().toISOString(),
        login_count: (adminUser.login_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", adminUser.id)

    if (updateError) {
      console.error("⚠️ Error updating login stats:", updateError)
    } else {
      console.log("✅ Login stats updated")
    }

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = adminUser

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      step: "complete"
    })

    // Set HTTP-only cookie
    console.log("🔍 Setting cookie...")
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    })

    console.log("✅ Login process completed successfully")
    return response

  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", step: "exception", details: error },
      { status: 500 }
    )
  }
}
