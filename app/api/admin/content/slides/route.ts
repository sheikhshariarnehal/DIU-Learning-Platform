import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

/* -------------------------------  helpers  -------------------------------- */
const selectProjection = `
  id,
  title,
  google_drive_url,
  order_index,
  topic_id,
  topic:topics (
    title,
    course:courses (
      title,
      semester:semesters ( title )
    )
  )
`

function mapRow(row: any) {
  return {
    ...row,
    url: row.google_drive_url,
    topic: {
      ...row.topic,
      course: {
        ...row.topic.course,
        semester: { name: row.topic.course.semester?.title ?? "" },
      },
    },
  }
}

/* ---------------------------------- GET ---------------------------------- */
export async function GET() {
  const db = createDB()
  const { data, error } = await db.from("slides").select(selectProjection).order("order_index")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []).map(mapRow))
}

/* ---------------------------------- POST --------------------------------- */
/* body: { title, url, topic_id, order_index? } */
export async function POST(req: NextRequest) {
  const { title, url, topic_id, order_index } = await req.json()
  const db = createDB()

  const { data, error } = await db
    .from("slides")
    .insert({ title, google_drive_url: url, topic_id, order_index })
    .select(selectProjection)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(mapRow(data))
}
