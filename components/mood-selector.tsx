"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type MoodOption = {
  value: string;
  label: string;
  emoji: string;
};

const moods: MoodOption[] = [
  { value: '😊', label: 'Happy', emoji: '😊' },
  { value: '😌', label: 'Calm', emoji: '😌' },
  { value: '😐', label: 'Neutral', emoji: '😐' },
  { value: '😢', label: 'Sad', emoji: '😢' },
  { value: '😤', label: 'Angry', emoji: '😤' },
  { value: '😴', label: 'Tired', emoji: '😴' },
];

interface MoodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>How are you feeling today?</Label>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Card
            key={mood.value}
            className={`flex items-center justify-center p-3 cursor-pointer transition-all bg-white/5 backdrop-blur-md border border-white/10 ${
              value === mood.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onChange(mood.value)}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-sm">{mood.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 