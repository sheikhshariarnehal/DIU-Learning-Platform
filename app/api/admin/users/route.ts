import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: users, error } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, department, phone, is_active, last_login, login_count, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin users:", error)
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
    console.error("Admin users API error:", error)
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
      console.error("Error creating admin user:", error)
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
    console.error("Create admin user error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
