'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar as CalendarIcon, CheckCircle2, Trash2 } from "lucide-react"
import { getTodos, createTodo, updateTodo, deleteTodo, type Todo } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { GlassCard } from "./GlassCard"

const categories = ["Work", "Personal", "Shopping", "Health", "Education", "Other"]
const priorities = ["low", "medium", "high"] as const

export function TodoList() {
  const [mounted, setMounted] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [category, setCategory] = useState("Other")
  const [priority, setPriority] = useState<typeof priorities[number]>("medium")
  const [dueDate, setDueDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setIsLoading(true)
      const data = await getTodos()
      setTodos(data)
    } catch (error) {
      console.error('Error loading todos:', error)
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return

    try {
      const todo = await createTodo({
        title: newTodo.trim(),
        category,
        priority,
        dueDate: dueDate || undefined,
        completed: false
      })
      setTodos(prev => [...prev, todo])
      setNewTodo("")
      setCategory("Other")
      setPriority("medium")
      setDueDate("")
      toast({
        title: "Success",
        description: "Todo created successfully",
      })
    } catch (error) {
      console.error('Error adding todo:', error)
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
      })
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await updateTodo(id, { completed })
      setTodos(prev => prev.map(todo => 
        todo._id === id ? updatedTodo : todo
      ))
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    }
  }

  const removeTodo = async (id: string) => {
    try {
      await deleteTodo(id)
      setTodos(prev => prev.filter(todo => todo._id !== id))
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      })
    } catch (error) {
      console.error('Error removing todo:', error)
      toast({
        title: "Error",
        description: "Failed to delete todo",
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
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo..."
          className="w-full bg-white/5 backdrop-blur-md"
        />
        <div className="flex gap-4 flex-wrap">
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-[180px] bg-white/5 backdrop-blur-md">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as typeof priorities[number])}
          >
            <SelectTrigger className="w-[180px] bg-white/5 backdrop-blur-md">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-[180px] bg-white/5 backdrop-blur-md"
            placeholder="Select due date"
          />
          <Button variant="gradient" onClick={addTodo} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Todo
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {todos.map(todo => (
          <GlassCard
            key={todo._id}
            className={cn(
              "flex items-center gap-4 p-4",
              todo.completed && "bg-black/20 backdrop-blur-sm"
            )}
          >
            <Button
              variant={todo.completed ? "gradient" : "outline"}
              size="sm"
              className="rounded-full w-8 h-8 p-0 shrink-0"
              onClick={() => toggleTodo(todo._id, !todo.completed)}
            >
              <CheckCircle2 className={`w-4 h-4 ${!todo.completed && 'opacity-0'}`} />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(todo.completed && 'line-through text-muted-foreground')}>
                  {todo.title}
                </span>
                {todo.dueDate && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {format(new Date(todo.dueDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                  {todo.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  todo.priority === 'high' 
                    ? 'bg-red-500/10 text-red-500'
                    : todo.priority === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {todo.priority}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => removeTodo(todo._id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
