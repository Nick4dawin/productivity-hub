"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type EnergyOption = {
  value: string;
  label: string;
  emoji: string;
};

const energyLevels: EnergyOption[] = [
  { value: 'high', label: 'High', emoji: '⚡' },
  { value: 'medium', label: 'Medium', emoji: '✨' },
  { value: 'low', label: 'Low', emoji: '🔋' },
  { value: 'exhausted', label: 'Exhausted', emoji: '😴' },
];

interface EnergySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>What&apos;s your energy level?</Label>
      <div className="flex flex-wrap gap-2">
        {energyLevels.map((energy) => (
          <Card
            key={energy.value}
            className={`flex items-center justify-center p-3 cursor-pointer transition-all bg-white/5 backdrop-blur-md border border-white/10 ${
              value === energy.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onChange(energy.value)}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{energy.emoji}</span>
              <span className="text-sm">{energy.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 