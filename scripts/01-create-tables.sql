-- Create tables for the e-learning platform

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  section VARCHAR(50),
  has_midterm BOOLEAN DEFAULT true,
  has_final BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  google_drive_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  youtube_url TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study tools table
CREATE TABLE IF NOT EXISTS study_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('previous_questions', 'exam_note', 'syllabus', 'mark_distribution')),
  content_url TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_type VARCHAR(20) CHECK (exam_type IN ('midterm', 'final', 'both')) DEFAULT 'both',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
