"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Trash2,
  FileText,
  Video,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  FileSpreadsheet,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Topic {
  id: string
  title: string
  course: { title: string; semester: { name: string } }
}

interface ContentItem {
  title: string
  url: string
  topic_id: string
  type: "slide" | "video"
  order_index?: number
}

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  })
  const { toast } = useToast()

  // Manual entry state
  const [contentItems, setContentItems] = useState<ContentItem[]>([{ title: "", url: "", topic_id: "", type: "slide" }])

  // CSV/Bulk text state
  const [bulkText, setBulkText] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [defaultType, setDefaultType] = useState<"slide" | "video">("slide")

  // Fetch topics when dialog opens
  useEffect(() => {
    if (open) {
      fetchTopics()
      resetForm()
    }
  }, [open])

  const fetchTopics = async () => {
    setLoadingTopics(true)
    try {
      const res = await fetch("/api/admin/topics")
      const data: Topic[] = await res.json()
      setTopics(data)
    } catch (error) {
      console.error("Failed to fetch topics", error)
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      })
    } finally {
      setLoadingTopics(false)
    }
  }

  const resetForm = () => {
    setContentItems([{ title: "", url: "", topic_id: "", type: "slide" }])
    setBulkText("")
    setSelectedTopic("")
    setUploadResults({ success: 0, failed: 0, errors: [] })
  }

  // Manual entry functions
  const addContentItem = () => {
    setContentItems([...contentItems, { title: "", url: "", topic_id: "", type: "slide" }])
  }

  const removeContentItem = (index: number) => {
    if (contentItems.length > 1) {
      setContentItems(contentItems.filter((_, i) => i !== index))
    }
  }

  const updateContentItem = (index: number, field: keyof ContentItem, value: string) => {
    const updated = [...contentItems]
    updated[index] = { ...updated[index], [field]: value }
    setContentItems(updated)
  }

  // Bulk text processing
  const processBulkText = () => {
    if (!bulkText.trim() || !selectedTopic) return []

    const lines = bulkText
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    const items: ContentItem[] = []

    lines.forEach((line, index) => {
      const parts = line.split("\t").map((p) => p.trim()) // Support tab-separated
      if (parts.length === 1) {
        // Single column - assume it's a title, generate URL placeholder
        items.push({
          title: parts[0],
          url: "",
          topic_id: selectedTopic,
          type: defaultType,
          order_index: index + 1,
        })
      } else if (parts.length >= 2) {
        // Multiple columns - title, URL, optionally type
        const type = parts[2]?.toLowerCase() === "video" ? "video" : defaultType
        items.push({
          title: parts[0],
          url: parts[1],
          topic_id: selectedTopic,
          type: type as "slide" | "video",
          order_index: index + 1,
        })
      }
    })

    return items
  }

  // CSV template generation
  const generateCSVTemplate = () => {
    const template = `Title,URL,Type
Introduction Slides,https://drive.google.com/file/d/example1,slide
Overview Video,https://www.youtube.com/embed/example1,video
Chapter 1 Slides,https://drive.google.com/file/d/example2,slide
Demo Video,https://www.youtube.com/embed/example2,video`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-upload-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Upload functions
  const uploadManualItems = async () => {
    const validItems = contentItems.filter((item) => item.title && item.url && item.topic_id)
    if (validItems.length === 0) {
      toast({
        title: "No Valid Items",
        description: "Please add at least one item with title, URL, and topic",
        variant: "destructive",
      })
      return
    }

    return uploadItems(validItems)
  }

  const uploadBulkItems = async () => {
    const items = processBulkText()
    if (items.length === 0) {
      toast({
        title: "No Items to Upload",
        description: "Please enter content data and select a topic",
        variant: "destructive",
      })
      return
    }

    return uploadItems(items)
  }

  const uploadItems = async (items: ContentItem[]) => {
    setIsUploading(true)
    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const item of items) {
      try {
        const endpoint = `/api/admin/content/${item.type}s`
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })

        if (response.ok) {
          results.success++
        } else {
          const error = await response.json()
          results.failed++
          results.errors.push(`${item.title}: ${error.error || "Upload failed"}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`${item.title}: Network error`)
      }
    }

    setUploadResults(results)
    setIsUploading(false)

    if (results.success > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${results.success} items${results.failed > 0 ? `, ${results.failed} failed` : ""}`,
      })
      onSuccess()

      if (results.failed === 0) {
        onOpenChange(false)
      }
    } else {
      toast({
        title: "Upload Failed",
        description: "No items were uploaded successfully",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (activeTab === "manual") {
      await uploadManualItems()
    } else {
      await uploadBulkItems()
    }
  }

  const copyBulkTemplate = () => {
    const template = `Title 1	https://drive.google.com/file/d/example1	slide
Title 2	https://www.youtube.com/embed/example2	video
Title 3	https://drive.google.com/file/d/example3	slide`

    navigator.clipboard.writeText(template)
    toast({
      title: "Template Copied",
      description: "Paste into a spreadsheet or text editor",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Content
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {contentItems.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Item {index + 1}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === "slide" ? "default" : "secondary"}>
                            {item.type === "slide" ? (
                              <FileText className="h-3 w-3 mr-1" />
                            ) : (
                              <Video className="h-3 w-3 mr-1" />
                            )}
                            {item.type}
                          </Badge>
                          {contentItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContentItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Input
                            id={`title-${index}`}
                            placeholder="Content title"
                            value={item.title}
                            onChange={(e) => updateContentItem(index, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`type-${index}`}>Type</Label>
                          <Select
                            value={item.type}
                            onValueChange={(value: "slide" | "video") => updateContentItem(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slide">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Slide
                                </div>
                              </SelectItem>
                              <SelectItem value="video">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Video
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`url-${index}`}>URL</Label>
                        <Input
                          id={`url-${index}`}
                          placeholder={item.type === "slide" ? "Google Drive URL" : "YouTube URL"}
                          value={item.url}
                          onChange={(e) => updateContentItem(index, "url", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`topic-${index}`}>Topic</Label>
                        {loadingTopics ? (
                          <div className="flex items-center gap-2 p-2 border rounded">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading topics...</span>
                          </div>
                        ) : (
                          <Select
                            value={item.topic_id}
                            onValueChange={(value) => updateContentItem(index, "topic_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {topics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                  {topic.course.semester.name} › {topic.course.title} › {topic.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addContentItem}
                  className="w-full bg-transparent"
                  disabled={isUploading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="topic-select">Default Topic</Label>
                {loadingTopics ? (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading topics...</span>
                  </div>
                ) : (
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.course.semester.name} › {topic.course.title} › {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="default-type">Default Type</Label>
                <Select value={defaultType} onValueChange={(value: "slide" | "video") => setDefaultType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slide">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Slide
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bulk-text">Content Data</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copyBulkTemplate}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Template
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={generateCSVTemplate}>
                    <Download className="h-4 w-4 mr-1" />
                    Download CSV
                  </Button>
                </div>
              </div>
              <Textarea
                id="bulk-text"
                placeholder="Paste your content data here...&#10;Format: Title [TAB] URL [TAB] Type&#10;Or one per line: Title"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="h-32 font-mono text-sm"
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supported formats:</strong>
                  <br />• One title per line (URLs can be added later)
                  <br />• Tab-separated: Title [TAB] URL [TAB] Type
                  <br />• Copy from spreadsheet (Excel, Google Sheets)
                </AlertDescription>
              </Alert>
            </div>

            {bulkText && selectedTopic && (
              <div className="border rounded-lg p-3 bg-muted/50">
                <h4 className="font-medium mb-2">Preview ({processBulkText().length} items)</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {processBulkText()
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {item.type === "slide" ? <FileText className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                          <span className="font-medium">{item.title}</span>
                          {item.url && <span className="text-muted-foreground">• {item.url.substring(0, 30)}...</span>}
                        </div>
                      ))}
                    {processBulkText().length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        ... and {processBulkText().length - 5} more items
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Results */}
        {(uploadResults.success > 0 || uploadResults.failed > 0) && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center gap-4">
              {uploadResults.success > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{uploadResults.success} uploaded successfully</span>
                </div>
              )}
              {uploadResults.failed > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{uploadResults.failed} failed</span>
                </div>
              )}
            </div>
            {uploadResults.errors.length > 0 && (
              <ScrollArea className="h-20">
                <div className="space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || (activeTab === "bulk" && (!selectedTopic || !bulkText.trim()))}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload{" "}
                {activeTab === "manual"
                  ? contentItems.filter((i) => i.title && i.url && i.topic_id).length
                  : processBulkText().length}{" "}
                Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
