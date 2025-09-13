'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createGoal, updateGoal, getMilestoneSuggestions, Goal } from '@/lib/api';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Plus, Sparkles, X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

const milestoneSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1, 'Milestone title is required'),
    completed: z.boolean().optional(),
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
    completed: m.completed ?? false,
    _id: m._id,
  })),
});

interface GoalFormProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QUESTIONNAIRE_STEPS = [
  { id: 'title', title: 'Goal Title', question: 'What do you want to achieve?', placeholder: 'Enter your goal title...' },
  { id: 'specific', title: 'Specific', question: 'What exactly do you want to accomplish?', placeholder: 'Be specific about what you want to achieve...' },
  { id: 'measurable', title: 'Measurable', question: 'How will you measure progress and success?', placeholder: 'Define metrics, numbers, or milestones...' },
  { id: 'achievable', title: 'Achievable', question: 'Is this goal realistic and attainable?', placeholder: 'Explain why this goal is achievable...' },
  { id: 'relevant', title: 'Relevant', question: 'Why is this goal important to you?', placeholder: 'Describe how this aligns with your priorities...' },
  { id: 'timeBound', title: 'Time-bound', question: 'When do you want to achieve this goal?', placeholder: 'Set a deadline...' },
  { id: 'milestones', title: 'Milestones', question: 'Let\'s break this down into smaller steps', placeholder: '' },
];

export default function GoalForm({ goal, isOpen, onClose, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<{index: number, milestone: any} | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: getDefaultValues(goal),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "milestones",
  });

  const watchedValues = watch();
  const currentStepData = QUESTIONNAIRE_STEPS[currentStep];
  
  // Reset to first step when opening for new goal
  useEffect(() => {
    if (isOpen && !goal) {
      setCurrentStep(0);
      setSuggestions([]);
    } else if (isOpen && goal) {
      // For editing, skip to milestones step
      setCurrentStep(QUESTIONNAIRE_STEPS.length - 1);
    }
  }, [isOpen, goal]);

  const handleNext = async () => {
    const currentField = currentStepData.id as keyof GoalFormData;
    
    // Validate current step
    const isValid = await trigger(currentField);
    if (!isValid && currentField !== 'timeBound') return;
    
    if (currentStep === QUESTIONNAIRE_STEPS.length - 2) {
      // Before milestones step, generate suggestions
      await generateMilestones();
    }
    
    setCurrentStep(prev => Math.min(prev + 1, QUESTIONNAIRE_STEPS.length - 1));
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const generateMilestones = async () => {
    const { title, specific } = watchedValues;
    if (!title) return;
    
    setIsGeneratingMilestones(true);
    try {
      const data = await getMilestoneSuggestions(title, specific);
      setSuggestions(data.suggestions);
      // Auto-add first few suggestions as milestones
      const autoMilestones = data.suggestions.slice(0, 5).map(title => ({ title, completed: false }));
      replace(autoMilestones);
    } catch (error) {
      console.error('Failed to generate milestones:', error);
      toast({ title: 'Failed to generate milestones', variant: 'destructive' });
    } finally {
      setIsGeneratingMilestones(false);
    }
  };
  
  const handleSuggestionToggle = (suggestion: string, checked: boolean) => {
    if (checked) {
      append({ title: suggestion, completed: false });
    } else {
      const indexToRemove = fields.findIndex(field => field.title === suggestion);
      if (indexToRemove > -1) {
        remove(indexToRemove);
      }
    }
  };

  const onSubmit = async (data: GoalFormData) => {
    try {
      const apiData = { 
        ...data,
        timeBound: data.timeBound?.toISOString(),
        milestones: data.milestones.map(m => ({ ...m, completed: m.completed ?? false }))
      };
      if (goal) {
        await updateGoal(goal._id, apiData);
        toast({ title: 'Goal updated' });
      } else {
        await createGoal(apiData);
        toast({ title: 'Goal created' });
      }
      onSuccess();
    } catch (e) {
        const error = e as Error;
        console.error("Error saving goal:", error);
        toast({ title: 'Error saving goal', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    }
  };

  const renderStepContent = () => {
    const stepId = currentStepData.id;
    
    if (stepId === 'timeBound') {
      return (
        <div className="space-y-4">
          <Controller
            name="timeBound"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/5 border-white/10 h-12",
                      !field.value && "text-muted-foreground"
                    )}
                  >
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
                <SelectTrigger className="bg-white/5 border-white/10 h-12">
                  <SelectValue placeholder="Goal Status" />
                </SelectTrigger>
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
      );
    }
    
    if (stepId === 'milestones') {
      return (
        <div className="space-y-4">
          {isGeneratingMilestones ? (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-4 animate-spin text-purple-400" />
              <p className="text-lg">Generating your milestones...</p>
              <p className="text-sm text-gray-400">This may take a moment</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white/5 border-white/10">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
                      {index + 1}
                    </div>
                    <Controller 
                      name={`milestones.${index}.completed`} 
                      control={control} 
                      render={({ field }) => (
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="border-white/20" 
                        />
                      )} 
                    />
                    <Input 
                      {...register(`milestones.${index}.title`)} 
                      placeholder="Milestone description" 
                      className="flex-grow bg-white/5 border-white/10 placeholder:text-gray-400 cursor-pointer" 
                      onClick={() => setEditingMilestone({index, milestone: item})}
                      readOnly
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ title: '', completed: false })} 
                  className="bg-white/10 border-white/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={generateMilestones} 
                  disabled={isGeneratingMilestones} 
                  className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="font-semibold text-purple-300">Additional Suggestions ✨</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestions.filter(s => !fields.some(f => f.title === s)).map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <Checkbox 
                          id={`suggestion-${index}`}
                          onCheckedChange={(checked) => handleSuggestionToggle(suggestion, !!checked)}
                          className="border-white/20"
                        />
                        <label htmlFor={`suggestion-${index}`} className="text-sm cursor-pointer flex-grow">
                          {suggestion}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    
    // Default text input for other steps
    if (stepId === 'title') {
      return (
        <Input 
          {...register(stepId)} 
          placeholder={currentStepData.placeholder} 
          className="bg-white/5 border-white/10 placeholder:text-gray-400 h-12 text-lg" 
        />
      );
    }
    
    return (
      <Textarea 
        {...register(stepId)} 
        placeholder={currentStepData.placeholder} 
        className="bg-white/5 border-white/10 placeholder:text-gray-400 min-h-[120px] resize-none" 
        rows={4}
      />
    );
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-2xl mx-auto w-[95%] sm:w-[90%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl">
              <span className="hidden sm:inline">{goal ? 'Edit SMART Goal' : 'Create SMART Goal'}</span>
              <span className="sm:hidden">{goal ? 'Edit Goal' : '+ Goal'}</span>
            </DialogTitle>
            <div className="text-sm text-gray-400">
              {currentStep + 1} of {QUESTIONNAIRE_STEPS.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between text-xs">
            {QUESTIONNAIRE_STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col items-center space-y-1 transition-colors",
                  index <= currentStep ? "text-purple-300" : "text-gray-500"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  index < currentStep ? "bg-purple-600 text-white" : 
                  index === currentStep ? "bg-purple-600/50 border-2 border-purple-400" :
                  "bg-white/10 border border-white/20"
                )}>
                  {index < currentStep ? <CheckCircle className="w-3 h-3" /> : index + 1}
                </div>
                <span className="hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-purple-300">
                {currentStepData.title}
              </h3>
              <p className="text-gray-300">
                {currentStepData.question}
              </p>
            </div>
            
            {renderStepContent()}
            
            {errors[currentStepData.id as keyof typeof errors] && (
              <p className="text-red-400 text-sm text-center">
                {errors[currentStepData.id as keyof typeof errors]?.message}
              </p>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="bg-white/10 border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="bg-white/10 border-white/20"
              >
                Cancel
              </Button>
              
              {currentStep < QUESTIONNAIRE_STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  variant="gradient"
                  disabled={isGeneratingMilestones}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="gradient" 
                  disabled={isSubmitting || isGeneratingMilestones}
                >
                  {isSubmitting ? 'Saving...' : 'Save Goal'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Milestone Edit Modal */}
    {editingMilestone && (
      <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
        <DialogContent className="bg-white/5 border-white/10 backdrop-blur-md text-white max-w-md mx-auto w-[95%] sm:w-[90%]">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Controller 
                name={`milestones.${editingMilestone.index}.completed`} 
                control={control} 
                render={({ field }) => (
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="border-white/20" 
                  />
                )} 
              />
              <span className="text-sm text-gray-300">Mark as completed</span>
            </div>
            <Input 
              {...register(`milestones.${editingMilestone.index}.title`)} 
              placeholder="Milestone description" 
              className="bg-white/5 border-white/10 placeholder:text-gray-400" 
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditingMilestone(null)}
              className="bg-white/10 border-white/20"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="gradient" 
              onClick={() => {
                setEditingMilestone(null);
                toast({ title: 'Milestone updated', description: 'Your milestone has been updated successfully.' });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}