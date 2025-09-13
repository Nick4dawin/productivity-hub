'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, Clock, Plus } from 'lucide-react';
import TimelineView from '@/components/timeline-view';
import TimeBlockModal from '@/components/time-block-modal';

type ScheduleType = 'weekday' | 'weekend';

export default function RoutinesPage() {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType>('weekday');
  const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minute: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTimeSlotClick = (hour: number, minute: number) => {
    setSelectedTimeSlot({ hour, minute });
    setIsTimeBlockModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTimeBlockModalOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleTimeBlockCreated = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseModal();
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Daily Schedule
          </h1>
          <p className="text-white/60 mt-2">Plan your perfect day with time blocking</p>
        </div>
        <Button 
          onClick={() => setIsTimeBlockModalOpen(true)}
          className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-white/10 hover:border-white/20 transition-all duration-300"
          size="sm"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Time Block</span>
        </Button>
      </div>

      {/* Schedule Type Selector */}
      <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-8">
        <GlassCard 
          className={`p-4 cursor-pointer transition-all duration-300 flex-1 ${
            selectedSchedule === 'weekday' 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/30' 
              : 'hover:bg-white/5'
          }`}
          onClick={() => setSelectedSchedule('weekday')}
        >
          <div className="flex items-center justify-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div className="text-center">
              <h3 className="font-semibold text-white">Weekday</h3>
              <p className="text-sm text-white/60">Monday - Friday</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard 
          className={`p-4 cursor-pointer transition-all duration-300 flex-1 ${
            selectedSchedule === 'weekend' 
              ? 'bg-gradient-to-r from-green-500/20 to-teal-600/20 border-green-400/30' 
              : 'hover:bg-white/5'
          }`}
          onClick={() => setSelectedSchedule('weekend')}
        >
          <div className="flex items-center justify-center space-x-3">
            <Clock className="w-5 h-5 text-green-400" />
            <div className="text-center">
              <h3 className="font-semibold text-white">Weekend</h3>
              <p className="text-sm text-white/60">Saturday - Sunday</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Timeline View */}
      <GlassCard className="p-3 sm:p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-white/70" />
          <h2 className="text-xl font-semibold text-white">
            {selectedSchedule === 'weekday' ? 'Weekday' : 'Weekend'} Schedule
          </h2>
        </div>
        
        <TimelineView 
          key={refreshKey}
          scheduleType={selectedSchedule}
          onTimeSlotClick={handleTimeSlotClick}
        />
      </GlassCard>

      {/* Time Block Modal */}
      <TimeBlockModal 
        isOpen={isTimeBlockModalOpen}
        onClose={handleCloseModal}
        onTimeBlockCreated={handleTimeBlockCreated}
        selectedTimeSlot={selectedTimeSlot}
        scheduleType={selectedSchedule}
      />
    </div>
  );
}