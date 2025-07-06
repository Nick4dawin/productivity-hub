'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { createRoutine, updateRoutine, getTodos, getHabits, Routine, Todo, Habit } from '@/lib/api';
import { Checkbox } from './ui/checkbox';

const routineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['Morning', 'Evening', 'Custom']),
  tasks: z.array(z.string()).optional(),
  habits: z.array(z.string()).optional(),
});

type RoutineFormData = z.infer<typeof routineSchema>;

interface RoutineBuilderProps {
  routine: Routine | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoutineBuilder({ routine, onClose, onSuccess }: RoutineBuilderProps) {
  const { toast } = useToast();
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: routine?.name || '',
      description: routine?.description || '',
      type: routine?.type || 'Custom',
      tasks: routine?.tasks.map(t => t._id) || [],
      habits: routine?.habits.map(h => h._id) || [],
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [todosData, habitsData] = await Promise.all([getTodos(), getHabits()]);
        setAllTodos(todosData);
        setAllHabits(habitsData);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch tasks and habits.',
          variant: 'destructive',
        });
      }
    }
    fetchData();
  }, [toast]);
  
  useEffect(() => {
    reset({
        name: routine?.name || '',
        description: routine?.description || '',
        type: routine?.type || 'Custom',
        tasks: routine?.tasks.map(t => t._id) || [],
        habits: routine?.habits.map(h => h._id) || [],
    });
  }, [routine, reset]);

  const onSubmit = async (data: RoutineFormData) => {
    try {
      if (routine) {
        await updateRoutine(routine._id, data);
        toast({ title: 'Success', description: 'Routine updated successfully.' });
      } else {
        await createRoutine(data);
        toast({ title: 'Success', description: 'Routine created successfully.' });
      }
      onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save routine.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="relative w-full max-w-lg my-4">
        <Card className="w-full bg-black/80 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{routine ? 'Edit Routine' : 'Create Routine'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="name"
                control={control}
                render={({ field }: { field: ControllerRenderProps<RoutineFormData, "name"> }) => <Input placeholder="Routine Name (e.g., Morning Power-up)" {...field} className="bg-white/5 border-white/10 placeholder:text-gray-400" />}
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              
              <Controller
                name="description"
                control={control}
                render={({ field }: { field: ControllerRenderProps<RoutineFormData, "description"> }) => <Textarea placeholder="A brief description of your routine" {...field} className="bg-white/5 border-white/10 placeholder:text-gray-400" />}
              />

              <Controller
                  name="type"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<RoutineFormData, "type"> }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select routine type" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 border-white/10 text-white">
                              <SelectItem value="Morning">Morning</SelectItem>
                              <SelectItem value="Evening">Evening</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />

              <div>
                <h3 className="font-semibold mb-2">Tasks</h3>
                <Controller
                  name="tasks"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<RoutineFormData, "tasks"> }) => (
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-white/5 border-white/10">
                      {allTodos.map(task => (
                        <div key={task._id} className="flex items-center space-x-2">
                           <Checkbox
                              id={`task-${task._id}`}
                              checked={field.value?.includes(task._id)}
                              onCheckedChange={(checked) => {
                                  const newValue = checked
                                      ? [...(field.value || []), task._id]
                                      : (field.value || []).filter(id => id !== task._id);
                                  field.onChange(newValue);
                              }}
                            />
                          <label htmlFor={`task-${task._id}`}>{task.title}</label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Habits</h3>
                <Controller
                  name="habits"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<RoutineFormData, "habits"> }) => (
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-white/5 border-white/10">
                      {allHabits.map(habit => (
                        <div key={habit._id} className="flex items-center space-x-2">
                          <Checkbox
                              id={`habit-${habit._id}`}
                              checked={field.value?.includes(habit._id)}
                              onCheckedChange={(checked) => {
                                  const newValue = checked
                                      ? [...(field.value || []), habit._id]
                                      : (field.value || []).filter(id => id !== habit._id);
                                  field.onChange(newValue);
                              }}
                            />
                          <label htmlFor={`habit-${habit._id}`}>{habit.name}</label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="bg-white/10 border-white/20">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} variant="gradient">
                  {isSubmitting ? 'Saving...' : 'Save Routine'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 