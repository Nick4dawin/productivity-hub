"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoodSelector } from '@/components/mood-selector';
import { EnergySelector } from '@/components/energy-selector';
import { ActivitySelector } from '@/components/activity-selector';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface JournalEntryProps {
  onSave: (entry: any) => void;
  isLoading?: boolean;
  defaultValues?: any;
}

export function JournalEntry({ onSave, isLoading, defaultValues }: JournalEntryProps) {
  const [content, setContent] = useState(defaultValues?.content || '');
  const [mood, setMood] = useState(defaultValues?.mood || '');
  const [energy, setEnergy] = useState(defaultValues?.energy || '');
  const [activities, setActivities] = useState(defaultValues?.activities || []);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !mood || !energy) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      content,
      mood,
      energy,
      activities,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <div className="space-y-4">
            <MoodSelector value={mood} onChange={setMood} />
            <EnergySelector value={energy} onChange={setEnergy} />
            <ActivitySelector value={activities} onChange={setActivities} />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Entry
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
