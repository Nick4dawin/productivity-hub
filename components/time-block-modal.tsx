'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createTimeBlock } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GlassCard } from '@/components/ui/glass-card';

const timeBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().min(1, 'Please select a color'),
});

type TimeBlockFormData = z.infer<typeof timeBlockSchema>;

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeBlockCreated?: () => void;
  selectedTimeSlot: { hour: number; minute: number } | null;
  scheduleType: 'weekday' | 'weekend';
}

const ACTIVITY_ICONS = [
  { icon: '💻', label: 'Work' },
  { icon: '🏃‍♂️', label: 'Exercise' },
  { icon: '🍽️', label: 'Meal' },
  { icon: '📚', label: 'Study' },
  { icon: '🧘‍♀️', label: 'Meditation' },
  { icon: '👨‍👩‍👧‍👦', label: 'Family' },
  { icon: '🎵', label: 'Music' },
  { icon: '🎨', label: 'Creative' },
  { icon: '🛒', label: 'Shopping' },
  { icon: '🚗', label: 'Travel' },
  { icon: '📞', label: 'Calls' },
  { icon: '🧹', label: 'Cleaning' },
  { icon: '😴', label: 'Rest' },
  { icon: '🎮', label: 'Gaming' },
  { icon: '📺', label: 'Entertainment' },
  { icon: '🌱', label: 'Gardening' },
  { icon: '🐕', label: 'Pet Care' },
  { icon: '💡', label: 'Planning' },
  { icon: '📖', label: 'Reading' },
  { icon: '✍️', label: 'Writing' },
];

const COLOR_OPTIONS = [
  { value: 'from-blue-500 to-purple-600', label: 'Blue Purple', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
  { value: 'from-green-500 to-teal-600', label: 'Green Teal', preview: 'bg-gradient-to-r from-green-500 to-teal-600' },
  { value: 'from-orange-500 to-red-600', label: 'Orange Red', preview: 'bg-gradient-to-r from-orange-500 to-red-600' },
  { value: 'from-purple-500 to-pink-600', label: 'Purple Pink', preview: 'bg-gradient-to-r from-purple-500 to-pink-600' },
  { value: 'from-yellow-500 to-orange-600', label: 'Yellow Orange', preview: 'bg-gradient-to-r from-yellow-500 to-orange-600' },
  { value: 'from-indigo-500 to-blue-600', label: 'Indigo Blue', preview: 'bg-gradient-to-r from-indigo-500 to-blue-600' },
  { value: 'from-pink-500 to-rose-600', label: 'Pink Rose', preview: 'bg-gradient-to-r from-pink-500 to-rose-600' },
  { value: 'from-teal-500 to-cyan-600', label: 'Teal Cyan', preview: 'bg-gradient-to-r from-teal-500 to-cyan-600' },
];

export default function TimeBlockModal({ isOpen, onClose, onTimeBlockCreated, selectedTimeSlot, scheduleType }: TimeBlockModalProps) {
  const { toast } = useToast();
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TimeBlockFormData>({
    resolver: zodResolver(timeBlockSchema),
  });

  // Auto-populate times when selectedTimeSlot changes
  useEffect(() => {
    if (selectedTimeSlot) {
      const startTime = `${selectedTimeSlot.hour.toString().padStart(2, '0')}:${selectedTimeSlot.minute.toString().padStart(2, '0')}`;
      const endHour = selectedTimeSlot.hour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${selectedTimeSlot.minute.toString().padStart(2, '0')}`;
      
      setValue('startTime', startTime);
      setValue('endTime', endTime);
    }
  }, [selectedTimeSlot, setValue]);

  const onSubmit = async (data: TimeBlockFormData) => {
    try {
      // Convert color format to match backend expectations
      const backendColor = selectedColor.replace('/20', '').replace('from-', 'from-').replace(' to-', ' to-');
      
      const timeBlockData = {
        title: data.title,
        description: data.description || '',
        startTime: data.startTime,
        endTime: data.endTime,
        icon: selectedIcon,
        color: backendColor,
        scheduleType: scheduleType,
        position: 0
      };
      
      await createTimeBlock(timeBlockData);
      
      toast({
        title: "Success",
        description: "Time block created successfully!",
      });
      
      if (onTimeBlockCreated) {
        onTimeBlockCreated();
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Error creating time block:', error);
      toast({
        title: 'Error',
        description: 'Failed to create time block. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    setSelectedIcon('');
    setSelectedColor('');
    onClose();
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setValue('icon', icon);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-black/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Create Time Block
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/90">Activity Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Morning Workout"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-white/90">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.startTime && (
                <p className="text-red-400 text-sm">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-white/90">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.endTime && (
                <p className="text-red-400 text-sm">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/90">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Add any additional details..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50 resize-none"
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label className="text-white/90">Choose an Icon</Label>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2 max-h-32 overflow-y-auto">
              {ACTIVITY_ICONS.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => handleIconSelect(item.icon)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    selectedIcon === item.icon
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                  title={item.label}
                >
                  <span className="text-xl">{item.icon}</span>
                </button>
              ))}
            </div>
            {errors.icon && (
              <p className="text-red-400 text-sm">{errors.icon.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-white/90">Choose a Color</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor === color.value
                      ? 'border-white/50 scale-105'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${color.preview}`} />
                  <p className="text-xs text-white/70 mt-1">{color.label}</p>
                </button>
              ))}
            </div>
            {errors.color && (
              <p className="text-red-400 text-sm">{errors.color.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-400/30 text-black hover:from-blue-500/30 hover:to-purple-600/30"
            >
              {isSubmitting ? 'Creating...' : 'Create Time Block'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}