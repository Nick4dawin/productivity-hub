"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { format, startOfWeek, startOfMonth, startOfYear, addDays, subDays } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function Analytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week')

  const mockData = {
    tasks: {
      completed: 15,
      total: 20,
      completionRate: "75%",
      history: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        completed: Math.floor(Math.random() * 8),
        total: 8
      }))
    },
    habits: {
      streaks: 5,
      bestStreak: 7,
      completionRate: "80%",
      byCategory: [
        { name: 'Health', value: 8 },
        { name: 'Productivity', value: 6 },
        { name: 'Learning', value: 4 },
        { name: 'Mindfulness', value: 3 }
      ]
    },
    mood: {
      average: "😊",
      topMood: "🤗",
      entries: 14,
      history: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: Math.floor(Math.random() * 5) + 1
      }))
    },
    journal: {
      entries: 10,
      wordsWritten: 2500,
      averageLength: 250
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Card */}
        <div className="p-4 border rounded-lg space-y-2 bg-card">
          <h3 className="font-medium">Tasks</h3>
          <div className="text-2xl font-bold">{mockData.tasks.completionRate}</div>
          <p className="text-sm text-muted-foreground">
            {mockData.tasks.completed} of {mockData.tasks.total} tasks completed
          </p>
        </div>

        {/* Habits Card */}
        <div className="p-4 border rounded-lg space-y-2 bg-card">
          <h3 className="font-medium">Habits</h3>
          <div className="text-2xl font-bold">{mockData.habits.streaks} days</div>
          <p className="text-sm text-muted-foreground">
            Current streak (Best: {mockData.habits.bestStreak})
          </p>
        </div>

        {/* Mood Card */}
        <div className="p-4 border rounded-lg space-y-2 bg-card">
          <h3 className="font-medium">Mood</h3>
          <div className="text-2xl">{mockData.mood.average}</div>
          <p className="text-sm text-muted-foreground">
            Average mood from {mockData.mood.entries} entries
          </p>
        </div>

        {/* Journal Card */}
        <div className="p-4 border rounded-lg space-y-2 bg-card">
          <h3 className="font-medium">Journal</h3>
          <div className="text-2xl font-bold">{mockData.journal.entries}</div>
          <p className="text-sm text-muted-foreground">
            Entries ({mockData.journal.wordsWritten} words)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeRange('day')}
          >
            Day
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Completion Chart */}
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-4">Task Completion</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.tasks.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#0088FE" name="Completed Tasks" />
                  <Bar dataKey="total" fill="#00C49F" name="Total Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Tracking Chart */}
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-4">Mood Tracking</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.mood.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Mood Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habits by Category */}
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-medium mb-4">Habits by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.habits.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockData.habits.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
