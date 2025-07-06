"use client"

import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { format, subDays, subMonths } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { GlassCard } from "./GlassCard"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const RADIAN = Math.PI / 180;

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  payload: {
    name: string;
  };
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      <text x={x} y={y} fill="white" textAnchor={textAnchor} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx + (outerRadius + 30) * Math.cos(-midAngle * RADIAN)} y={cy + (outerRadius + 30) * Math.sin(-midAngle * RADIAN)} fill="white" textAnchor={textAnchor} dominantBaseline="central">
        {payload.name}
      </text>
    </g>
  );
};

export function Analytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week')
  
  // Generate dynamic data based on timeRange
  const mockData = useMemo(() => {
    // Create date ranges based on selected time period
    let historyLength = 0;
    let dateFormat = "";
    let tasksHistoryData = [];
    let moodHistoryData = [];
    
    switch(timeRange) {
      case 'day':
        historyLength = 24; // 24 hours
        dateFormat = 'HH:mm';
        // Generate hourly data for the day
        tasksHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(new Date(new Date().setHours(i, 0, 0, 0)), dateFormat),
          completed: Math.floor(Math.random() * 3),
          total: Math.floor(Math.random() * 5) + 1
        }));
        moodHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(new Date(new Date().setHours(i, 0, 0, 0)), dateFormat),
          value: Math.floor(Math.random() * 5) + 1
        }));
        break;
      case 'week':
        historyLength = 7; // 7 days
        dateFormat = 'EEE dd';
        // Generate daily data for the week
        tasksHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), dateFormat),
          completed: Math.floor(Math.random() * 8),
          total: 8
        }));
        moodHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), dateFormat),
          value: Math.floor(Math.random() * 5) + 1
        }));
        break;
      case 'month':
        historyLength = 30; // ~30 days
        dateFormat = 'MMM dd';
        // Generate daily data for the month
        tasksHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subDays(new Date(), historyLength - 1 - i), dateFormat),
          completed: Math.floor(Math.random() * 10),
          total: 10
        }));
        moodHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subDays(new Date(), historyLength - 1 - i), dateFormat),
          value: Math.floor(Math.random() * 5) + 1
        }));
        break;
      case 'year':
        historyLength = 12; // 12 months
        dateFormat = 'MMM';
        // Generate monthly data for the year
        tasksHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subMonths(new Date(), historyLength - 1 - i), dateFormat),
          completed: Math.floor(Math.random() * 30),
          total: 40
        }));
        moodHistoryData = Array.from({ length: historyLength }, (_, i) => ({
          date: format(subMonths(new Date(), historyLength - 1 - i), dateFormat),
          value: Math.floor(Math.random() * 5) + 1
        }));
        break;
    }
    
    return {
      tasks: {
        completed: 15,
        total: 20,
        completionRate: "75%",
        history: tasksHistoryData
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
        history: moodHistoryData
      },
      journal: {
        entries: 10,
        wordsWritten: 2500,
        averageLength: 250
      }
    };
  }, [timeRange]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Card */}
        <GlassCard>
          <h3 className="font-medium">Tasks</h3>
          <div className="text-2xl font-bold">{mockData.tasks.completionRate}</div>
          <p className="text-sm text-muted-foreground">
            {mockData.tasks.completed} of {mockData.tasks.total} tasks completed
          </p>
        </GlassCard>

        {/* Habits Card */}
        <GlassCard>
          <h3 className="font-medium">Habits</h3>
          <div className="text-2xl font-bold">{mockData.habits.streaks} days</div>
          <p className="text-sm text-muted-foreground">
            Current streak (Best: {mockData.habits.bestStreak})
          </p>
        </GlassCard>

        {/* Mood Card */}
        <GlassCard>
          <h3 className="font-medium">Mood</h3>
          <div className="text-2xl">{mockData.mood.average}</div>
          <p className="text-sm text-muted-foreground">
            Average mood from {mockData.mood.entries} entries
          </p>
        </GlassCard>

        {/* Journal Card */}
        <GlassCard>
          <h3 className="font-medium">Journal</h3>
          <div className="text-2xl font-bold">{mockData.journal.entries}</div>
          <p className="text-sm text-muted-foreground">
            Entries ({mockData.journal.wordsWritten} words)
          </p>
        </GlassCard>
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
          <GlassCard>
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
          </GlassCard>

          {/* Mood Tracking Chart */}
          <GlassCard>
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
          </GlassCard>

          {/* Habits by Category */}
          <GlassCard>
            <h3 className="font-medium mb-4">Habits by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.habits.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
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
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
