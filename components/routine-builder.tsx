'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createRoutine, updateRoutine, getTodos, getHabits, createTimeBlock, Routine, Todo, Habit } from '@/lib/api';
import { Checkbox } from './ui/checkbox';

const routineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['Morning', 'Evening', 'Custom']),
  tasks: z.array(z.string()).optional(),
  habits: z.array(z.string()).optional(),
  addToTimeline: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  scheduleType: z.enum(['weekday', 'weekend', 'both']).optional(),
});

type RoutineFormData = z.infer<typeof routineSchema>;

interface RoutineBuilderProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoutineBuilder({ routine, isOpen, onClose, onSuccess }: RoutineBuilderProps) {
  const { toast } = useToast();
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: routine?.name || '',
      description: routine?.description || '',
      type: routine?.type || 'Custom',
      tasks: routine?.tasks.map(t => t._id) || [],
      habits: routine?.habits.map(h => h._id) || [],
      addToTimeline: false,
      startTime: '',
      endTime: '',
      scheduleType: 'both',
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
        addToTimeline: false,
        startTime: '',
        endTime: '',
        scheduleType: 'both',
    });
  }, [routine, reset]);

  const onSubmit = async (data: RoutineFormData) => {
    try {
      let createdRoutine;
      if (routine) {
        createdRoutine = await updateRoutine(routine._id, data);
        toast({ title: 'Success', description: 'Routine updated successfully.' });
      } else {
        createdRoutine = await createRoutine(data);
        toast({ title: 'Success', description: 'Routine created successfully.' });
      }
      
      // Create time block if addToTimeline is checked
      if (data.addToTimeline && data.startTime && data.endTime && data.scheduleType) {
        try {
          await createTimeBlock({
            title: data.name,
            description: data.description || `${data.type} routine`,
            startTime: data.startTime,
            endTime: data.endTime,
            scheduleType: data.scheduleType as 'weekday' | 'weekend',
            icon: data.type === 'Morning' ? '🌅' : data.type === 'Evening' ? '🌙' : '⚡',
            color: data.type === 'Morning' ? 'from-yellow-500 to-orange-600' : 
                   data.type === 'Evening' ? 'from-purple-500 to-pink-600' : 
                   'from-blue-500 to-purple-600',
            position: 0
          });
          toast({ title: 'Success', description: 'Routine added to timeline!' });
        } catch (timeBlockError) {
          console.error('Failed to create time block:', timeBlockError);
          toast({
            title: 'Warning',
            description: 'Routine saved but failed to add to timeline.',
            variant: 'destructive',
          });
        }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-md mx-auto w-[95%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed p-6">
        <DialogHeader>
          <DialogTitle>{routine ? 'Edit Routine' : 'Create Routine'}</DialogTitle>
        </DialogHeader>
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

          {/* Timeline Integration */}
          <div className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="font-semibold mb-2">Timeline Integration</h3>
            
            <Controller
              name="addToTimeline"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addToTimeline"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                  <label htmlFor="addToTimeline" className="text-sm font-medium">
                    Add to Timeline
                  </label>
                </div>
              )}
            />
            
            {watch('addToTimeline') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="time"
                        {...field}
                        className="bg-white/10 border-white/20"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="time"
                        {...field}
                        className="bg-white/10 border-white/20"
                      />
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Schedule</label>
                  <Controller
                    name="scheduleType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white/10 border-white/20">
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekday">Weekdays Only</SelectItem>
                          <SelectItem value="weekend">Weekends Only</SelectItem>
                          <SelectItem value="both">Every Day</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-white/10 border-white/20">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} variant="gradient">
              {isSubmitting ? 'Saving...' : 'Save Routine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}