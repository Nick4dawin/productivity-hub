'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, CheckCircle2 } from "lucide-react"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { useToast } from "./ui/use-toast"
import { getHabits, createHabit, toggleHabitDate, type Habit } from "@/lib/api"

const categories = ["Health", "Productivity", "Mindfulness", "Learning", "Other"]

export function HabitTracker() {
  const [mounted, setMounted] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [category, setCategory] = useState("Other")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Only load habits after component is mounted
  useEffect(() => {
    setMounted(true)
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      setIsLoading(true)
      const data = await getHabits()
      console.log('Loaded habits:', data)
      setHabits(data)
    } catch (error) {
      console.error('Error loading habits:', error)
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addHabit = async () => {
    if (!newHabit.trim()) return

    try {
      console.log('Adding habit:', { name: newHabit, category })
      const habit = await createHabit({
        name: newHabit.trim(),
        category,
      })
      console.log('Added habit:', habit)
      setHabits(prev => [...prev, habit])
      setNewHabit("")
      setCategory("Other")
      toast({
        title: "Success",
        description: "Habit created successfully",
      })
    } catch (error) {
      console.error('Error adding habit:', error)
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      })
    }
  }

  const toggleHabitForDate = async (habitId: string, date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      console.log('Toggling habit:', { habitId, dateStr })
      const updatedHabit = await toggleHabitDate(habitId, dateStr)
      console.log('Updated habit:', updatedHabit)
      setHabits(prev => prev.map(habit => 
        habit._id === habitId ? updatedHabit : habit
      ))
    } catch (error) {
      console.error('Error toggling habit:', error)
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      })
    }
  }

  // Get week days starting from current week
  const weekDays = useCallback(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

  // Don't render anything until mounted to prevent hydration issues
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
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a new habit..."
          className="w-full"
        />
        <div className="flex gap-4 flex-wrap">
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
          <Button variant="gradient" onClick={addHabit} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Habit</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-center">Streak</th>
              {weekDays().map(day => (
                <th key={format(day, "yyyy-MM-dd")} className="px-4 py-2 text-center">
                  <div className={`flex flex-col items-center ${isToday(day) ? 'text-primary' : ''}`}>
                    <span className="text-sm font-medium">{format(day, "EEE")}</span>
                    <span className="text-2xl">{format(day, "d")}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit._id} className="border-t">
                <td className="px-4 py-4">{habit.name}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                    {habit.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-primary">{habit.streak}</span>
                </td>
                {weekDays().map(day => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const isCompleted = habit.completedDates.some(d => 
                    format(new Date(d), "yyyy-MM-dd") === dateStr
                  )
                  return (
                    <td key={dateStr} className="px-4 py-4 text-center">
                      <Button
                        variant={isCompleted ? "gradient" : "outline"}
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                        onClick={() => toggleHabitForDate(habit._id, day)}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${!isCompleted && 'opacity-0'}`} />
                      </Button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
