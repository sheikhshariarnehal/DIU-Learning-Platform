import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Helper function to verify section admin authorization
async function verifySectionAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return { error: "No token provided", status: 401 }
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return { error: "Invalid token", status: 401 }
    }

    // Get current user data
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, department, is_active")
      .eq("id", decoded.userId)
      .eq("is_active", true)
      .single()

    if (userError || !adminUser) {
      return { error: "User not found or inactive", status: 401 }
    }

    // Check if user has section admin role or higher
    if (!["section_admin", "admin", "super_admin"].includes(adminUser.role)) {
      return { error: "Insufficient permissions", status: 403 }
    }

    return { user: adminUser }
  } catch (error) {
    console.error("Authorization error:", error)
    return { error: "Internal server error", status: 500 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!

    // Build base query with section filtering for section admins
    let semesterQuery = supabase.from("semesters").select("*")
    let courseQuery = supabase.from("courses").select("*, semester:semesters!inner(*)")
    let topicQuery = supabase.from("topics").select("*, course:courses!inner(*, semester:semesters!inner(*))")
    let studyToolQuery = supabase.from("study_tools").select("*, course:courses!inner(*, semester:semesters!inner(*))")

    // If user is section admin, filter by their department/section
    if (user.role === "section_admin" && user.department) {
      semesterQuery = semesterQuery.eq("section", user.department)
      courseQuery = courseQuery.eq("semester.section", user.department)
      topicQuery = topicQuery.eq("course.semester.section", user.department)
      studyToolQuery = studyToolQuery.eq("course.semester.section", user.department)
    }

    // Execute all queries in parallel
    const [
      { data: semesters, error: semesterError },
      { data: courses, error: courseError },
      { data: topics, error: topicError },
      { data: studyTools, error: studyToolError }
    ] = await Promise.all([
      semesterQuery,
      courseQuery,
      topicQuery,
      studyToolQuery
    ])

    if (semesterError || courseError || topicError || studyToolError) {
      console.error("Database errors:", { semesterError, courseError, topicError, studyToolError })
      return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
    }

    // Calculate statistics
    const activeSemesters = semesters?.filter(s => s.is_active) || []
    const totalSemesters = semesters?.length || 0
    const totalCourses = courses?.length || 0
    const totalTopics = topics?.length || 0
    const totalStudyTools = studyTools?.length || 0
    const totalMaterials = totalTopics + totalStudyTools

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSemesters = semesters?.filter(s => 
      new Date(s.created_at) > thirtyDaysAgo
    ) || []

    const recentCourses = courses?.filter(c => 
      new Date(c.created_at) > thirtyDaysAgo
    ) || []

    // Calculate engagement metrics (mock data for now)
    const engagementRate = Math.floor(Math.random() * 20) + 80 // 80-100%
    const averageRating = (Math.random() * 1 + 4).toFixed(1) // 4.0-5.0

    // Get section-specific data
    const sectionData = user.department ? {
      section: user.department,
      semesters: totalSemesters,
      activeSemesters: activeSemesters.length,
      courses: totalCourses,
      materials: totalMaterials
    } : null

    // Recent activity summary
    const recentActivity = [
      {
        type: "semesters_created",
        count: recentSemesters.length,
        period: "last 30 days"
      },
      {
        type: "courses_added",
        count: recentCourses.length,
        period: "last 30 days"
      },
      {
        type: "materials_uploaded",
        count: Math.floor(Math.random() * 20) + 5, // Mock data
        period: "last 7 days"
      }
    ]

    const stats = {
      overview: {
        totalSemesters,
        activeSemesters: activeSemesters.length,
        totalCourses,
        totalMaterials,
        engagementRate,
        averageRating: parseFloat(averageRating)
      },
      breakdown: {
        semesters: {
          total: totalSemesters,
          active: activeSemesters.length,
          inactive: totalSemesters - activeSemesters.length
        },
        content: {
          courses: totalCourses,
          topics: totalTopics,
          studyTools: totalStudyTools,
          totalMaterials
        }
      },
      recent: {
        activity: recentActivity,
        newSemesters: recentSemesters.length,
        newCourses: recentCourses.length
      },
      section: sectionData,
      trends: {
        semesterGrowth: recentSemesters.length > 0 ? "positive" : "stable",
        courseGrowth: recentCourses.length > 0 ? "positive" : "stable",
        engagementTrend: engagementRate > 85 ? "positive" : "stable"
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
