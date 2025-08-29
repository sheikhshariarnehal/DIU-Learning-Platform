"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy } from "lucide-react"

interface SimpleShareButtonProps {
  url: string
  title: string
}

export function SimpleShareButton({ url, title }: SimpleShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (error) {
        console.error("Failed to share:", error)
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Button onClick={handleShare} variant="outline" size="sm">
      {copied ? (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </>
      )}
    </Button>
  )
}
