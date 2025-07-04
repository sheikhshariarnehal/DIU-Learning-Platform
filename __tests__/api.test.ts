/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as validatePost } from '../app/api/topics/validate/route'
import { POST as bulkPost } from '../app/api/topics/bulk/route'
import { GET as searchGet } from '../app/api/topics/search/route'

// Mock the validation and supabase modules
jest.mock('../lib/validation')
jest.mock('../lib/supabase')

import { validateTopic, validateSlide, validateVideo } from '../lib/validation'
import { supabase } from '../lib/supabase'

const mockValidateTopic = validateTopic as jest.MockedFunction<typeof validateTopic>
const mockValidateSlide = validateSlide as jest.MockedFunction<typeof validateSlide>
const mockValidateVideo = validateVideo as jest.MockedFunction<typeof validateVideo>

// Mock supabase methods
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    or: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
}

// Helper function to create mock NextRequest
function createMockRequest(body: any, url = 'http://localhost:3000/api/test'): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset supabase mock
    Object.assign(supabase, mockSupabase)
  })

  describe('/api/topics/validate', () => {
    it('should validate topic successfully', async () => {
      mockValidateTopic.mockResolvedValue({
        isValid: true,
        errors: [],
      })

      const request = createMockRequest({
        type: 'topic',
        data: {
          title: 'Test Topic',
          section_id: 'section-123',
          order_index: 1,
        },
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return validation errors for invalid topic', async () => {
      mockValidateTopic.mockResolvedValue({
        isValid: false,
        errors: [
          {
            field: 'title',
            message: 'Title is required',
            code: 'REQUIRED',
          },
        ],
      })

      const request = createMockRequest({
        type: 'topic',
        data: {
          title: '',
          section_id: 'section-123',
          order_index: 1,
        },
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('title')
    })

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest({
        type: 'topic',
        // Missing data field
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Missing required fields: type and data')
    })

    it('should return 400 for invalid validation type', async () => {
      const request = createMockRequest({
        type: 'invalid-type',
        data: {},
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe("Invalid validation type. Must be 'topic', 'slide', or 'video'")
    })

    it('should validate slide successfully', async () => {
      mockValidateSlide.mockResolvedValue({
        isValid: true,
        errors: [],
      })

      const request = createMockRequest({
        type: 'slide',
        data: {
          slide_url: 'https://example.com/slide.pdf',
          slide_type: 'pdf',
          topic_id: 'topic-123',
        },
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.isValid).toBe(true)
    })

    it('should validate video successfully', async () => {
      mockValidateVideo.mockResolvedValue({
        isValid: true,
        errors: [],
      })

      const request = createMockRequest({
        type: 'video',
        data: {
          video_url: 'https://youtube.com/watch?v=123',
          video_type: 'youtube',
          topic_id: 'topic-123',
        },
      })

      const response = await validatePost(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.isValid).toBe(true)
    })
  })

  describe('/api/topics/bulk', () => {
    it('should handle reorder_topics operation', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
      })

      const request = createMockRequest({
        operation: 'reorder_topics',
        data: {
          topicIds: ['topic-1', 'topic-2', 'topic-3'],
          sectionId: 'section-123',
        },
      })

      const response = await bulkPost(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('Topics reordered successfully')
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          { id: 'topic-1', order_index: 1 },
          { id: 'topic-2', order_index: 2 },
          { id: 'topic-3', order_index: 3 },
        ],
        { onConflict: 'id' }
      )
    })

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest({
        operation: 'reorder_topics',
        // Missing data field
      })

      const response = await bulkPost(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Missing required fields: operation and data')
    })

    it('should return 400 for invalid operation', async () => {
      const request = createMockRequest({
        operation: 'invalid-operation',
        data: {},
      })

      const response = await bulkPost(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Invalid operation type')
    })
  })

  describe('/api/topics/search', () => {
    it('should search topics successfully', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          title: 'Test Topic 1',
          description: 'Description 1',
          order_index: 1,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          section: {
            id: 'section-1',
            name: 'Section 1',
            course: {
              id: 'course-1',
              code: 'CS101',
              name: 'Computer Science 101',
            },
          },
          slides: [],
          videos: [],
        },
      ]

      const mockQuery = jest.fn().mockResolvedValue({
        data: mockTopics,
        error: null,
        count: 1,
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(mockQuery),
      })

      const url = 'http://localhost:3000/api/topics/search?q=test&limit=10&offset=0'
      const request = new NextRequest(url)

      const response = await searchGet(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.topics).toHaveLength(1)
      expect(result.topics[0].title).toBe('Test Topic 1')
      expect(result.pagination.total).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.offset).toBe(0)
    })

    it('should handle search with filters', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(mockQuery),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const url = 'http://localhost:3000/api/topics/search?q=test&courseId=course-1&isActive=true'
      const request = new NextRequest(url)

      const response = await searchGet(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.filters.query).toBe('test')
      expect(result.filters.courseId).toBe('course-1')
      expect(result.filters.isActive).toBe('true')
    })
  })
})
