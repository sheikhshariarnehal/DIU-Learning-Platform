"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail } from "lucide-react"

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
}

export function ShareButton({ 
  url, 
  title, 
  description = "", 
  size = "sm", 
  variant = "outline" 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
      })
      setIsOpen(false)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
      })
    }
  }

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Copy,
      action: copyToClipboard,
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "width=600,height=400"
        )
        setIsOpen(false)
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "width=600,height=400"
        )
        setIsOpen(false)
      },
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          "_blank",
          "width=600,height=400"
        )
        setIsOpen(false)
      },
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(`Check out: ${title}`)
        const body = encodeURIComponent(`${description}\n\n${fullUrl}`)
        window.open(`mailto:?subject=${subject}&body=${body}`)
        setIsOpen(false)
      },
    },
  ]

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== 'undefined' && 'share' in navigator

  const handleNativeShare = async () => {
    if (canUseWebShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
      } catch (err) {
        // User cancelled or error occurred, fall back to dropdown
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  // On mobile devices with Web Share API, use native sharing
  if (canUseWebShare && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return (
      <Button onClick={handleNativeShare} variant={variant} size={size}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.action}
            className="cursor-pointer"
          >
            <option.icon className="h-4 w-4 mr-2" />
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
