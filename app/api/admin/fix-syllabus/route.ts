import { NextRequest, NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const db = createDB()

    // First, check if description column exists
    const { data: testData, error: testError } = await db
      .from('study_tools')
      .select('id, title, description, type')
      .eq('type', 'syllabus')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        success: false,
        message: 'Cannot access study_tools table or description column missing',
        error: testError.message,
        solution: 'Run the database migration script first'
      }, { status: 500 })
    }

    // Get all syllabus study tools
    const { data: syllabusTools, error: fetchError } = await db
      .from('study_tools')
      .select('*')
      .eq('type', 'syllabus')

    if (fetchError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch syllabus study tools',
        error: fetchError.message
      }, { status: 500 })
    }

    // Update syllabus tools that don't have description
    const toolsToUpdate = syllabusTools?.filter(tool => !tool.description) || []
    
    if (toolsToUpdate.length > 0) {
      const updates = toolsToUpdate.map(tool => ({
        id: tool.id,
        description: `# ${tool.title}

## Course Overview
This syllabus provides an overview of the course content, learning objectives, and assessment methods.

## Learning Objectives
- Understand the fundamental concepts covered in this course
- Apply theoretical knowledge to practical scenarios
- Develop critical thinking and problem-solving skills

## Assessment Methods
- Participation and Attendance: 10%
- Assignments and Projects: 30%
- Midterm Examination: 30%
- Final Examination: 30%

## Course Policies
Please refer to the course handbook for detailed policies on attendance, late submissions, and academic integrity.

*This syllabus is subject to change. Students will be notified of any modifications.*`
      }))

      for (const update of updates) {
        const { error: updateError } = await db
          .from('study_tools')
          .update({ description: update.description })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Failed to update syllabus ${update.id}:`, updateError)
        }
      }
    }

    // Get updated data
    const { data: updatedTools, error: finalError } = await db
      .from('study_tools')
      .select('*')
      .eq('type', 'syllabus')

    if (finalError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch updated syllabus tools',
        error: finalError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${syllabusTools?.length || 0} syllabus tools`,
      updated: toolsToUpdate.length,
      total: syllabusTools?.length || 0,
      tools: updatedTools
    })

  } catch (error) {
    console.error('Fix syllabus error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fix syllabus tools',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
