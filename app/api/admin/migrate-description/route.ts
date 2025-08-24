import { NextRequest, NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const db = createDB()

    // Try to add the description column using raw SQL
    const { error } = await db.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name='study_tools' AND column_name='description') THEN
                ALTER TABLE study_tools ADD COLUMN description TEXT;
            END IF;
        END $$;
      `
    })

    if (error) {
      console.error('Migration error:', error)
      return NextResponse.json({
        success: false,
        message: 'Failed to add description column',
        error: error.message,
        instruction: 'Please run this SQL manually: ALTER TABLE study_tools ADD COLUMN description TEXT;'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Description column added successfully'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      instruction: 'Please run this SQL manually: ALTER TABLE study_tools ADD COLUMN description TEXT;'
    }, { status: 500 })
  }
}
