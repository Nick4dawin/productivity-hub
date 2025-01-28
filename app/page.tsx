'use client'

import { useAuth } from "@/contexts/auth-context"
import { TodoList } from "@/components/todo-list"
import { HabitTracker } from "@/components/habit-tracker"
import { MoodTracker } from "@/components/mood-tracker"
import { Analytics } from "@/components/analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, ListTodo, Calendar, Brain, BarChart3 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <AuthGuard>
      <main className="min-h-screen w-full">
        <div className="container mx-auto py-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              Hello <span className="text-purple-600">{user?.name}</span>!
            </h1>
            <Button variant="ghost" onClick={logout} className="ml-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="todo" className="space-y-6">
            <TabsList className="bg-background w-full p-1 flex gap-2">
              <TabsTrigger value="todo" className={cn(
                "flex-1",
                "data-[state=active]:tabs-gradient data-[state=active]:text-white"
              )}>
                <ListTodo className="w-4 h-4 mr-2" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="habits" className={cn(
                "flex-1",
                "data-[state=active]:tabs-gradient data-[state=active]:text-white"
              )}>
                <Calendar className="w-4 h-4 mr-2" />
                <span>Habits</span>
              </TabsTrigger>
              <TabsTrigger value="mood" className={cn(
                "flex-1",
                "data-[state=active]:tabs-gradient data-[state=active]:text-white"
              )}>
                <Brain className="w-4 h-4 mr-2" />
                <span>Mood</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className={cn(
                "flex-1",
                "data-[state=active]:tabs-gradient data-[state=active]:text-white"
              )}>
                <BarChart3 className="w-4 h-4 mr-2" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todo">
              <TodoList />
            </TabsContent>

            <TabsContent value="habits">
              <HabitTracker />
            </TabsContent>

            <TabsContent value="mood">
              <MoodTracker />
            </TabsContent>

            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AuthGuard>
  )
}
