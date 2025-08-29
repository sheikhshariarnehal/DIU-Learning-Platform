"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { generateSimpleShareUrl } from "@/lib/simple-share-utils"

interface Slide {
  id: string
  title: string
  google_drive_url: string
  description?: string
  topic?: {
    id: string
    title: string
    course?: {
      id: string
      title: string
    }
  }
}

export default function BrowseSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/slides-list')
        const data = await response.json()
        
        if (response.ok) {
          setSlides(data.slides || [])
        } else {
          setError(data.error || 'Failed to fetch slides')
        }
      } catch (err) {
        setError('Network error: ' + err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSlides()
  }, [])

  const testSlide = (slideId: string) => {
    const shareUrl = generateSimpleShareUrl('slide', slideId)
    window.open(shareUrl, '_blank')
  }

  const copyShareUrl = async (slideId: string) => {
    const shareUrl = generateSimpleShareUrl('slide', slideId)
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share URL copied to clipboard!')
    } catch (err) {
      alert('Failed to copy URL')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Available Slides</h1>
        <p>Loading slides...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Available Slides</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Browse Available Slides</h1>
      
      <p className="mb-6 text-gray-600">
        Found {slides.length} slides in the database. Click "Test Share" to test the sharing functionality.
      </p>
      
      {slides.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>No slides found.</strong> Make sure you have slides in your database.
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{slide.title}</h3>
                  {slide.description && (
                    <p className="text-gray-600 mb-2">{slide.description}</p>
                  )}
                  {slide.topic && (
                    <div className="text-sm text-gray-500">
                      <p>Topic: {slide.topic.title}</p>
                      {slide.topic.course && (
                        <p>Course: {slide.topic.course.title}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">ID: {slide.id}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    onClick={() => testSlide(slide.id)}
                    size="sm"
                  >
                    Test Share
                  </Button>
                  <Button 
                    onClick={() => copyShareUrl(slide.id)}
                    variant="outline"
                    size="sm"
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test Share" on any slide above</li>
          <li>It should open the main page with that slide loaded</li>
          <li>The URL should be shareable (copy and test in new tab)</li>
          <li>Or click "Copy URL" to get the shareable link directly</li>
        </ol>
      </div>
    </div>
  )
}
