export interface ExamNote {
  id: string
  title: string
  description: string | null
  content_url: string
  file_format: string | null
  file_size_mb: number | null
  exam_type: 'midterm' | 'final' | 'both' | 'assignment' | 'quiz'
  academic_year: string | null
  is_downloadable: boolean
  download_count: number
  created_at: string
  updated_at: string
  course_title: string | null
  course_code: string | null
  teacher_name: string | null
  semester_title: string | null
  section: string | null
}

export interface NotesFilter {
  search?: string
  examType?: string
  semester?: string
  courseCode?: string
}

export interface NotesApiResponse {
  success: boolean
  data?: ExamNote[]
  error?: string
}
