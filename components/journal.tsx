'use client'

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, Calendar } from "lucide-react"
import { getJournalEntries, createJournalEntry, type JournalEntry } from "@/lib/api"
import { useToast } from "./ui/use-toast"
import { format } from "date-fns"

const categories = ["Personal", "Work", "Health", "Learning", "Other"]

export function Journal() {
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setIsLoading(true)
      const data = await getJournalEntries()
      console.log('Loaded journal entries:', data)
      setEntries(data)
    } catch (error) {
      console.error('Error loading journal entries:', error)
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Adding journal entry:', { title, content, category })
      const entry = await createJournalEntry({
        title: title.trim(),
        content: content.trim(),
        category,
        date: format(new Date(), "yyyy-MM-dd"),
      })
      console.log('Added journal entry:', entry)
      setEntries(prev => [...prev, entry])
      setTitle("")
      setContent("")
      setCategory("Personal")
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      })
    } catch (error) {
      console.error('Error adding journal entry:', error)
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      })
    }
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className="flex-1"
          />
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts..."
          className="min-h-[200px]"
        />
        <Button
          variant="gradient"
          className="w-full"
          onClick={addEntry}
          disabled={!title.trim() || !content.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry._id}
            className="p-6 border rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{entry.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                    {entry.category}
                  </span>
                  <span className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
