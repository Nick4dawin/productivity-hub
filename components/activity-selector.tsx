"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

type ActivityOption = {
  id: string;
  label: string;
};

const defaultActivities: ActivityOption[] = [
  { id: '1', label: 'Work' },
  { id: '2', label: 'Exercise' },
  { id: '3', label: 'Reading' },
  { id: '4', label: 'Meditation' },
  { id: '5', label: 'Social' },
  { id: '6', label: 'Hobbies' },
];

interface ActivitySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ActivitySelector({ value, onChange }: ActivitySelectorProps) {
  const [activities, setActivities] = useState<ActivityOption[]>(defaultActivities);
  const [newActivity, setNewActivity] = useState('');

  const handleToggle = (activityId: string) => {
    if (value.includes(activityId)) {
      onChange(value.filter(id => id !== activityId));
    } else {
      onChange([...value, activityId]);
    }
  };

  const handleAddActivity = () => {
    if (newActivity.trim() !== '') {
      const newId = String(activities.length + 1);
      const newActivityOption = { id: newId, label: newActivity.trim() };
      setActivities([...activities, newActivityOption]);
      onChange([...value, newId]);
      setNewActivity('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>What activities did you do today?</Label>
      <div className="flex flex-wrap gap-2">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className={`flex items-center gap-2 p-2 cursor-pointer transition-all bg-white/5 backdrop-blur-md border border-white/10 ${
              value.includes(activity.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleToggle(activity.id)}
          >
            <Checkbox 
              checked={value.includes(activity.id)} 
              onCheckedChange={() => handleToggle(activity.id)}
            />
            <span>{activity.label}</span>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input 
          placeholder="Add custom activity..." 
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          className="bg-white/5 backdrop-blur-md border-white/10"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={handleAddActivity}
          className="bg-white/5 backdrop-blur-md border-white/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 