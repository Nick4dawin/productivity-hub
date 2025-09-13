"use client"

import { useState, useMemo, useRef } from "react"
import { useQuery } from '@tanstack/react-query'
import { format, subDays, parseISO } from "date-fns"
import { GlassCard } from "./GlassCard"
import { LoadingSpinner } from "./ui/loading-spinner"
import { getTodos, getHabits, getMoods, getJournalEntries, Todo, Habit, Mood, JournalEntry } from '@/lib/api'
import { TrendingUp, Calendar, Target, Heart, PenTool } from 'lucide-react'



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
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleCardScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      const newActiveCard = Math.round(scrollLeft / cardWidth);
      setActiveCard(newActiveCard);
    }
  };

  return (
    <div className="relative min-h-screen pb-20 md:pb-6">
      {/* Segmented Control */}
      <div className="mb-6 p-4 md:p-6">
        <div className="flex items-center justify-center">
          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                timeRange === 'week'
                  ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                timeRange === 'month'
                  ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              30D
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: 4-Card Grid Layout */}
      <div className="md:hidden px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Task Completion Card */}
          <GlassCard className="h-64 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative z-10 text-center p-4">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-4 text-white">Task Completion</h3>
              
              {/* Circular Progress Ring */}
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle
                    cx="60" cy="60" r="50" stroke="url(#taskGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${(parseInt(dynamicData.tasks.completionRate) / 100) * 314} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{dynamicData.tasks.completionRate}</span>
                </div>
              </div>

              <p className="text-white/80 text-sm">{dynamicData.tasks.completed} tasks completed</p>
            </div>
          </GlassCard>

          {/* Mood History Card */}
          <GlassCard className="h-64 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10" />
            <div className="relative z-10 text-center p-4">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-4 text-white">Mood History</h3>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl">{dynamicData.mood.average}</span>
              </div>
              
              <div className="flex justify-center gap-2 mb-3">
                <span className="text-lg">😊</span>
                <span className="text-lg">😐</span>
                <span className="text-lg">😔</span>
              </div>
              
              <p className="text-white/80 text-sm mb-1">Mostly Neutral</p>
              <p className="text-white/60 text-xs">Try journaling!</p>
            </div>
          </GlassCard>

          {/* Habit Distribution Card */}
           <GlassCard className="h-64 flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10" />
             <div className="relative z-10 p-4 h-full flex flex-col justify-center">
               <div className="text-center mb-4">
                 <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                 <h3 className="text-lg font-semibold text-white">Habit Distribution</h3>
               </div>
               
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-base">🍎</span>
                     <span className="text-white/80 text-sm">Fitness</span>
                   </div>
                   <span className="text-white font-medium text-sm">50%</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-base">🧘</span>
                     <span className="text-white/80 text-sm">Mindfulness</span>
                   </div>
                   <span className="text-white font-medium text-sm">30%</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-base">💼</span>
                     <span className="text-white/80 text-sm">Work</span>
                   </div>
                   <span className="text-white font-medium text-sm">20%</span>
                 </div>
               </div>
             </div>
           </GlassCard>

           {/* Journal & Streak Combined Card */}
           <GlassCard className="h-64 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10" />
             <div className="relative z-10 text-center p-4">
               <div className="flex justify-center gap-3 mb-3">
                 <PenTool className="w-6 h-6 text-purple-400" />
                 <Calendar className="w-6 h-6 text-orange-400" />
               </div>
               <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="text-center">
                   <div className="text-xl font-bold text-white mb-1">{dynamicData.journal.entries}</div>
                   <p className="text-white/80 text-sm">Journal</p>
                   <p className="text-white/60 text-xs">Entries</p>
                 </div>
                 <div className="text-center">
                   <div className="text-xl font-bold text-white mb-1">{dynamicData.habits.bestStreak}</div>
                   <p className="text-white/80 text-sm">Best Streak</p>
                   <p className="text-white/60 text-xs">Days</p>
                 </div>
               </div>
             </div>
           </GlassCard>
         </div>
       </div>

        {/* Desktop: 4-Card Grid Layout */}
        <div className="hidden md:block px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Task Completion Card */}
            <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="relative z-10 text-center p-6">
                <Target className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4 text-white">Task Completion</h3>
                
                {/* Circular Progress Ring */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                    <circle
                      cx="60" cy="60" r="50" stroke="url(#taskGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                      strokeDasharray={`${(parseInt(dynamicData.tasks.completionRate) / 100) * 314} 314`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{dynamicData.tasks.completionRate}</span>
                  </div>
                </div>

                <p className="text-white/80 text-sm">{dynamicData.tasks.completed} tasks completed</p>
              </div>
            </GlassCard>

            {/* Mood History Card */}
            <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10" />
              <div className="relative z-10 text-center p-6">
                <Heart className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4 text-white">Mood History</h3>
                
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">{dynamicData.mood.average}</span>
                </div>
                
                <div className="flex justify-center gap-2 mb-4">
                  <span className="text-xl">😊</span>
                  <span className="text-xl">😐</span>
                  <span className="text-xl">😔</span>
                </div>
                
                <p className="text-white/80 text-sm mb-1">Mostly Neutral</p>
                <p className="text-white/60 text-xs">Try journaling!</p>
              </div>
            </GlassCard>

            {/* Habit Distribution Card */}
            <GlassCard className="flex flex-col relative overflow-hidden h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                <div className="text-center mb-6">
                  <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white">Habit Distribution</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍎</span>
                      <span className="text-white/80 text-sm">Fitness</span>
                    </div>
                    <span className="text-white font-medium text-sm">50%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧘</span>
                      <span className="text-white/80 text-sm">Mindfulness</span>
                    </div>
                    <span className="text-white font-medium text-sm">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💼</span>
                      <span className="text-white/80 text-sm">Work</span>
                    </div>
                    <span className="text-white font-medium text-sm">20%</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Journal & Streak Combined Card */}
            <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10" />
              <div className="relative z-10 text-center p-6">
                <div className="flex justify-center gap-4 mb-4">
                  <PenTool className="w-8 h-8 text-purple-400" />
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-6">Progress</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{dynamicData.journal.entries}</div>
                    <p className="text-white/80 text-sm">Journal</p>
                    <p className="text-white/60 text-xs">Entries</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{dynamicData.habits.bestStreak}</div>
                    <p className="text-white/80 text-sm">Best Streak</p>
                    <p className="text-white/60 text-xs">Days</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
