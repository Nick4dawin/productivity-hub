'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, CheckCircle2, Edit, Trash, MoreHorizontal } from "lucide-react"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { useToast } from "./ui/use-toast"
import { getHabits, createHabit, toggleHabitDate, updateHabit, deleteHabit, type Habit } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog"
import { cn } from "@/lib/utils"

const categories = ["Health", "Productivity", "Mindfulness", "Learning", "Other"]

export function HabitTracker() {
  const [mounted, setMounted] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [category, setCategory] = useState("Other")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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
      setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleHabitForDate = async (habitId: string, date: Date) => {
    // Prevent toggling habits for future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date > today) {
      toast({
        title: "Error",
        description: "Cannot mark habits for future dates",
        variant: "destructive",
      });
      return;
    }
    
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

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setNewHabit(habit.name)
    setCategory(habit.category)
    setIsEditModalOpen(true)
  }

  const handleUpdateHabit = async () => {
    if (!editingHabit || !newHabit.trim()) return

    try {
      setIsSubmitting(true)
      const updatedHabit = await updateHabit(editingHabit._id, {
        name: newHabit.trim(),
        category,
      })

      setHabits(prev => prev.map(habit => 
        habit._id === updatedHabit._id ? updatedHabit : habit
      ))
      
      setIsEditModalOpen(false)
      setEditingHabit(null)
      setNewHabit("")
      setCategory("Other")
      
      toast({
        title: "Success",
        description: "Habit updated successfully",
      })
    } catch (error) {
      console.error('Error updating habit:', error)
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return

    try {
      await deleteHabit(habitId)
      setHabits(prev => prev.filter(habit => habit._id !== habitId))
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast({
        title: "Error",
        description: "Failed to delete habit",
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
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Add a new habit..."
            className="w-full bg-white/5 border-white/10 placeholder:text-gray-400"
          />
          <div className="flex gap-4 flex-wrap">
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
            <Button variant="gradient" onClick={addHabit} className="ml-auto" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
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
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr key={habit._id} className="border-t border-white/10">
                  <td className="px-4 py-4">{habit.name}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                      {habit.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">{habit.streak}</td>
                  {weekDays().map(day => (
                    <td key={format(day, "yyyy-MM-dd")} className="px-4 py-4 text-center">
                      <button onClick={() => toggleHabitForDate(habit._id, day)}>
                        <CheckCircle2
                          className={cn(
                            "w-8 h-8 transition-colors",
                            habit.completedDates?.includes(format(day, "yyyy-MM-dd"))
                              ? "text-green-500"
                              : "text-gray-600 hover:text-green-400"
                          )}
                        />
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/80 border-white/10 text-white">
                        <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteHabit(habit._id)} className="text-red-500">
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {habits.map(habit => (
            <div key={habit._id} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{habit.name}</h3>
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">{habit.category}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 border-white/10 text-white">
                    <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteHabit(habit._id)} className="text-red-500">
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-between items-center">
                <p>Streak: <span className="font-bold text-primary">{habit.streak} days</span></p>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weekDays().map(day => (
                  <div key={format(day, "yyyy-MM-dd")} className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${isToday(day) ? 'text-primary' : ''}`}>{format(day, "EEE")}</span>
                    <button onClick={() => toggleHabitForDate(habit._id, day)}>
                      <CheckCircle2
                        className={cn(
                          "w-7 h-7 transition-colors",
                          habit.completedDates?.includes(format(day, "yyyy-MM-dd"))
                            ? "text-green-500"
                            : "text-gray-600 hover:text-green-400"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditModalOpen && editingHabit && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Edit Habit</DialogTitle>
              <DialogDescription>
                Make changes to your habit here.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="Habit name"
                className="bg-white/5 border-white/10 placeholder:text-gray-400"
              />
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-white/10 text-white">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="bg-white/10 border-white/20">
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleUpdateHabit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
