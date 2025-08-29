"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { generateSimpleShareUrl } from "@/lib/simple-share-utils"

interface Video {
  id: string
  title: string
  youtube_url: string
  description?: string
  duration?: string
  topic?: {
    id: string
    title: string
    course?: {
      id: string
      title: string
    }
  }
}

export default function BrowseVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos-list')
        const data = await response.json()
        
        if (response.ok) {
          setVideos(data.videos || [])
        } else {
          setError(data.error || 'Failed to fetch videos')
        }
      } catch (err) {
        setError('Network error: ' + err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [])

  const testVideo = (videoId: string) => {
    const shareUrl = generateSimpleShareUrl('video', videoId)
    window.open(shareUrl, '_blank')
  }

  const copyShareUrl = async (videoId: string) => {
    const shareUrl = generateSimpleShareUrl('video', videoId)
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
        <h1 className="text-3xl font-bold mb-6">Browse Available Videos</h1>
        <p>Loading videos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Available Videos</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <div className="mt-4">
          <Button onClick={() => window.location.href = '/debug-video-issue'}>
            Debug Video Issues
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Browse Available Videos</h1>
      
      <p className="mb-6 text-gray-600">
        Found {videos.length} videos in the database. Click "Test Share" to test the sharing functionality.
      </p>
      
      {videos.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>No videos found.</strong> Make sure you have videos in your database.
          <div className="mt-2">
            <Button onClick={() => window.location.href = '/debug-video-issue'} size="sm">
              Debug Video Issues
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-600 mb-2">{video.description}</p>
                  )}
                  {video.duration && (
                    <p className="text-sm text-gray-500 mb-2">Duration: {video.duration}</p>
                  )}
                  {video.topic && (
                    <div className="text-sm text-gray-500">
                      <p>Topic: {video.topic.title}</p>
                      {video.topic.course && (
                        <p>Course: {video.topic.course.title}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">ID: {video.id}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    onClick={() => testVideo(video.id)}
                    size="sm"
                  >
                    Test Share
                  </Button>
                  <Button 
                    onClick={() => copyShareUrl(video.id)}
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
          <li>Click "Test Share" on any video above</li>
          <li>It should open the main page with that video loaded</li>
          <li>The URL should be shareable (copy and test in new tab)</li>
          <li>Or click "Copy URL" to get the shareable link directly</li>
        </ol>
      </div>
      
      <div className="mt-4 space-x-2">
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Main Page
        </Button>
        <Button onClick={() => window.location.href = '/debug-video-issue'} variant="outline">
          Debug Video Issues
        </Button>
      </div>
    </div>
  )
}
