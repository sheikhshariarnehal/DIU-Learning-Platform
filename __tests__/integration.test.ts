/**
 * @jest-environment node
 */

import { validateTopic, validateSlides, validateVideos } from '../lib/validation'

// Mock the supabase module for integration tests
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
  checkTopicTitleUnique: jest.fn(),
  checkSlideTitleUnique: jest.fn(),
  checkVideoTitleUnique: jest.fn(),
}))

import { checkTopicTitleUnique, checkSlideTitleUnique, checkVideoTitleUnique } from '../lib/supabase'

const mockCheckTopicTitleUnique = checkTopicTitleUnique as jest.MockedFunction<typeof checkTopicTitleUnique>
const mockCheckSlideTitleUnique = checkSlideTitleUnique as jest.MockedFunction<typeof checkSlideTitleUnique>
const mockCheckVideoTitleUnique = checkVideoTitleUnique as jest.MockedFunction<typeof checkVideoTitleUnique>

describe('Integration Tests - Topics Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Topic Creation Flow', () => {
    it('should validate and create a complete topic with slides and videos', async () => {
      // Mock all uniqueness checks to return true
      mockCheckTopicTitleUnique.mockResolvedValue(true)
      mockCheckSlideTitleUnique.mockResolvedValue(true)
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      // Step 1: Validate topic
      const topicData = {
        title: 'Information Security Fundamentals',
        description: 'An introduction to information security concepts and practices',
        section_id: 'section-123',
        order_index: 1,
      }

      const topicValidation = await validateTopic(topicData)
      expect(topicValidation.isValid).toBe(true)
      expect(topicValidation.errors).toHaveLength(0)

      // Step 2: Validate slides
      const slidesData = [
        {
          title: 'Introduction to InfoSec',
          slide_url: 'https://example.com/intro-slides.pdf',
          slide_type: 'pdf' as const,
          topic_id: 'topic-123',
        },
        {
          title: 'Security Principles',
          slide_url: 'https://example.com/principles.ppt',
          slide_type: 'ppt' as const,
          topic_id: 'topic-123',
        },
      ]

      const slidesValidation = await validateSlides(slidesData)
      expect(slidesValidation.isValid).toBe(true)
      expect(Object.keys(slidesValidation.errors)).toHaveLength(0)

      // Step 3: Validate videos
      const videosData = [
        {
          title: 'InfoSec Overview Video',
          video_url: 'https://youtube.com/watch?v=abc123',
          video_type: 'youtube' as const,
          duration: '15:30',
          topic_id: 'topic-123',
        },
        {
          title: 'Security Best Practices',
          video_url: 'https://vimeo.com/123456789',
          video_type: 'vimeo' as const,
          duration: '22:45',
          topic_id: 'topic-123',
        },
      ]

      const videosValidation = await validateVideos(videosData)
      expect(videosValidation.isValid).toBe(true)
      expect(Object.keys(videosValidation.errors)).toHaveLength(0)

      // Verify all uniqueness checks were called
      expect(mockCheckTopicTitleUnique).toHaveBeenCalledWith(
        'Information Security Fundamentals',
        'section-123',
        undefined
      )
      expect(mockCheckSlideTitleUnique).toHaveBeenCalledTimes(2)
      expect(mockCheckVideoTitleUnique).toHaveBeenCalledTimes(2)
    })

    it('should handle validation errors in a complete flow', async () => {
      // Mock some uniqueness checks to fail
      mockCheckTopicTitleUnique.mockResolvedValue(false) // Duplicate topic title
      mockCheckSlideTitleUnique.mockResolvedValueOnce(true).mockResolvedValueOnce(false) // Second slide has duplicate title
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      // Step 1: Validate topic (should fail due to duplicate title)
      const topicData = {
        title: 'Duplicate Topic Title',
        description: 'This topic title already exists',
        section_id: 'section-123',
        order_index: 1,
      }

      const topicValidation = await validateTopic(topicData)
      expect(topicValidation.isValid).toBe(false)
      expect(topicValidation.errors).toContainEqual({
        field: 'title',
        message: 'A topic with this title already exists in this section',
        code: 'DUPLICATE'
      })

      // Step 2: Validate slides (should fail due to duplicate title on second slide)
      const slidesData = [
        {
          title: 'Unique Slide Title',
          slide_url: 'https://example.com/slide1.pdf',
          slide_type: 'pdf' as const,
          topic_id: 'topic-123',
        },
        {
          title: 'Duplicate Slide Title',
          slide_url: 'https://example.com/slide2.pdf',
          slide_type: 'pdf' as const,
          topic_id: 'topic-123',
        },
      ]

      const slidesValidation = await validateSlides(slidesData)
      expect(slidesValidation.isValid).toBe(false)
      expect(slidesValidation.errors['slide_1']).toBeDefined()
      expect(slidesValidation.errors['slide_1']).toContainEqual({
        field: 'title',
        message: 'A slide with this title already exists in this topic',
        code: 'DUPLICATE'
      })
    })

    it('should validate edge cases and boundary conditions', async () => {
      mockCheckTopicTitleUnique.mockResolvedValue(true)
      mockCheckSlideTitleUnique.mockResolvedValue(true)
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      // Test minimum valid topic
      const minimalTopic = {
        title: 'ABC', // Minimum 3 characters
        section_id: 'section-123',
        order_index: 0, // Minimum valid order
      }

      const minimalValidation = await validateTopic(minimalTopic)
      expect(minimalValidation.isValid).toBe(true)

      // Test maximum length topic title
      const maxTitleTopic = {
        title: 'A'.repeat(255), // Maximum 255 characters
        section_id: 'section-123',
        order_index: 1,
      }

      const maxTitleValidation = await validateTopic(maxTitleTopic)
      expect(maxTitleValidation.isValid).toBe(true)

      // Test slides without titles (should be valid)
      const slidesWithoutTitles = [
        {
          slide_url: 'https://example.com/slide.pdf',
          slide_type: 'pdf' as const,
          topic_id: 'topic-123',
        },
      ]

      const slidesValidation = await validateSlides(slidesWithoutTitles)
      expect(slidesValidation.isValid).toBe(true)

      // Test videos with various duration formats
      const videosWithDurations = [
        {
          video_url: 'https://youtube.com/watch?v=1',
          video_type: 'youtube' as const,
          duration: '5:30', // MM:SS format
          topic_id: 'topic-123',
        },
        {
          video_url: 'https://youtube.com/watch?v=2',
          video_type: 'youtube' as const,
          duration: '1:23:45', // HH:MM:SS format
          topic_id: 'topic-123',
        },
      ]

      const videosValidation = await validateVideos(videosWithDurations)
      expect(videosValidation.isValid).toBe(true)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      mockCheckTopicTitleUnique.mockRejectedValue(new Error('Database connection failed'))

      const topicData = {
        title: 'Test Topic',
        section_id: 'section-123',
        order_index: 1,
      }

      const validation = await validateTopic(topicData)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContainEqual({
        field: 'title',
        message: 'Error validating title uniqueness',
        code: 'VALIDATION_ERROR'
      })
    })

    it('should handle malformed data gracefully', async () => {
      mockCheckTopicTitleUnique.mockResolvedValue(true)

      // Test with various invalid inputs
      const invalidInputs = [
        {
          title: null,
          section_id: 'section-123',
          order_index: 1,
        },
        {
          title: 'Valid Title',
          section_id: null,
          order_index: 1,
        },
        {
          title: 'Valid Title',
          section_id: 'section-123',
          order_index: 'invalid',
        },
      ]

      for (const input of invalidInputs) {
        const validation = await validateTopic(input as any)
        expect(validation.isValid).toBe(false)
        expect(validation.errors.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large batches of slides efficiently', async () => {
      mockCheckSlideTitleUnique.mockResolvedValue(true)

      // Create a large batch of slides
      const largeSlidesBatch = Array.from({ length: 100 }, (_, i) => ({
        title: `Slide ${i + 1}`,
        slide_url: `https://example.com/slide${i + 1}.pdf`,
        slide_type: 'pdf' as const,
        topic_id: 'topic-123',
      }))

      const startTime = Date.now()
      const validation = await validateSlides(largeSlidesBatch)
      const endTime = Date.now()

      expect(validation.isValid).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(mockCheckSlideTitleUnique).toHaveBeenCalledTimes(100)
    })

    it('should handle large batches of videos efficiently', async () => {
      mockCheckVideoTitleUnique.mockResolvedValue(true)

      // Create a large batch of videos
      const largeVideosBatch = Array.from({ length: 50 }, (_, i) => ({
        title: `Video ${i + 1}`,
        video_url: `https://youtube.com/watch?v=${i + 1}`,
        video_type: 'youtube' as const,
        duration: '10:30',
        topic_id: 'topic-123',
      }))

      const startTime = Date.now()
      const validation = await validateVideos(largeVideosBatch)
      const endTime = Date.now()

      expect(validation.isValid).toBe(true)
      expect(endTime - startTime).toBeLessThan(3000) // Should complete within 3 seconds
      expect(mockCheckVideoTitleUnique).toHaveBeenCalledTimes(50)
    })
  })
})
