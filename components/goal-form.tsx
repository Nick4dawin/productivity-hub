'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createGoal, updateGoal, Goal } from '@/lib/api';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const milestoneSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1, 'Milestone title is required'),
    completed: z.boolean().default(false),
});

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  specific: z.string().optional(),
  measurable: z.string().optional(),
  achievable: z.string().optional(),
  relevant: z.string().optional(),
  timeBound: z.date().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold']),
  milestones: z.array(milestoneSchema),
});

type GoalFormData = z.infer<typeof goalSchema>;

const getDefaultValues = (goal: Goal | null): GoalFormData => ({
  title: goal?.title || '',
  specific: goal?.specific || '',
  measurable: goal?.measurable || '',
  achievable: goal?.achievable || '',
  relevant: goal?.relevant || '',
  timeBound: goal?.timeBound ? new Date(goal.timeBound) : undefined,
  status: goal?.status ?? 'Not Started',
  milestones: (goal?.milestones ?? []).map(m => ({
    title: m.title,
    completed: m.completed === undefined ? false : m.completed,
    _id: m._id,
  })),
});

interface GoalFormProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalForm({ goal, isOpen, onClose, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: getDefaultValues(goal),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      const apiData = { ...data, timeBound: data.timeBound?.toISOString() };
      if (goal) {
        await updateGoal(goal._id, apiData);
        toast({ title: 'Goal updated' });
      } else {
        await createGoal(apiData);
        toast({ title: 'Goal created' });
      }
      onSuccess();
    } catch (error) {
        console.error("Error saving goal:", error);
        toast({ title: 'Error saving goal', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit SMART Goal' : 'Create SMART Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('title')} placeholder="Goal Title" className="bg-white/5 border-white/10 placeholder:text-gray-400" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

          <Textarea {...register('specific')} placeholder="Specific" className="bg-white/5 border-white/10 placeholder:text-gray-400" />
          <Textarea {...register('measurable')} placeholder="Measurable" className="bg-white/5 border-white/10 placeholder:text-gray-400" />
          <Textarea {...register('achievable')} placeholder="Achievable" className="bg-white/5 border-white/10 placeholder:text-gray-400" />
          <Textarea {...register('relevant')} placeholder="Relevant" className="bg-white/5 border-white/10 placeholder:text-gray-400" />
          
          <div className="flex gap-4">
            <Controller
              name="timeBound"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal bg-white/5 border-white/10", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/80 border-white/10 text-white" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent className="bg-black/80 border-white/10 text-white">
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Milestones</h3>
            <div className="space-y-2">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-white/5 border-white/10">
                  <Controller name={`milestones.${index}.completed`} control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                  <Input {...register(`milestones.${index}.title`)} placeholder="Milestone description" className="flex-grow bg-white/5 border-white/10 placeholder:text-gray-400" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', completed: false })} className="mt-2 bg-white/10 border-white/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-white/10 border-white/20">Cancel</Button>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 