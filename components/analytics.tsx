"use client"

import { useState, useMemo } from "react"
import { useQuery } from '@tanstack/react-query'
import { format, subDays, parseISO } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { GlassCard } from "./GlassCard"
import { Button } from "./ui/button"
import { LoadingSpinner } from "./ui/loading-spinner"
import { getTodos, getHabits, getMoods, getJournalEntries, Todo, Habit, Mood, JournalEntry } from '@/lib/api'
import Link from "next/link"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const RADIAN = Math.PI / 180;
interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
};

// Map mood strings to numerical values for charting
const moodToValue = (mood: string): number => {
    const mapping: { [key: string]: number } = {
      'rad': 5, 'good': 4, 'meh': 3, 'bad': 2, 'awful': 1,
    };
    return mapping[mood?.toLowerCase()] || 0;
};
  
// Map average numerical value back to an emoji for display
const valueToEmoji = (value: number): string => {
    if (value >= 4.5) return "🤩";
    if (value >= 3.5) return "😊";
    if (value >= 2.5) return "😐";
    if (value >= 1.5) return "😟";
    if (value > 0) return "😢";
    return "🤔";
};

export function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const { data: todosData, isLoading: isLoadingTodos } = useQuery<Todo[]>({ queryKey: ['todos'], queryFn: getTodos });
  const { data: habitsData, isLoading: isLoadingHabits } = useQuery<Habit[]>({ queryKey: ['habits'], queryFn: getHabits });
  const { data: moodsData, isLoading: isLoadingMoods } = useQuery<Mood[]>({ queryKey: ['moods'], queryFn: getMoods });
  const { data: journalData, isLoading: isLoadingJournal } = useQuery<JournalEntry[]>({ queryKey: ['journalEntries'], queryFn: getJournalEntries });

  const dynamicData = useMemo(() => {
    if (!todosData || !habitsData || !moodsData || !journalData) return null;

    // --- Summary Cards Data ---
    const completedTasks = todosData.filter(t => t.completed).length;
    const totalTasks = todosData.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const bestStreak = Math.max(0, ...habitsData.map(h => h.streak));
    
    const totalMoodEntries = moodsData.length;
    const averageMoodValue = totalMoodEntries > 0
      ? moodsData.reduce((acc, mood) => acc + moodToValue(mood.mood), 0) / totalMoodEntries
      : 0;
    
    const totalJournalEntries = journalData.length;
    const totalWordsWritten = journalData.reduce((acc, entry) => acc + (entry.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    
    // --- Charts Data ---
    const days = timeRange === 'week' ? 7 : 30;
    const dateArray = Array.from({ length: days }, (_, i) => subDays(new Date(), days - 1 - i));

    const taskHistory = dateArray.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const tasksForDay = todosData.filter(t => t.dueDate && format(parseISO(t.dueDate), 'yyyy-MM-dd') === dateStr);
        return {
            date: format(date, 'MMM dd'),
            completed: tasksForDay.filter(t => t.completed).length,
            total: tasksForDay.length,
        };
    });

    const moodHistory = dateArray.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const moodsForDay = moodsData.filter(m => format(parseISO(m.date), 'yyyy-MM-dd') === dateStr);
        const dayAverage = moodsForDay.length > 0 
            ? moodsForDay.reduce((acc, mood) => acc + moodToValue(mood.mood), 0) / moodsForDay.length 
            : 0;
        return {
            date: format(date, 'MMM dd'),
            value: dayAverage,
        };
    });

    const habitsByCategory = habitsData.reduce((acc, habit) => {
        const category = habit.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const habitPieData = Object.entries(habitsByCategory).map(([name, value]) => ({ name, value }));
    
    return {
      tasks: {
        completed: completedTasks,
        total: totalTasks,
        completionRate: `${taskCompletionRate}%`,
        history: taskHistory,
      },
      habits: {
        streaks: 0, // Current streak is per-habit, best streak is more representative
        bestStreak: bestStreak,
        byCategory: habitPieData,
      },
      mood: {
        average: valueToEmoji(averageMoodValue),
        entries: totalMoodEntries,
        history: moodHistory,
      },
      journal: {
        entries: totalJournalEntries,
        wordsWritten: totalWordsWritten,
      }
    };
  }, [todosData, habitsData, moodsData, journalData, timeRange]);

  const isLoading = isLoadingTodos || isLoadingHabits || isLoadingMoods || isLoadingJournal;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dynamicData) {
    return <div className="p-6 text-center">No analytics data available. Start using the app to see your progress!</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Card */}
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('setActiveView', { detail: 'todo' }));
        }}>
          <GlassCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
            <h3 className="font-medium">Tasks</h3>
            <div className="text-2xl font-bold">{dynamicData.tasks.completionRate}</div>
            <p className="text-sm text-muted-foreground">
              {dynamicData.tasks.completed} of {dynamicData.tasks.total} tasks completed
            </p>
          </GlassCard>
        </Link>

        {/* Habits Card */}
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('setActiveView', { detail: 'habits' }));
        }}>
          <GlassCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
            <h3 className="font-medium">Habits</h3>
            <div className="text-2xl font-bold">{dynamicData.habits.bestStreak} days</div>
            <p className="text-sm text-muted-foreground">
              Longest recorded streak
            </p>
          </GlassCard>
        </Link>

        {/* Mood Card */}
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('setActiveView', { detail: 'mood' }));
        }}>
          <GlassCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
            <h3 className="font-medium">Mood</h3>
            <div className="text-2xl">{dynamicData.mood.average}</div>
            <p className="text-sm text-muted-foreground">
              Average from {dynamicData.mood.entries} entries
            </p>
          </GlassCard>
        </Link>

        {/* Journal Card */}
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('setActiveView', { detail: 'journal' }));
        }}>
          <GlassCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
            <h3 className="font-medium">Journal</h3>
            <div className="text-2xl font-bold">{dynamicData.journal.entries}</div>
            <p className="text-sm text-muted-foreground">
              Entries ({dynamicData.journal.wordsWritten} words)
            </p>
          </GlassCard>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Completion Chart */}
          <GlassCard>
            <h3 className="font-medium mb-4">Task Completion</h3>
            <div className="h-[300px] md:h-[300px] w-full aspect-[4/3] md:aspect-auto">
              <ResponsiveContainer width="100%" height="100%" aspect={4/3}>
                <BarChart data={dynamicData.tasks.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="completed" fill="#8884d8" name="Completed Tasks" />
                  <Bar dataKey="total" fill="#82ca9d" name="Total Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Mood Tracking Chart */}
          <GlassCard>
            <h3 className="font-medium mb-4">Mood History</h3>
            <div className="h-[300px] md:h-[300px] w-full aspect-[4/3] md:aspect-auto">
              <ResponsiveContainer width="100%" height="100%" aspect={4/3}>
                <LineChart data={dynamicData.mood.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis domain={[1, 5]} stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value > 0 ? value.toFixed(1) : 'N/A', 'Avg Mood']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Mood Level" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Habit Distribution Chart */}
          <GlassCard className="lg:col-span-2">
            <h3 className="font-medium mb-4">Habit Category Distribution</h3>
            <div className="h-[300px] md:h-[300px] w-full aspect-[4/3] md:aspect-auto">
              <ResponsiveContainer width="100%" height="100%" aspect={16/9}>
                <PieChart>
                  <Pie
                    data={dynamicData.habits.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dynamicData.habits.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
