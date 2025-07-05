"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Topic {
  id: string
  title: string
  course: { title: string; semester: { name: string } }
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  type: "slide" | "video"
  onSuccess: () => void
}

export function CreateContentDialog({ open, onOpenChange, type, onSuccess }: Props) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [topicId, setTopicId] = useState<string>()
  const [saving, setSaving] = useState(false)

  /* ------------------------------ fetch topics ----------------------------- */
  useEffect(() => {
    if (!open) return
    const run = async () => {
      setLoadingTopics(true)
      try {
        const res = await fetch("/api/admin/topics")
        const data: Topic[] = await res.json()
        setTopics(data)
      } catch (e) {
        console.error("Failed to fetch topics", e)
      } finally {
        setLoadingTopics(false)
      }
    }
    run()
  }, [open])

  /* -------------------------------- submit -------------------------------- */
  async function handleSubmit() {
    if (!title || !url || !topicId) return alert("All fields are required")
    setSaving(true)
    try {
      const endpoint = `/api/admin/content/${type}s`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, topic_id: topicId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed")
      }
      onSuccess()
      // reset
      setTitle("")
      setUrl("")
      setTopicId(undefined)
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
          <DialogTitle>Add new {type === "slide" ? "slide" : "video"}</DialogTitle>
        </DialogHeader>

        {/* Title */}
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />

        {/* URL */}
        <Label htmlFor="url">URL</Label>
        <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />

        {/* Topic Select */}
        <Label>Topic</Label>
        {loadingTopics ? (
          <p className="text-sm">Loading topics…</p>
        ) : (
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose topic…" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.course.semester.name} › {t.course.title} › {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button onClick={handleSubmit} disabled={saving} className="mt-4 w-full">
          {saving ? "Saving…" : "Create"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
