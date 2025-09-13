'use client'

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, Calendar, BrainCircuit, Edit, Trash, MoreHorizontal, Lightbulb } from "lucide-react"
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, type JournalEntry } from "@/lib/api"
import { useToast } from "./ui/use-toast"
import { format } from "date-fns"
import { JournalAnalysis } from "./journal-analysis"
import { JournalConfirmationModal } from "./journal-confirmation-modal"
import { JournalSuggestions } from "./journal-suggestions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog"

const categories = ["Personal", "Work", "Health", "Learning", "Other"]

export function Journal() {
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [savedJournalId, setSavedJournalId] = useState<string | null>(null)
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false)

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
      setIsSubmitting(true)
      console.log('🚀 Adding enhanced journal entry:', { title, content, category })
      
      const entry = await createJournalEntry({
        title: title.trim(),
        content: content.trim(),
        category,
        date: format(new Date(), "yyyy-MM-dd"),
      })
      
      console.log('✅ Journal entry created:', entry)
      console.log('🔍 Analysis data received:', entry.analysis)
      
      // Check if we have extracted data to show modal
      if (entry.analysis?.extracted) {
        const extractedData = entry.analysis.extracted;
        const hasExtractedData = 
          !!extractedData.mood ||
          (extractedData.todos && extractedData.todos.length > 0) ||
          (extractedData.media && extractedData.media.length > 0) ||
          (extractedData.habits && extractedData.habits.length > 0);
          
        console.log('📊 Extracted data summary:', {
          hasMood: !!extractedData.mood,
          todosCount: extractedData.todos?.length || 0,
          mediaCount: extractedData.media?.length || 0,
          habitsCount: extractedData.habits?.length || 0,
          hasExtractedData
        });
        
        if (hasExtractedData) {
          console.log('🎯 Showing confirmation modal with extracted data');
          setSavedJournalId(entry._id);
          setExtractedData(extractedData);
          setIsConfirmModalOpen(true);
          
          // Also show a toast for immediate feedback
          toast({
            title: "AI Analysis Complete",
            description: `Found: ${extractedData.mood ? 'mood, ' : ''}${extractedData.todos?.length || 0} todos, ${extractedData.media?.length || 0} media, ${extractedData.habits?.length || 0} habits`,
          })
        }
      } else {
        console.log('⚠️ No extracted data found in analysis');
      }
      
      setEntries(prev => [entry, ...prev])
      setTitle("")
      setContent("")
      setCategory("Personal")
      
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      })
    } catch (error) {
      console.error('💥 Error adding journal entry:', error)
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setCategory(entry.category)
    setIsEditModalOpen(true)
  }
  
  const handleUpdateEntry = async () => {
    if (!editingEntry || !title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const updatedEntry = await updateJournalEntry(editingEntry._id, {
        title: title.trim(),
        content: content.trim(),
        category,
        // Request new AI analysis since content changed
        requestAnalysis: true
      })

      setEntries(prev => prev.map(entry => 
        entry._id === updatedEntry._id ? updatedEntry : entry
      ))
      
      setIsEditModalOpen(false)
      setEditingEntry(null)
      setTitle("")
      setContent("")
      setCategory("Personal")
      
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      })
    } catch (error) {
      console.error('Error updating journal entry:', error)
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return

    try {
      await deleteJournalEntry(id)
      setEntries(prev => prev.filter(entry => entry._id !== id))
      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      })
    }
  }

  const handleOpenAnalysis = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsAnalysisModalOpen(true);
  }

  const handleConfirmExtractedData = async (selectedData: any) => {
    if (!savedJournalId) return;
    
    try {
      console.log('🎯 Saving extracted items:', selectedData);
      
      // Call the backend to save extracted items
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/journal/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          journalId: savedJournalId,
          ...selectedData
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Extracted items saved:', result);
        
        // Calculate counts for success message
        let itemsAdded = 0;
        if (selectedData.mood) itemsAdded++;
        itemsAdded += selectedData.todos?.length || 0;
        itemsAdded += selectedData.media?.length || 0;
        itemsAdded += selectedData.habits?.length || 0;
        
        toast({
          title: `${itemsAdded} Items Added`,
          description: 'Your journal items have been added to the appropriate collections',
        });
      } else {
        console.error('❌ Failed to save extracted items');
        toast({
          title: "Error",
          description: "Failed to save extracted items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Error saving extracted items:', error);
      toast({
        title: "Error",
        description: "Failed to process extracted items",
        variant: "destructive",
      });
    }
    
    // Reset modal state
    setIsConfirmModalOpen(false);
    setSavedJournalId(null);
    setExtractedData(null);
  }

  const handlePromptSelect = (prompt: string) => {
    setContent(prev => prev ? `${prev}\n\n${prompt}` : prompt)
    setIsPromptsModalOpen(false)
    toast({
      title: "Prompt Added",
      description: "Writing prompt has been added to your journal entry",
    })
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

  const renderJournalForm = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title..."
          className="flex-1 bg-white/5 border-white/10 placeholder:text-gray-400"
        />
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-black/80 border-white/10 text-white">
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
        className="min-h-[200px] bg-white/5 border-white/10 placeholder:text-gray-400"
      />
    </div>
  )

  return (
    <>
    {/* Desktop Layout: Two-column grid */}
    <div className="hidden lg:grid lg:grid-cols-[400px_1fr] lg:gap-8 lg:h-[calc(100vh-200px)]">
      {/* Left Column: Journal Form */}
      <div className="space-y-6 bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">New Entry</h2>
        </div>
        
        <div className="space-y-4">
          {renderJournalForm()}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPromptsModalOpen(true)}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button
              variant="gradient"
              className="flex-1"
              onClick={addEntry}
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Journal Entries */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Recent Entries</h2>
          <span className="text-sm text-muted-foreground ml-auto">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        
        <div className="space-y-4">
          {entries.map(entry => (
            <div
              key={entry._id}
              className="p-4 border rounded-lg space-y-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
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
                <div className="flex items-center">
                  {entry.analysis && (
                    <Button variant="ghost" size="icon" onClick={() => handleOpenAnalysis(entry)}
                      className="mr-1">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/10 border-white/10 backdrop-blur-md">
                      <DropdownMenuItem onClick={() => handleEditEntry(entry)} className="cursor-pointer flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEntry(entry._id)} className="cursor-pointer flex items-center gap-2 text-red-500">
                        <Trash className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm line-clamp-3">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Mobile Layout: Original vertical layout */}
    <div className="lg:hidden space-y-6">
      <div className="space-y-4">
        {renderJournalForm()}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPromptsModalOpen(true)}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Lightbulb className="w-4 h-4" />
          </Button>
          <Button
            variant="gradient"
            className="flex-1"
            onClick={addEntry}
            disabled={!title.trim() || !content.trim() || isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry._id}
            className="p-6 border rounded-lg space-y-4 bg-white/5 border-white/10"
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
              <div className="flex items-center">
                {entry.analysis && (
                  <Button variant="ghost" size="icon" onClick={() => handleOpenAnalysis(entry)}
                    className="mr-1">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/10 border-white/10 backdrop-blur-md">
                    <DropdownMenuItem onClick={() => handleEditEntry(entry)} className="cursor-pointer flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteEntry(entry._id)} className="cursor-pointer flex items-center gap-2 text-red-500">
                      <Trash className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
    <JournalAnalysis 
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysis={selectedEntry?.analysis || null}
    />
    
    <JournalConfirmationModal 
      isOpen={isConfirmModalOpen}
      onClose={() => {
        setIsConfirmModalOpen(false);
        setSavedJournalId(null);
        setExtractedData(null);
      }}
      extractedData={extractedData || { mood: '', todos: [], media: [], habits: [] }}
      onConfirm={handleConfirmExtractedData}
    />
    
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Journal Entry</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to your journal entry below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {renderJournalForm()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="bg-white/10 border-white/20">
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleUpdateEntry} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <Dialog open={isPromptsModalOpen} onOpenChange={setIsPromptsModalOpen}>
      <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Writing Prompts
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Get inspired with AI-generated writing prompts based on your recent activity.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <JournalSuggestions onSelectSuggestion={handlePromptSelect} />
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
