'use client';

import { useEffect, useState } from 'react';
import { Goal, getGoals, deleteGoal } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import GoalForm from '@/components/goal-form';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<{goalId: string, milestoneIndex: number} | null>(null);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: 'Error fetching goals',
        description: 'Could not retrieve your goals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      toast({ title: 'Goal deleted', description: 'Your goal has been successfully removed.' });
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: 'Error deleting goal',
        description: 'Could not delete the goal. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleOpenForm = () => {
    setSelectedGoal(null);
    setIsFormOpen(true);
  };

  const handleMilestoneClick = (goalId: string, milestoneIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const goal = goals.find(g => g._id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsFormOpen(true);
      // Focus on milestones step in the form
    }
  };
  
  const getProgress = (milestones: Goal['milestones'] = []) => {
      if(milestones.length === 0) return 0;
      const completed = milestones.filter(m => m.completed).length;
      return (completed / milestones.length) * 100;
  }

  if (loading) return <div>Loading your goals...</div>;

  return (
    <div className="container mx-auto p-4 pb-20 sm:pb-4">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold truncate">SMART Goals</h1>
        <Button onClick={handleOpenForm} variant="gradient" className="shrink-0">
          <span className="hidden sm:inline">Create New Goal</span>
          <span className="sm:hidden">+ Goal</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const completedMilestones = goal.milestones.filter(m => m.completed).length;
          const totalMilestones = goal.milestones.length;
          const progress = getProgress(goal.milestones);
          
          return (
            <Card key={goal._id} className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{goal.title}</span>
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <span>{completedMilestones}/{totalMilestones}</span>
                    <span className="text-gray-400">milestones</span>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>{goal.status}</span>
                  <span className="text-xs">
                    Due: {goal.timeBound ? new Date(goal.timeBound).toLocaleDateString() : 'No deadline'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Progress</p>
                    <span className="text-sm text-purple-300 font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="bg-white/10 h-2" />
                </div>
                
                {/* Goal Description */}
                {goal.specific && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{goal.specific}</p>
                )}
                
                {/* Milestones Section */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-300">Milestones</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {goal.milestones.slice(0, 6).map((milestone, index) => (
                        <div 
                          key={milestone._id || index}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer hover:scale-105 ${
                            milestone.completed 
                              ? 'bg-green-600/20 border border-green-500/30 text-green-300' 
                              : 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                          }`}
                          title={milestone.title}
                          onClick={(e) => handleMilestoneClick(goal._id, index, e)}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                            milestone.completed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-purple-600/50 border border-purple-400'
                          }`}>
                            {milestone.completed ? '✓' : index + 1}
                          </div>
                          <span className="max-w-[60px] sm:max-w-[80px] truncate">
                            #{index + 1}
                          </span>
                        </div>
                      ))}
                      {goal.milestones.length > 6 && (
                        <div className="flex items-center px-2 py-1 rounded-full text-xs bg-white/10 border border-white/20 text-gray-400">
                          +{goal.milestones.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-1.5 sm:gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(goal)} className="bg-white/10 border-white/20 text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Edit</span>
                  <span className="sm:hidden">✏️</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(goal._id)} className="text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <GoalForm
        goal={selectedGoal}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchGoals();
        }}
      />
    </div>
  );
}