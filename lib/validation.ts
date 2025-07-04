import { supabase, validateTopicTitle, validateSlideTitle, validateVideoTitle } from "./supabase"

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Topic validation
export const validateTopic = async (
  data: {
    title: string
    description?: string
    section_id: string
    order_index: number
  },
  excludeTopicId?: string
): Promise<ValidationResult> => {
  const errors: ValidationError[] = []

  // Title validation
  if (!data.title?.trim()) {
    errors.push({
      field: "title",
      message: "Title is required",
      code: "REQUIRED"
    })
  } else if (data.title.trim().length < 3) {
    errors.push({
      field: "title",
      message: "Title must be at least 3 characters long",
      code: "MIN_LENGTH"
    })
  } else if (data.title.trim().length > 255) {
    errors.push({
      field: "title",
      message: "Title must be less than 255 characters",
      code: "MAX_LENGTH"
    })
  } else {
    // Check uniqueness
    try {
      const isUnique = await validateTopicTitle(data.title, data.section_id, excludeTopicId)
      if (!isUnique) {
        errors.push({
          field: "title",
          message: "A topic with this title already exists in this section",
          code: "DUPLICATE"
        })
      }
    } catch (error) {
      errors.push({
        field: "title",
        message: "Error validating title uniqueness",
        code: "VALIDATION_ERROR"
      })
    }
  }

  // Section validation
  if (!data.section_id?.trim()) {
    errors.push({
      field: "section_id",
      message: "Section is required",
      code: "REQUIRED"
    })
  }

  // Order validation
  if (data.order_index < 0) {
    errors.push({
      field: "order_index",
      message: "Order must be a positive number",
      code: "INVALID_VALUE"
    })
  }

  // Description validation (optional)
  if (data.description && data.description.length > 1000) {
    errors.push({
      field: "description",
      message: "Description must be less than 1000 characters",
      code: "MAX_LENGTH"
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Slide validation
export const validateSlide = async (
  data: {
    title?: string
    slide_url: string
    slide_type: string
    topic_id: string
  },
  excludeSlideId?: string
): Promise<ValidationResult> => {
  const errors: ValidationError[] = []

  // URL validation
  if (!data.slide_url?.trim()) {
    errors.push({
      field: "slide_url",
      message: "Slide URL is required",
      code: "REQUIRED"
    })
  } else {
    try {
      new URL(data.slide_url)
    } catch {
      errors.push({
        field: "slide_url",
        message: "Please enter a valid URL",
        code: "INVALID_URL"
      })
    }
  }

  // Title validation (optional but must be unique if provided)
  if (data.title?.trim()) {
    if (data.title.trim().length > 255) {
      errors.push({
        field: "title",
        message: "Title must be less than 255 characters",
        code: "MAX_LENGTH"
      })
    } else {
      try {
        const isUnique = await validateSlideTitle(data.title, data.topic_id, excludeSlideId)
        if (!isUnique) {
          errors.push({
            field: "title",
            message: "A slide with this title already exists in this topic",
            code: "DUPLICATE"
          })
        }
      } catch (error) {
        errors.push({
          field: "title",
          message: "Error validating title uniqueness",
          code: "VALIDATION_ERROR"
        })
      }
    }
  }

  // Type validation
  const validTypes = ["pdf", "ppt", "image"]
  if (!validTypes.includes(data.slide_type)) {
    errors.push({
      field: "slide_type",
      message: "Invalid slide type",
      code: "INVALID_VALUE"
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Video validation
export const validateVideo = async (
  data: {
    title?: string
    video_url: string
    video_type: string
    duration?: string
    thumbnail_url?: string
    topic_id: string
  },
  excludeVideoId?: string
): Promise<ValidationResult> => {
  const errors: ValidationError[] = []

  // URL validation
  if (!data.video_url?.trim()) {
    errors.push({
      field: "video_url",
      message: "Video URL is required",
      code: "REQUIRED"
    })
  } else {
    try {
      new URL(data.video_url)
    } catch {
      errors.push({
        field: "video_url",
        message: "Please enter a valid URL",
        code: "INVALID_URL"
      })
    }
  }

  // Title validation (optional but must be unique if provided)
  if (data.title?.trim()) {
    if (data.title.trim().length > 255) {
      errors.push({
        field: "title",
        message: "Title must be less than 255 characters",
        code: "MAX_LENGTH"
      })
    } else {
      try {
        const isUnique = await validateVideoTitle(data.title, data.topic_id, excludeVideoId)
        if (!isUnique) {
          errors.push({
            field: "title",
            message: "A video with this title already exists in this topic",
            code: "DUPLICATE"
          })
        }
      } catch (error) {
        errors.push({
          field: "title",
          message: "Error validating title uniqueness",
          code: "VALIDATION_ERROR"
        })
      }
    }
  }

  // Type validation
  const validTypes = ["youtube", "vimeo", "direct"]
  if (!validTypes.includes(data.video_type)) {
    errors.push({
      field: "video_type",
      message: "Invalid video type",
      code: "INVALID_VALUE"
    })
  }

  // Duration validation (optional)
  if (data.duration && !/^\d{1,2}:\d{2}(:\d{2})?$/.test(data.duration)) {
    errors.push({
      field: "duration",
      message: "Duration must be in format MM:SS or HH:MM:SS",
      code: "INVALID_FORMAT"
    })
  }

  // Thumbnail URL validation (optional)
  if (data.thumbnail_url?.trim()) {
    try {
      new URL(data.thumbnail_url)
    } catch {
      errors.push({
        field: "thumbnail_url",
        message: "Please enter a valid thumbnail URL",
        code: "INVALID_URL"
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Batch validation for multiple slides
export const validateSlides = async (
  slides: Array<{
    id?: string
    title?: string
    slide_url: string
    slide_type: string
    topic_id: string
  }>
): Promise<{ isValid: boolean; errors: Record<string, ValidationError[]> }> => {
  const allErrors: Record<string, ValidationError[]> = {}
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const result = await validateSlide(slide, slide.id)
    if (!result.isValid) {
      allErrors[`slide_${i}`] = result.errors
    }
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  }
}

// Batch validation for multiple videos
export const validateVideos = async (
  videos: Array<{
    id?: string
    title?: string
    video_url: string
    video_type: string
    duration?: string
    thumbnail_url?: string
    topic_id: string
  }>
): Promise<{ isValid: boolean; errors: Record<string, ValidationError[]> }> => {
  const allErrors: Record<string, ValidationError[]> = {}
  
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]
    const result = await validateVideo(video, video.id)
    if (!result.isValid) {
      allErrors[`video_${i}`] = result.errors
    }
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  }
}

// Utility function to format validation errors for display
export const formatValidationError = (error: ValidationError): string => {
  return error.message
}

// Utility function to get all error messages as a flat array
export const getAllErrorMessages = (errors: ValidationError[]): string[] => {
  return errors.map(formatValidationError)
}
