/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET as getSemesters } from '../app/api/semesters/route'
import { GET as getCoursesBySemester } from '../app/api/semesters/[id]/courses/route'
import { GET as getStudyTools, POST as createStudyTool } from '../app/api/courses/[id]/study-tools/route'
import { GET as getTopics } from '../app/api/courses/[id]/topics/route'
import { GET as getTopicMaterials } from '../app/api/topics/[id]/materials/route'

// Mock the supabase module
jest.mock('../lib/supabase', () => ({
  fetchSemesters: jest.fn(),
  fetchCoursesBySemester: jest.fn(),
  fetchStudyToolsByCourse: jest.fn(),
  fetchTopicsByCourse: jest.fn(),
  fetchTopicMaterials: jest.fn(),
  createStudyTool: jest.fn(),
}))

import {
  fetchSemesters,
  fetchCoursesBySemester,
  fetchStudyToolsByCourse,
  fetchTopicsByCourse,
  fetchTopicMaterials,
  createStudyTool as mockCreateStudyTool
} from '../lib/supabase'

const mockFetchSemesters = fetchSemesters as jest.MockedFunction<typeof fetchSemesters>
const mockFetchCoursesBySemester = fetchCoursesBySemester as jest.MockedFunction<typeof fetchCoursesBySemester>
const mockFetchStudyToolsByCourse = fetchStudyToolsByCourse as jest.MockedFunction<typeof fetchStudyToolsByCourse>
const mockFetchTopicsByCourse = fetchTopicsByCourse as jest.MockedFunction<typeof fetchTopicsByCourse>
const mockFetchTopicMaterials = fetchTopicMaterials as jest.MockedFunction<typeof fetchTopicMaterials>
const mockCreateStudyToolFunc = mockCreateStudyTool as jest.MockedFunction<typeof mockCreateStudyTool>

describe('Backend API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /semesters', () => {
    it('should return list of semesters', async () => {
      const mockSemesters = [
        {
          id: '1',
          name: 'Fall 2024',
          code: 'FALL2024',
          exam_type: 'midterm' as const,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockFetchSemesters.mockResolvedValue(mockSemesters)

      const response = await getSemesters()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSemesters)
      expect(mockFetchSemesters).toHaveBeenCalledTimes(1)
    })

    it('should handle errors gracefully', async () => {
      mockFetchSemesters.mockRejectedValue(new Error('Database error'))

      const response = await getSemesters()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch semesters')
    })
  })

  describe('GET /semesters/{id}/courses', () => {
    it('should return courses for a semester', async () => {
      const mockCourses = [
        {
          id: '1',
          code: 'CSE101',
          name: 'Introduction to Computer Science',
          semester_id: 'semester1',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockFetchCoursesBySemester.mockResolvedValue(mockCourses)

      const request = new NextRequest('http://localhost/api/semesters/semester1/courses')
      const response = await getCoursesBySemester(request, { params: { id: 'semester1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourses)
      expect(mockFetchCoursesBySemester).toHaveBeenCalledWith('semester1')
    })
  })

  describe('GET /courses/{id}/study-tools', () => {
    it('should return study tools for a course', async () => {
      const mockStudyTools = [
        {
          id: '1',
          name: 'Previous Questions',
          section_id: 'section1',
          tool_type: 'pdf' as const,
          url: 'https://example.com/questions.pdf',
          order_index: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockFetchStudyToolsByCourse.mockResolvedValue(mockStudyTools)

      const request = new NextRequest('http://localhost/api/courses/course1/study-tools')
      const response = await getStudyTools(request, { params: { id: 'course1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockStudyTools)
      expect(mockFetchStudyToolsByCourse).toHaveBeenCalledWith('course1')
    })
  })

  describe('POST /courses/{id}/study-tools', () => {
    it('should create a new study tool', async () => {
      const newStudyTool = {
        id: '2',
        name: 'Textbook',
        section_id: 'section1',
        tool_type: 'pdf' as const,
        url: 'https://example.com/textbook.pdf',
        order_index: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockCreateStudyToolFunc.mockResolvedValue(newStudyTool)

      const requestBody = {
        name: 'Textbook',
        section_id: 'section1',
        tool_type: 'pdf',
        url: 'https://example.com/textbook.pdf'
      }

      const request = new NextRequest('http://localhost/api/courses/course1/study-tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await createStudyTool(request, { params: { id: 'course1' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newStudyTool)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/courses/course1/study-tools', {
        method: 'POST',
        body: JSON.stringify({ name: 'Incomplete' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await createStudyTool(request, { params: { id: 'course1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })
  })

  describe('GET /courses/{id}/topics', () => {
    it('should return topics for a course', async () => {
      const mockTopics = [
        {
          id: '1',
          title: 'Introduction',
          section_id: 'section1',
          order_index: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockFetchTopicsByCourse.mockResolvedValue(mockTopics)

      const request = new NextRequest('http://localhost/api/courses/course1/topics')
      const response = await getTopics(request, { params: { id: 'course1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTopics)
      expect(mockFetchTopicsByCourse).toHaveBeenCalledWith('course1')
    })
  })

  describe('GET /topics/{id}/materials', () => {
    it('should return slides and videos for a topic', async () => {
      const mockMaterials = {
        slides: [
          {
            id: '1',
            title: 'Slide 1',
            topic_id: 'topic1',
            slide_url: 'https://example.com/slide1.pdf',
            slide_type: 'pdf',
            order_index: 1,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        videos: [
          {
            id: '1',
            title: 'Video 1',
            topic_id: 'topic1',
            video_url: 'https://youtube.com/watch?v=123',
            video_type: 'youtube',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      }

      mockFetchTopicMaterials.mockResolvedValue(mockMaterials)

      const request = new NextRequest('http://localhost/api/topics/topic1/materials')
      const response = await getTopicMaterials(request, { params: { id: 'topic1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockMaterials)
      expect(mockFetchTopicMaterials).toHaveBeenCalledWith('topic1')
    })
  })
})
