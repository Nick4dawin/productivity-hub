'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Clock, Plus, X, GripVertical, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getTimeBlocks, 
  createTimeBlock, 
  updateTimeBlock, 
  deleteTimeBlock, 
  updateTimeBlockPosition,
  getAISuggestions,
  TimeBlock as APITimeBlock 
} from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface TimeBlock {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  icon: string;
  color: string;
  description?: string;
  scheduleType: 'weekday' | 'weekend' | 'both';
  position?: number;
}

interface TimelineViewProps {
  scheduleType: 'weekday' | 'weekend';
  onTimeSlotClick: (hour: number, minute: number) => void;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  draggedBlockId: string | null;
  startY: number;
  startTime: string;
  endTime: string;
}

export default function TimelineView({ scheduleType, onTimeSlotClick }: TimelineViewProps) {
  const { user } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    draggedBlockId: null,
    startY: 0,
    startTime: '',
    endTime: ''
  });
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate time slots from 12 AM to 11:59 PM (24 hours)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push({
        hour,
        time: formatTime(hour, 0),
        fullHour: true
      });
      // Add 30-minute intervals
      slots.push({
        hour,
        minute: 30,
        time: formatTime(hour, 30),
        fullHour: false
      });
    }
    return slots;
  };

  const formatTime = (hour: number, minute: number = 0) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const timeSlots = generateTimeSlots();

  // Helper function to parse time strings consistently
  const parseTimeString = (timeStr: string): { hour: number; minute: number } => {
    let time = timeStr;
    
    // If the time includes timezone info or is a full datetime, extract just the time
    if (time.includes('T')) {
      const date = new Date(time);
      time = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    const [hour, minute] = time.split(':').map(Number);
    return { hour, minute };
  };

  // Load time blocks from backend
  useEffect(() => {
    const loadTimeBlocks = async () => {
      if (!user) return;
      
      try {
        setLoadingTimeBlocks(true);
        const blocks = await getTimeBlocks(scheduleType);
        setTimeBlocks(blocks);
      } catch (error) {
        console.error('Failed to load time blocks:', error);
      } finally {
        setLoadingTimeBlocks(false);
      }
    };

    loadTimeBlocks();
  }, [user, scheduleType]);

  const getTimeBlockForSlot = (hour: number, minute: number = 0) => {
    return timeBlocks.find(block => {
      const { hour: startHour, minute: startMinute } = parseTimeString(block.startTime);
      const { hour: endHour, minute: endMinute } = parseTimeString(block.endTime);
      
      const currentMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };

  const getTimeBlockStartingAtSlot = (hour: number, minute: number = 0) => {
    return timeBlocks.find(block => {
      const { hour: startHour, minute: startMinute } = parseTimeString(block.startTime);
      return startHour === hour && startMinute === minute;
    });
  };

  const calculateBlockHeight = (block: TimeBlock) => {
    const { hour: startHour, minute: startMinute } = parseTimeString(block.startTime);
    const { hour: endHour, minute: endMinute } = parseTimeString(block.endTime);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    
    // Each 30-minute slot is 2.5rem (40px), so calculate height based on duration
    const slots = durationMinutes / 30;
    return `${slots * 2.5}rem`;
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteTimeBlock(blockId);
      setTimeBlocks(prev => prev.filter(block => block._id !== blockId));
    } catch (error) {
      console.error('Failed to delete time block:', error);
    }
  };

  const handleDragStart = (e: React.MouseEvent, blockId: string, isResize: boolean = false) => {
    e.preventDefault();
    const block = timeBlocks.find(b => b._id === blockId);
    if (!block) return;

    setDragState({
      isDragging: !isResize,
      isResizing: isResize,
      draggedBlockId: blockId,
      startY: e.clientY,
      startTime: block.startTime,
      endTime: block.endTime
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return;
    
    const deltaY = e.clientY - dragState.startY;
    const timeSlotHeight = 32; // Height of each 30-minute slot
    const slotsChanged = Math.round(deltaY / timeSlotHeight);
    
    if (slotsChanged === 0) return;

    const block = timeBlocks.find(b => b._id === dragState.draggedBlockId);
    if (!block) return;

    const { hour: startHour, minute: startMinute } = parseTimeString(dragState.startTime);
    const { hour: endHour, minute: endMinute } = parseTimeString(dragState.endTime);
    
    let newStartMinutes = startHour * 60 + startMinute;
    let newEndMinutes = endHour * 60 + endMinute;
    
    if (dragState.isDragging) {
      // Move the entire block
      newStartMinutes += slotsChanged * 30;
      newEndMinutes += slotsChanged * 30;
    } else if (dragState.isResizing) {
      // Resize the block (change end time)
      newEndMinutes += slotsChanged * 30;
    }
    
    // Ensure times are within bounds (12 AM to 11:59 PM)
    newStartMinutes = Math.max(0, Math.min(newStartMinutes, 23 * 60 + 30));
    newEndMinutes = Math.max(newStartMinutes + 30, Math.min(newEndMinutes, 24 * 60));
    
    const newStartTime = `${Math.floor(newStartMinutes / 60)}:${(newStartMinutes % 60).toString().padStart(2, '0')}`;
    const newEndTime = `${Math.floor(newEndMinutes / 60)}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;
    
    setTimeBlocks(prev => prev.map(b => 
      b._id === dragState.draggedBlockId 
        ? { ...b, startTime: newStartTime, endTime: newEndTime }
        : b
    ));
  };

  const handleMouseUp = async () => {
    if (dragState.draggedBlockId && (dragState.isDragging || dragState.isResizing)) {
      const block = timeBlocks.find(b => b._id === dragState.draggedBlockId);
      if (block) {
        try {
          // Update the time block in the backend
          await updateTimeBlock(block._id, {
            title: block.title,
            startTime: block.startTime,
            endTime: block.endTime,
            description: block.description,
            category: 'general',
            color: block.color,
            scheduleType: block.scheduleType
          });
        } catch (error) {
          console.error('Failed to update time block:', error);
        }
      }
    }
    
    setDragState({
      isDragging: false,
      isResizing: false,
      draggedBlockId: null,
      startY: 0,
      startTime: '',
      endTime: ''
    });
  };

  const getAISuggestion = async (startHour: number, endHour: number) => {
    // Mock AI suggestion - in real app, this would call your AI API
    const suggestions = [
      'Take a 15-minute break',
      'Review your goals',
      'Do some stretching',
      'Hydrate and have a healthy snack',
      'Quick meditation session',
      'Organize your workspace',
      'Check and respond to messages'
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const [aiSuggestions, setAiSuggestions] = useState<{[key: string]: string}>({});

  const handleAISuggestionClick = async (hour: number) => {
    const suggestionKey = `${hour}-${scheduleType}`;
    if (aiSuggestions[suggestionKey]) {
      // Toggle suggestion visibility
      setAiSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[suggestionKey];
        return newSuggestions;
      });
    } else {
      const suggestion = await getAISuggestion(hour, hour + 1);
      setAiSuggestions(prev => ({
        ...prev,
        [suggestionKey]: suggestion
      }));
    }
  };

  const handleGetAISuggestions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const suggestions = await getAISuggestions(scheduleType, timeBlocks);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: TimeBlock) => {
    try {
      const newBlock = await createTimeBlock({
        title: suggestion.title,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
        description: suggestion.description,
        category: 'general',
        color: suggestion.color,
        scheduleType,
        position: 0
      });
      
      setTimeBlocks(prev => [...prev, newBlock]);
      setAiSuggestions(prev => prev.filter(s => s._id !== suggestion._id));
    } catch (error) {
      console.error('Failed to create time block from suggestion:', error);
    }
  };

  if (loadingTimeBlocks) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        <span className="ml-2 text-white/70">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div 
      ref={timelineRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Timeline */}
      <div className="space-y-1">
        {timeSlots.map((slot, index) => {
          const timeBlockStartingHere = getTimeBlockStartingAtSlot(slot.hour, slot.minute || 0);
          const timeBlockSpanningHere = getTimeBlockForSlot(slot.hour, slot.minute || 0);
          const isFullHour = slot.fullHour;
          const suggestionKey = `${slot.hour}-${scheduleType}`;
          const hasAISuggestion = aiSuggestions[suggestionKey];
          
          // Skip rendering if there's a block spanning this slot but not starting here
          if (timeBlockSpanningHere && !timeBlockStartingHere) {
            return null;
          }
          
          return (
            <div key={index} className="flex items-center group" style={{ minHeight: timeBlockStartingHere ? calculateBlockHeight(timeBlockStartingHere) : '2.5rem' }}>
              {/* Time Label */}
              <div className="w-20 text-right pr-4 flex-shrink-0">
                {isFullHour && (
                  <span className="text-sm font-medium text-white/70">
                    {slot.time}
                  </span>
                )}
              </div>
              
              {/* Timeline Line */}
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-white/30 relative z-10" />
                
                {/* Connection line - always show unless it's the last item */}
                {index < timeSlots.length - 1 && (
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-white/20 to-white/10" 
                       style={{ height: timeBlockStartingHere ? calculateBlockHeight(timeBlockStartingHere) : '2rem' }} />
                )}
              </div>
              
              {/* Content Area */}
              <div className="flex-1 ml-4 min-h-[2rem] flex items-center">
                {timeBlockStartingHere ? (
                  <GlassCard className={`p-3 w-full bg-gradient-to-r ${timeBlockStartingHere.color} border-white/20 hover:border-white/30 transition-all duration-300 ${dragState.draggedBlockId === timeBlockStartingHere._id ? 'opacity-70' : ''}`} style={{ height: calculateBlockHeight(timeBlockStartingHere) }}>
                    <div className="flex items-center space-x-3 h-full">
                      <div 
                        className="cursor-move"
                        onMouseDown={(e) => handleDragStart(e, timeBlockStartingHere._id, false)}
                      >
                        <GripVertical className="w-4 h-4 text-white/50" />
                      </div>
                      <span className="text-2xl">{timeBlockStartingHere.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{timeBlockStartingHere.title}</h4>
                        <p className="text-sm text-white/70">
                          {timeBlockStartingHere.startTime} - {timeBlockStartingHere.endTime}
                        </p>
                        {timeBlockStartingHere.description && (
                          <p className="text-xs text-white/60 mt-1">{timeBlockStartingHere.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div 
                          className="cursor-ns-resize w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded"
                          onMouseDown={(e) => handleDragStart(e, timeBlockStartingHere._id, true)}
                        >
                          <div className="w-2 h-0.5 bg-white/50"></div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 hover:bg-red-500/20"
                          onClick={() => handleDeleteBlock(timeBlockStartingHere._id)}
                        >
                          <X className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ) : (
                  <div className="w-full flex items-center">
                    <button
                      onClick={() => onTimeSlotClick(slot.hour, slot.minute || 0)}
                      className="flex-1 h-8 rounded-lg border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-white/50" />
                    </button>
                    
                    {/* AI Suggestion Bulb - only show for full hours */}
                    {isFullHour && (
                      <div className="relative ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 hover:bg-yellow-500/20"
                          onClick={() => handleAISuggestionClick(slot.hour)}
                        >
                          <Lightbulb className="h-3 w-3 text-yellow-400" />
                        </Button>
                        
                        {/* AI Suggestion Bubble */}
                        {hasAISuggestion && (
                          <div className="absolute right-0 top-8 z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
                            <div className="text-sm text-gray-200">
                              {hasAISuggestion}
                            </div>
                            <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}