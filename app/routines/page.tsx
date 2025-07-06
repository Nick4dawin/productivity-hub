'use client';

import { useEffect, useState } from 'react';
import { Routine, getRoutines, deleteRoutine } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import RoutineBuilder from '@/components/routine-builder'; // This component will be created next

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const { toast } = useToast();

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const data = await getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Failed to fetch routines:", error);
      setError('Failed to fetch routines.');
      toast({
        title: 'Error',
        description: 'Could not fetch routines. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleEdit = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsBuilderOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoutine(id);
      toast({
        title: 'Success',
        description: 'Routine deleted successfully.',
      });
      fetchRoutines(); // Refresh list
    } catch (error) {
      console.error("Failed to delete routine:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete routine.',
        variant: 'destructive',
      });
    }
  };
  
  const handleOpenBuilder = () => {
    setSelectedRoutine(null);
    setIsBuilderOpen(true);
  }

  if (loading) return <div>Loading routines...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Routines</h1>
        <Button onClick={handleOpenBuilder} variant="gradient">Create Routine</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Card key={routine._id} className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {routine.name}
                <span className="text-sm font-normal px-2 py-1 rounded-full bg-white/10 text-white">
                  {routine.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{routine.description}</p>
              <div className="mb-4">
                <h4 className="font-semibold">Tasks:</h4>
                <ul className="list-disc list-inside">
                  {routine.tasks.map(task => <li key={task._id}>{task.title}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Habits:</h4>
                <ul className="list-disc list-inside">
                    {routine.habits.map(habit => <li key={habit._id}>{habit.name}</li>)}
                </ul>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(routine)} className="bg-white/10 border-white/20">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(routine._id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isBuilderOpen && (
        <RoutineBuilder
          routine={selectedRoutine}
          onClose={() => setIsBuilderOpen(false)}
          onSuccess={() => {
            setIsBuilderOpen(false);
            fetchRoutines();
          }}
        />
      )}
    </div>
  );
} 