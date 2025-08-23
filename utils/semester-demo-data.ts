// Demo data generator for semester management testing

export interface DemoSemesterData {
  semester: {
    title: string
    description: string
    section: string
    has_midterm: boolean
    has_final: boolean
    start_date: string
    end_date: string
    default_credits: number
    is_active: boolean
  }
  courses: Array<{
    title: string
    course_code: string
    teacher_name: string
    teacher_email: string
    credits: number
    description: string
    topics: Array<{
      title: string
      description: string
      order_index: number
      slides: Array<{
        title: string
        url: string
        description: string
      }>
      videos: Array<{
        title: string
        url: string
        description: string
      }>
    }>
    studyTools: Array<{
      title: string
      type: string
      content_url: string
      exam_type: string
      description: string
    }>
  }>
}

export const generateDemoSemester = (): DemoSemesterData => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const isSpring = currentMonth >= 0 && currentMonth <= 5
  const semesterName = isSpring ? "Spring" : "Fall"
  
  return {
    semester: {
      title: `${semesterName} ${currentYear}`,
      description: `${semesterName} semester ${currentYear} for Computer Science and Engineering students. This semester focuses on advanced programming concepts, software engineering principles, and emerging technologies.`,
      section: "63_G",
      has_midterm: true,
      has_final: true,
      start_date: isSpring ? `${currentYear}-01-15` : `${currentYear}-08-15`,
      end_date: isSpring ? `${currentYear}-05-30` : `${currentYear}-12-20`,
      default_credits: 3,
      is_active: true
    },
    courses: [
      {
        title: "Internet of Things",
        course_code: "CSE 422",
        teacher_name: "Dr. Ahmed Rahman",
        teacher_email: "ahmed.rahman@diu.edu.bd",
        credits: 3,
        description: "Introduction to IoT concepts, sensors, actuators, communication protocols, and IoT application development.",
        topics: [
          {
            title: "Introduction to IoT",
            description: "Basic concepts, architecture, and applications of Internet of Things",
            order_index: 1,
            slides: [
              {
                title: "IoT Overview",
                url: "https://docs.google.com/presentation/d/1234567890/edit",
                description: "Comprehensive overview of IoT ecosystem"
              },
              {
                title: "IoT Architecture",
                url: "https://docs.google.com/presentation/d/0987654321/edit",
                description: "Layered architecture of IoT systems"
              }
            ],
            videos: [
              {
                title: "What is IoT?",
                url: "https://youtube.com/watch?v=example1",
                description: "Introduction video explaining IoT fundamentals"
              }
            ]
          },
          {
            title: "Sensors and Actuators",
            description: "Understanding various sensors and actuators used in IoT systems",
            order_index: 2,
            slides: [
              {
                title: "Sensor Types",
                url: "https://docs.google.com/presentation/d/1111111111/edit",
                description: "Different types of sensors and their applications"
              }
            ],
            videos: [
              {
                title: "Sensor Interfacing",
                url: "https://youtube.com/watch?v=example2",
                description: "How to interface sensors with microcontrollers"
              }
            ]
          }
        ],
        studyTools: [
          {
            title: "IoT Previous Questions 2023",
            type: "previous_questions",
            content_url: "https://drive.google.com/file/d/example1/view",
            exam_type: "both",
            description: "Previous year questions for midterm and final exams"
          },
          {
            title: "IoT Lab Manual",
            type: "assignments",
            content_url: "https://docs.google.com/document/d/example2/edit",
            exam_type: "both",
            description: "Complete lab manual with practical exercises"
          }
        ]
      },
      {
        title: "Software Engineering",
        course_code: "CSE 327",
        teacher_name: "Dr. Fatima Khan",
        teacher_email: "fatima.khan@diu.edu.bd",
        credits: 3,
        description: "Software development lifecycle, methodologies, design patterns, and project management.",
        topics: [
          {
            title: "SDLC Models",
            description: "Software Development Life Cycle models and methodologies",
            order_index: 1,
            slides: [
              {
                title: "Waterfall Model",
                url: "https://docs.google.com/presentation/d/2222222222/edit",
                description: "Traditional waterfall development model"
              },
              {
                title: "Agile Methodology",
                url: "https://docs.google.com/presentation/d/3333333333/edit",
                description: "Agile development principles and practices"
              }
            ],
            videos: [
              {
                title: "Agile vs Waterfall",
                url: "https://youtube.com/watch?v=example3",
                description: "Comparison of different development methodologies"
              }
            ]
          }
        ],
        studyTools: [
          {
            title: "SE Syllabus 2024",
            type: "syllabus",
            content_url: "https://docs.google.com/document/d/example3/edit",
            exam_type: "both",
            description: "Complete syllabus for Software Engineering course"
          },
          {
            title: "Design Patterns Reference",
            type: "reference_books",
            content_url: "https://drive.google.com/file/d/example4/view",
            exam_type: "final",
            description: "Reference material for design patterns"
          }
        ]
      },
      {
        title: "Database Management Systems",
        course_code: "CSE 311",
        teacher_name: "Prof. Mohammad Ali",
        teacher_email: "mohammad.ali@diu.edu.bd",
        credits: 3,
        description: "Database design, SQL, normalization, transactions, and database administration.",
        topics: [
          {
            title: "Database Fundamentals",
            description: "Basic concepts of database systems and DBMS",
            order_index: 1,
            slides: [
              {
                title: "DBMS Introduction",
                url: "https://docs.google.com/presentation/d/4444444444/edit",
                description: "Introduction to database management systems"
              }
            ],
            videos: [
              {
                title: "Database Basics",
                url: "https://youtube.com/watch?v=example4",
                description: "Fundamental concepts of databases"
              }
            ]
          },
          {
            title: "SQL Queries",
            description: "Structured Query Language for database operations",
            order_index: 2,
            slides: [
              {
                title: "Basic SQL",
                url: "https://docs.google.com/presentation/d/5555555555/edit",
                description: "Basic SQL commands and syntax"
              },
              {
                title: "Advanced SQL",
                url: "https://docs.google.com/presentation/d/6666666666/edit",
                description: "Advanced SQL queries and functions"
              }
            ],
            videos: [
              {
                title: "SQL Tutorial",
                url: "https://youtube.com/watch?v=example5",
                description: "Complete SQL tutorial for beginners"
              }
            ]
          }
        ],
        studyTools: [
          {
            title: "DBMS Previous Questions",
            type: "previous_questions",
            content_url: "https://drive.google.com/file/d/example5/view",
            exam_type: "both",
            description: "Previous questions from 2020-2023"
          },
          {
            title: "SQL Practice Problems",
            type: "assignments",
            content_url: "https://docs.google.com/document/d/example6/edit",
            exam_type: "midterm",
            description: "Practice problems for SQL queries"
          },
          {
            title: "Mark Distribution",
            type: "mark_distribution",
            content_url: "https://docs.google.com/spreadsheet/d/example7/edit",
            exam_type: "both",
            description: "Detailed mark distribution for exams"
          }
        ]
      }
    ]
  }
}

export const generateMultipleDemoSemesters = (count: number = 3): DemoSemesterData[] => {
  const semesters: DemoSemesterData[] = []
  const currentYear = new Date().getFullYear()
  
  for (let i = 0; i < count; i++) {
    const year = currentYear - i
    const isSpring = i % 2 === 0
    const semesterName = isSpring ? "Spring" : "Fall"
    const section = ["63_G", "63_H", "64_A", "64_B"][i % 4]
    
    const baseSemester = generateDemoSemester()
    baseSemester.semester.title = `${semesterName} ${year}`
    baseSemester.semester.section = section
    baseSemester.semester.is_active = i === 0 // Only the first one is active
    baseSemester.semester.start_date = isSpring ? `${year}-01-15` : `${year}-08-15`
    baseSemester.semester.end_date = isSpring ? `${year}-05-30` : `${year}-12-20`
    
    semesters.push(baseSemester)
  }
  
  return semesters
}

// Helper function to validate demo data
export const validateDemoData = (data: DemoSemesterData): string[] => {
  const errors: string[] = []
  
  if (!data.semester.title) errors.push("Semester title is required")
  if (!data.semester.section) errors.push("Section is required")
  if (data.courses.length === 0) errors.push("At least one course is required")
  
  data.courses.forEach((course, index) => {
    if (!course.title) errors.push(`Course ${index + 1}: Title is required`)
    if (!course.course_code) errors.push(`Course ${index + 1}: Course code is required`)
    if (!course.teacher_name) errors.push(`Course ${index + 1}: Teacher name is required`)
  })
  
  return errors
}
