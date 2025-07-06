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
  
  const getProgress = (milestones: Goal['milestones'] = []) => {
      if(milestones.length === 0) return 0;
      const completed = milestones.filter(m => m.completed).length;
      return (completed / milestones.length) * 100;
  }

  if (loading) return <div>Loading your goals...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SMART Goals</h1>
        <Button onClick={handleOpenForm} variant="gradient">Create New Goal</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id} className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>{goal.title}</CardTitle>
              <CardDescription>{goal.status} - Due: {goal.timeBound ? new Date(goal.timeBound).toLocaleDateString() : 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">Progress</p>
                    <Progress value={getProgress(goal.milestones)} className="bg-white/10" />
                </div>
              <p className="text-sm text-muted-foreground">{goal.specific}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(goal)} className="bg-white/10 border-white/20">Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(goal._id)}>Delete</Button>
            </CardFooter>
          </Card>
        ))}
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