'use client'

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { getMoods, createMood, updateMood, deleteMood, type Mood } from "@/lib/api"
import { useToast } from "./ui/use-toast"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog"

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Angry" },
  { emoji: "😴", label: "Tired" },
]

const energyLevels = [
  { emoji: "⚡️", label: "High" },
  { emoji: "✨", label: "Medium" },
  { emoji: "🌙", label: "Low" },
]

const activities = [
  "Exercise", "Work", "Social", "Family",
  "Hobbies", "Reading", "Movies", "Gaming",
  "Nature", "Shopping", "Cooking", "Music"
]

export function MoodTracker() {
  const [mounted, setMounted] = useState(false)
  const [moodEntries, setMoodEntries] = useState<Mood[]>([])
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [selectedEnergy, setSelectedEnergy] = useState<string>("")
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingMood, setEditingMood] = useState<Mood | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadMoods()
  }, [])

  const loadMoods = async () => {
    try {
      setIsLoading(true)
      const data = await getMoods()
      console.log('Loaded moods:', data)
      setMoodEntries(data)
    } catch (error) {
      console.error('Error loading moods:', error)
      toast({
        title: "Error",
        description: "Failed to load moods",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addMood = async () => {
    if (!selectedMood || !selectedEnergy) {
      toast({
        title: "Error",
        description: "Please select both mood and energy level",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Adding mood:', {
        mood: selectedMood,
        energy: selectedEnergy,
        activities: selectedActivities,
        note
      })
      const mood = await createMood({
        mood: selectedMood,
        energy: selectedEnergy,
        activities: selectedActivities,
        note: note.trim(),
        date: format(new Date(), "yyyy-MM-dd"),
      })
      console.log('Added mood:', mood)
      setMoodEntries(prev => [mood, ...prev])
      setSelectedMood("")
      setSelectedEnergy("")
      setSelectedActivities([])
      setNote("")
      toast({
        title: "Success",
        description: "Mood logged successfully",
      })
    } catch (error) {
      console.error('Error adding mood:', error)
      toast({
        title: "Error",
        description: "Failed to log mood",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditMood = (mood: Mood) => {
    setEditingMood(mood)
    setSelectedMood(mood.mood)
    setSelectedEnergy(mood.energy)
    setSelectedActivities(mood.activities)
    setNote(mood.note)
    setIsEditModalOpen(true)
  }
  
  const handleUpdateMood = async () => {
    if (!editingMood || !selectedMood || !selectedEnergy) {
      toast({
        title: "Error",
        description: "Please select both mood and energy level",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const updatedMood = await updateMood(editingMood._id, {
        mood: selectedMood,
        energy: selectedEnergy,
        activities: selectedActivities,
        note: note.trim(),
      })

      setMoodEntries(prev => prev.map(mood => 
        mood._id === updatedMood._id ? updatedMood : mood
      ))
      
      setIsEditModalOpen(false)
      setEditingMood(null)
      setSelectedMood("")
      setSelectedEnergy("")
      setSelectedActivities([])
      setNote("")
      
      toast({
        title: "Success",
        description: "Mood updated successfully",
      })
    } catch (error) {
      console.error('Error updating mood:', error)
      toast({
        title: "Error",
        description: "Failed to update mood",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteMood = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mood entry?")) return

    try {
      await deleteMood(id)
      setMoodEntries(prev => prev.filter(mood => mood._id !== id))
      toast({
        title: "Success",
        description: "Mood deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting mood:', error)
      toast({
        title: "Error",
        description: "Failed to delete mood",
        variant: "destructive",
      })
    }
  }

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    )
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

  const renderMoodSelector = () => (
    <>
      <div>
        <h3 className="text-lg font-medium mb-4">How are you feeling?</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {moods.map(({ emoji, label }) => (
                          <Button
                key={label}
                variant="outline"
                className={`h-24 bg-white/5 border-white/10 ${
                  selectedMood === emoji 
                  ? 'ring-2 ring-primary ring-opacity-70 shadow-[0_0_15px_rgba(124,58,237,0.3)] border-primary/50' 
                  : ''
                }`}
                onClick={() => setSelectedMood(emoji)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-xs text-white">{label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Energy Level</h3>
        <div className="grid grid-cols-3 gap-3">
          {energyLevels.map(({ emoji, label }) => (
                          <Button
                key={label}
                variant="outline"
                className={`h-20 bg-white/5 border-white/10 ${
                  selectedEnergy === emoji 
                  ? 'ring-2 ring-primary ring-opacity-70 shadow-[0_0_15px_rgba(124,58,237,0.3)] border-primary/50' 
                  : ''
                }`}
                onClick={() => setSelectedEnergy(emoji)}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-xs text-white">{label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Activities</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {activities.map((activity) => (
                          <Button
                key={activity}
                variant="outline"
                className={`h-10 bg-white/5 border-white/10 ${
                  selectedActivities.includes(activity) 
                  ? 'ring-2 ring-primary ring-opacity-70 shadow-[0_0_10px_rgba(124,58,237,0.3)] border-primary/50 text-white' 
                  : 'text-white'
                }`}
                onClick={() => toggleActivity(activity)}
            >
              {activity}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Notes</h3>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any thoughts or reflections..."
          className="min-h-[100px] bg-white/5 border-white/10 placeholder:text-gray-400"
        />
      </div>
    </>
  )

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-6">
          {renderMoodSelector()}

          <Button
            variant="gradient"
            className="w-full"
            onClick={addMood}
            disabled={!selectedMood || !selectedEnergy || isSubmitting}
          >
            Log Mood
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recent Entries</h3>
          {moodEntries.map((entry) => (
            <div
              key={entry._id}
              className="p-4 border rounded-lg space-y-3 bg-white/5 border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.mood}</span>
                  <span className="text-2xl">{entry.energy}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-2">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/10 border-white/10 backdrop-blur-md">
                      <DropdownMenuItem onClick={() => handleEditMood(entry)} className="cursor-pointer flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteMood(entry._id)} className="cursor-pointer flex items-center gap-2 text-red-500">
                        <Trash className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {entry.activities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.activities.map((activity) => (
                    <span
                      key={activity}
                      className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              )}
              {entry.note && (
                <p className="text-sm text-muted-foreground">{entry.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Mood Entry</DialogTitle>
            <DialogDescription>
              Make changes to your mood entry here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {renderMoodSelector()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="bg-white/10 border-white/20">
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleUpdateMood} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
