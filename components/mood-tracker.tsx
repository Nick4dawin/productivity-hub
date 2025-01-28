'use client'

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { getMoods, createMood, type Mood } from "@/lib/api"
import { useToast } from "./ui/use-toast"
import { format } from "date-fns"

const moods = [
  { emoji: "😊", label: "Happy", color: "bg-green-500" },
  { emoji: "😌", label: "Calm", color: "bg-blue-500" },
  { emoji: "😐", label: "Neutral", color: "bg-gray-500" },
  { emoji: "😢", label: "Sad", color: "bg-indigo-500" },
  { emoji: "😤", label: "Angry", color: "bg-red-500" },
  { emoji: "😴", label: "Tired", color: "bg-purple-500" },
]

const energyLevels = [
  { emoji: "⚡️", label: "High", color: "bg-yellow-500" },
  { emoji: "✨", label: "Medium", color: "bg-blue-500" },
  { emoji: "🌙", label: "Low", color: "bg-purple-500" },
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

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">How are you feeling?</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {moods.map(({ emoji, label, color }) => (
              <Button
                key={label}
                variant={selectedMood === emoji ? "default" : "outline"}
                className={`h-24 ${selectedMood === emoji ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedMood(emoji)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{emoji}</div>
                  <div className="text-xs">{label}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Energy Level</h3>
          <div className="grid grid-cols-3 gap-3">
            {energyLevels.map(({ emoji, label, color }) => (
              <Button
                key={label}
                variant={selectedEnergy === emoji ? "default" : "outline"}
                className={`h-20 ${selectedEnergy === emoji ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedEnergy(emoji)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs">{label}</div>
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
                variant={selectedActivities.includes(activity) ? "default" : "outline"}
                className="h-10"
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
            className="min-h-[100px]"
          />
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={addMood}
          disabled={!selectedMood || !selectedEnergy}
        >
          Log Mood
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Entries</h3>
        {moodEntries.map((entry) => (
          <div
            key={entry._id}
            className="p-4 border rounded-lg space-y-3 bg-card"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{entry.mood}</span>
                <span className="text-2xl">{entry.energy}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(entry.date), "MMM d, yyyy")}
              </span>
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
  )
}
