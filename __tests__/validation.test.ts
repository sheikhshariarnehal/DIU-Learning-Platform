/**
 * @jest-environment node
 */

import { validateTopic, validateSlide, validateVideo } from '../lib/validation'

// Mock the supabase module
jest.mock('../lib/supabase', () => ({
  checkTopicTitleUnique: jest.fn(),
  checkSlideTitleUnique: jest.fn(),
  checkVideoTitleUnique: jest.fn(),
}))

import { checkTopicTitleUnique, checkSlideTitleUnique, checkVideoTitleUnique } from '../lib/supabase'

const mockCheckTopicTitleUnique = checkTopicTitleUnique as jest.MockedFunction<typeof checkTopicTitleUnique>
const mockCheckSlideTitleUnique = checkSlideTitleUnique as jest.MockedFunction<typeof checkSlideTitleUnique>
const mockCheckVideoTitleUnique = checkVideoTitleUnique as jest.MockedFunction<typeof checkVideoTitleUnique>

describe('Validation Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateTopic', () => {
    it('should validate a valid topic', async () => {
      mockCheckTopicTitleUnique.mockResolvedValue(true)

      const result = await validateTopic({
        title: 'Valid Topic Title',
        description: 'A valid description',
        section_id: 'section-123',
        order_index: 1,
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty title', async () => {
      const result = await validateTopic({
        title: '',
        section_id: 'section-123',
        order_index: 1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED'
      })
    })

    it('should reject title that is too short', async () => {
      const result = await validateTopic({
        title: 'AB',
        section_id: 'section-123',
        order_index: 1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title must be at least 3 characters long',
        code: 'MIN_LENGTH'
      })
    })

    it('should reject title that is too long', async () => {
      const longTitle = 'A'.repeat(256)
      const result = await validateTopic({
        title: longTitle,
        section_id: 'section-123',
        order_index: 1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title must be less than 255 characters',
        code: 'MAX_LENGTH'
      })
    })

    it('should reject duplicate title', async () => {
      mockCheckTopicTitleUnique.mockResolvedValue(false)

      const result = await validateTopic({
        title: 'Duplicate Title',
        section_id: 'section-123',
        order_index: 1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'A topic with this title already exists in this section',
        code: 'DUPLICATE'
      })
    })

    it('should reject missing section_id', async () => {
      const result = await validateTopic({
        title: 'Valid Title',
        section_id: '',
        order_index: 1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'section_id',
        message: 'Section is required',
        code: 'REQUIRED'
      })
    })

    it('should reject negative order_index', async () => {
      mockCheckTopicTitleUnique.mockResolvedValue(true)

      const result = await validateTopic({
        title: 'Valid Title',
        section_id: 'section-123',
        order_index: -1,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'order_index',
        message: 'Order must be a positive number',
        code: 'INVALID_VALUE'
      })
    })
  })

  describe('validateSlide', () => {
    it('should validate a valid slide', async () => {
      mockCheckSlideTitleUnique.mockResolvedValue(true)

      const result = await validateSlide({
        title: 'Valid Slide Title',
        slide_url: 'https://example.com/slide.pdf',
        slide_type: 'pdf',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty slide_url', async () => {
      const result = await validateSlide({
        slide_url: '',
        slide_type: 'pdf',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'slide_url',
        message: 'Slide URL is required',
        code: 'REQUIRED'
      })
    })

    it('should reject invalid URL', async () => {
      const result = await validateSlide({
        slide_url: 'not-a-valid-url',
        slide_type: 'pdf',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'slide_url',
        message: 'Please enter a valid URL',
        code: 'INVALID_URL'
      })
    })

    it('should reject invalid slide_type', async () => {
      const result = await validateSlide({
        slide_url: 'https://example.com/slide.pdf',
        slide_type: 'invalid-type',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'slide_type',
        message: 'Invalid slide type',
        code: 'INVALID_VALUE'
      })
    })
  })

  describe('validateVideo', () => {
    it('should validate a valid video', async () => {
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      const result = await validateVideo({
        title: 'Valid Video Title',
        video_url: 'https://youtube.com/watch?v=123',
        video_type: 'youtube',
        duration: '10:30',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty video_url', async () => {
      const result = await validateVideo({
        video_url: '',
        video_type: 'youtube',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'video_url',
        message: 'Video URL is required',
        code: 'REQUIRED'
      })
    })

    it('should reject invalid duration format', async () => {
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      const result = await validateVideo({
        video_url: 'https://youtube.com/watch?v=123',
        video_type: 'youtube',
        duration: 'invalid-duration',
        topic_id: 'topic-123',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'duration',
        message: 'Duration must be in format MM:SS or HH:MM:SS',
        code: 'INVALID_FORMAT'
      })
    })

    it('should accept valid duration formats', async () => {
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      const validDurations = ['5:30', '15:45', '1:23:45']

      for (const duration of validDurations) {
        const result = await validateVideo({
          video_url: 'https://youtube.com/watch?v=123',
          video_type: 'youtube',
          duration,
          topic_id: 'topic-123',
        })

        expect(result.isValid).toBe(true)
      }
    })
  })
})
