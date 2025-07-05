"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Label } from "@/components/ui/label"

interface Item {
  id: string
  title: string
  url: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  content: Item | null
  type: "slide" | "video"
  onSuccess: () => void
}

export function EditContentDialog({ open, onOpenChange, content, type, onSuccess }: Props) {
  const [title, setTitle] = useState(content?.title ?? "")
  const [url, setUrl] = useState(content?.url ?? "")
  const [saving, setSaving] = useState(false)

  // Sync when a new content record is passed in
  React.useEffect(() => {
    setTitle(content?.title ?? "")
    setUrl(content?.url ?? "")
  }, [content])

  async function handleSave() {
    if (!content) return
    setSaving(true)
    try {
      const endpoint = `/api/admin/content/${type}s/${content.id}`
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed")
      }
      onSuccess()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {type}</DialogTitle>
        </DialogHeader>

        <Label htmlFor="title-ed">Title</Label>
        <Input id="title-ed" value={title} onChange={(e) => setTitle(e.target.value)} />

        <Label htmlFor="url-ed">URL</Label>
        <Input id="url-ed" value={url} onChange={(e) => setUrl(e.target.value)} />

        <Button onClick={handleSave} disabled={saving} className="mt-4 w-full">
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
