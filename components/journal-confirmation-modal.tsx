"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Calendar, Film, CheckCircle, Edit2, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

// Predefined mood options that match the mood tracking system
const PREDEFINED_MOODS = [
  { value: '😊', label: 'Happy', emoji: '😊' },
  { value: '😌', label: 'Calm', emoji: '😌' },
  { value: '😐', label: 'Neutral', emoji: '😐' },
  { value: '😢', label: 'Sad', emoji: '😢' },
  { value: '😤', label: 'Angry', emoji: '😤' },
  { value: '😴', label: 'Tired', emoji: '😴' },
];

interface ExtractedTodo {
  title: string;
  time: "past" | "future";
  dueDate?: string;
  priority?: string;
  confidence?: number;
  reasoning?: string;
}

interface ExtractedMedia {
  title: string;
  type: "game" | "show" | "movie" | "book" | "podcast" | "music";
  status: "planned" | "watched" | "playing" | "completed" | "reading" | "read";
  confidence?: number;
  reasoning?: string;
}

interface ExtractedHabit {
  name: string;
  status: "done" | "missed";
  frequency?: string;
  confidence?: number;
  reasoning?: string;
}

interface ExtractedMood {
  value: string;
  confidence?: number;
  reasoning?: string;
}

interface ExtractedData {
  mood: ExtractedMood | string;
  todos: ExtractedTodo[];
  media: ExtractedMedia[];
  habits: ExtractedHabit[];
  confidence?: number;
}

interface JournalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedData;
  onConfirm: (data: {
    mood?: ExtractedMood | string;
    todos: ExtractedTodo[];
    media: ExtractedMedia[];
    habits: ExtractedHabit[];
  }) => void;
}

export function JournalConfirmationModal({
  isOpen,
  onClose,
  extractedData,
  onConfirm,
}: JournalConfirmationModalProps) {
  
  // Debug logging
  console.log("🎭 JournalConfirmationModal rendered with:", {
    isOpen,
    extractedData,
    hasExtractedData: !!extractedData,
    dataKeys: extractedData ? Object.keys(extractedData) : [],
    todosLength: extractedData?.todos?.length || 0,
    mediaLength: extractedData?.media?.length || 0,
    habitsLength: extractedData?.habits?.length || 0,
    todosData: extractedData?.todos,
    mediaData: extractedData?.media,
    habitsData: extractedData?.habits
  });

  // Ensure arrays exist and have default values
  const safeTodos = extractedData?.todos || [];
  const safeMedia = extractedData?.media || [];
  const safeHabits = extractedData?.habits || [];

  console.log("🔍 Safe arrays:", { safeTodos, safeMedia, safeHabits });

  // Normalize mood data
  const moodData = typeof extractedData.mood === 'string' 
    ? { value: extractedData.mood, confidence: 0.5 }
    : extractedData.mood;
    
  console.log("🎭 Normalized mood data:", moodData);

  // Editable data states (declare first)
  const [editableMood, setEditableMood] = useState(moodData?.value || '');
  const [editableTodos, setEditableTodos] = useState<ExtractedTodo[]>([...safeTodos]);
  const [editableMedia, setEditableMedia] = useState<ExtractedMedia[]>([...safeMedia]);
  const [editableHabits, setEditableHabits] = useState<ExtractedHabit[]>([...safeHabits]);

  console.log("🔍 Editable arrays after initialization:", { 
    editableTodos: editableTodos.length, 
    editableMedia: editableMedia.length, 
    editableHabits: editableHabits.length,
    editableTodosData: editableTodos,
    editableMediaData: editableMedia,
    editableHabitsData: editableHabits
  });

  // Update editable arrays when extractedData changes
  useEffect(() => {
    console.log("🔄 useEffect triggered, updating editable arrays");
    setEditableTodos([...safeTodos]);
    setEditableMedia([...safeMedia]);
    setEditableHabits([...safeHabits]);
    
    // Also update selection arrays
    setSelectedTodos(safeTodos.map(() => true));
    setSelectedMedia(safeMedia.map(() => true));
    setSelectedHabits(safeHabits.map(() => true));
    
    // Update editing arrays
    setEditingTodos(safeTodos.map(() => false));
    setEditingMedia(safeMedia.map(() => false));
    setEditingHabits(safeHabits.map(() => false));
  }, [extractedData, safeTodos.length, safeMedia.length, safeHabits.length]);

  // Initialize selected state for each item (use safeTodos etc. to avoid circular dependency)
  const [selectedMood, setSelectedMood] = useState(!!extractedData.mood);
  const [selectedTodos, setSelectedTodos] = useState<boolean[]>(
    safeTodos.map(() => true)
  );
  const [selectedMedia, setSelectedMedia] = useState<boolean[]>(
    safeMedia.map(() => true)
  );
  const [selectedHabits, setSelectedHabits] = useState<boolean[]>(
    safeHabits.map(() => true)
  );

  // Editing states
  const [editingMood, setEditingMood] = useState(false);
  const [editingTodos, setEditingTodos] = useState<boolean[]>(
    safeTodos.map(() => false)
  );
  const [editingMedia, setEditingMedia] = useState<boolean[]>(
    safeMedia.map(() => false)
  );
  const [editingHabits, setEditingHabits] = useState<boolean[]>(
    safeHabits.map(() => false)
  );

  // Get confidence level styling and icon
  const getConfidenceInfo = (confidence?: number) => {
    if (!confidence) return { level: 'unknown', color: 'text-gray-400', icon: AlertTriangle, bgColor: 'bg-gray-100' };
    
    if (confidence >= 0.8) {
      return { level: 'high', color: 'text-green-600', icon: CheckCircle2, bgColor: 'bg-green-50' };
    } else if (confidence >= 0.6) {
      return { level: 'medium', color: 'text-yellow-600', icon: AlertCircle, bgColor: 'bg-yellow-50' };
    } else {
      return { level: 'low', color: 'text-red-600', icon: AlertTriangle, bgColor: 'bg-red-50' };
    }
  };

  // Get emoji for mood using predefined moods
  const getMoodEmoji = (mood: string) => {
    const predefinedMood = PREDEFINED_MOODS.find(m => m.value === mood.toLowerCase());
    return predefinedMood ? predefinedMood.emoji : "🤔";
  };

  // Get icon for media type
  const getMediaTypeIcon = (type: string) => {
    const typeMap: Record<string, string> = {
      movie: "🎬",
      show: "📺",
      book: "📚",
      game: "🎮",
      podcast: "🎧",
      music: "🎵",
    };
    
    return typeMap[type.toLowerCase()] || "📌";
  };
  
  // Get readable status
  const getReadableStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      planned: "Plan to watch/play",
      watched: "Watched",
      playing: "Currently playing",
      completed: "Completed",
      reading: "Currently reading",
      read: "Read"
    };
    
    return statusMap[status] || status;
  };

  // Batch control functions
  const handleSelectAll = () => {
    setSelectedMood(!!moodData);
    setSelectedTodos(editableTodos.map(() => true));
    setSelectedMedia(editableMedia.map(() => true));
    setSelectedHabits(editableHabits.map(() => true));
  };

  const handleSelectNone = () => {
    setSelectedMood(false);
    setSelectedTodos(editableTodos.map(() => false));
    setSelectedMedia(editableMedia.map(() => false));
    setSelectedHabits(editableHabits.map(() => false));
  };

  const handleSelectHighConfidence = () => {
    setSelectedMood(!!moodData && (moodData.confidence || 0) >= 0.8);
    setSelectedTodos(editableTodos.map(todo => (todo.confidence || 0) >= 0.8));
    setSelectedMedia(editableMedia.map(media => (media.confidence || 0) >= 0.8));
    setSelectedHabits(editableHabits.map(habit => (habit.confidence || 0) >= 0.8));
  };

  const handleAddAll = () => {
    const finalMood = selectedMood ? (editableMood ? { value: editableMood, confidence: moodData?.confidence } : moodData) : undefined;
    
    onConfirm({
      mood: finalMood,
      todos: editableTodos.filter((_, index) => selectedTodos[index]),
      media: editableMedia.filter((_, index) => selectedMedia[index]),
      habits: editableHabits.filter((_, index) => selectedHabits[index]),
    });
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  // Edit handlers
  const handleEditTodo = (index: number, field: keyof ExtractedTodo, value: string) => {
    setEditableTodos(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleEditMedia = (index: number, field: keyof ExtractedMedia, value: string) => {
    setEditableMedia(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleEditHabit = (index: number, field: keyof ExtractedHabit, value: string) => {
    setEditableHabits(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };
  
  // Calculate total selected items
  const selectedItemsCount = 
    (selectedMood ? 1 : 0) +
    selectedTodos.filter(Boolean).length +
    selectedMedia.filter(Boolean).length +
    selectedHabits.filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl w-full mx-auto p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Found Items in Your Journal
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>
              Select None
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectHighConfidence}>
              High Confidence Only
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Mood */}
          {moodData && (
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(moodData.value)}</span>
                  <div>
                    <h3 className="font-medium">Detected Mood</h3>
                    {!editingMood ? (
                      <p className="text-sm text-muted-foreground">"{moodData.value}"</p>
                    ) : (
                      <Select
                        value={editableMood}
                        onValueChange={(value) => setEditableMood(value)}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          {PREDEFINED_MOODS.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex items-center gap-2">
                                <span>{mood.emoji}</span>
                                <span>{mood.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMood(!editingMood)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Checkbox
                    id="mood"
                    checked={selectedMood}
                    onCheckedChange={(checked) => setSelectedMood(!!checked)}
                  />
                </div>
              </div>
              {moodData.confidence !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  {(() => {
                    const confidenceInfo = getConfidenceInfo(moodData.confidence);
                    const ConfidenceIcon = confidenceInfo.icon;
                    return (
                      <>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${confidenceInfo.bgColor}`}>
                          <ConfidenceIcon className={`w-3 h-3 ${confidenceInfo.color}`} />
                          <span className={confidenceInfo.color}>
                            {Math.round((moodData.confidence || 0) * 100)}% confidence
                          </span>
                        </div>
                        {moodData.reasoning && (
                          <span className="text-xs text-muted-foreground">
                            {moodData.reasoning}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Todos */}
          {console.log("🔍 Todos condition check:", { editableTodosLength: editableTodos.length, editableTodos })}
          {(editableTodos.length > 0 || safeTodos.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <Calendar className="w-4 h-4 text-blue-400" />
                Tasks Found ({editableTodos.length > 0 ? editableTodos.length : safeTodos.length})
              </h3>
              <div className="space-y-3">
                {(editableTodos.length > 0 ? editableTodos : safeTodos).map((todo, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 space-y-2">
                        {!editingTodos[index] ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{todo.title}</span>
                            {todo.priority && (
                              <Badge variant={
                                todo.priority === "high" ? "destructive" : 
                                todo.priority === "medium" ? "default" : 
                                "secondary"
                              }>
                                {todo.priority}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={todo.title}
                              onChange={(e) => handleEditTodo(index, 'title', e.target.value)}
                              placeholder="Task title"
                              className="h-8"
                            />
                            <div className="flex gap-2">
                              <Select
                                value={todo.priority || ''}
                                onValueChange={(value) => handleEditTodo(index, 'priority', value)}
                              >
                                <SelectTrigger className="h-8 w-24">
                                  <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={todo.dueDate || ''}
                                onChange={(e) => handleEditTodo(index, 'dueDate', e.target.value)}
                                placeholder="Due date"
                                className="h-8 flex-1"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={todo.time === "past" ? "secondary" : "outline"}>
                            {todo.time === "past" ? "Completed Task" : "Future Task"}
                          </Badge>
                          {todo.dueDate && !editingTodos[index] && (
                            <Badge variant="secondary">Due: {todo.dueDate}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTodos(prev => {
                              const updated = [...prev];
                              updated[index] = !updated[index];
                              return updated;
                            });
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Checkbox
                          id={`todo-${index}`}
                          checked={selectedTodos[index]}
                          onCheckedChange={(checked) => {
                            setSelectedTodos((prev) => {
                              const updated = [...prev];
                              updated[index] = !!checked;
                              return updated;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {todo.confidence !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const confidenceInfo = getConfidenceInfo(todo.confidence);
                          const ConfidenceIcon = confidenceInfo.icon;
                          return (
                            <>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${confidenceInfo.bgColor}`}>
                                <ConfidenceIcon className={`w-3 h-3 ${confidenceInfo.color}`} />
                                <span className={confidenceInfo.color}>
                                  {Math.round((todo.confidence || 0) * 100)}% confidence
                                </span>
                              </div>
                              {todo.reasoning && (
                                <span className="text-xs text-muted-foreground">
                                  {todo.reasoning}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {console.log("🔍 Media condition check:", { editableMediaLength: editableMedia.length, editableMedia })}
          {(editableMedia.length > 0 || safeMedia.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <Film className="w-4 h-4 text-purple-400" />
                Media Found ({editableMedia.length > 0 ? editableMedia.length : safeMedia.length})
              </h3>
              <div className="space-y-3">
                {(editableMedia.length > 0 ? editableMedia : safeMedia).map((media, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 space-y-2">
                        {!editingMedia[index] ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getMediaTypeIcon(media.type)}</span>
                            <span className="font-medium">{media.title}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={media.title}
                              onChange={(e) => handleEditMedia(index, 'title', e.target.value)}
                              placeholder="Media title"
                              className="h-8"
                            />
                            <div className="flex gap-2">
                              <Select
                                value={media.type}
                                onValueChange={(value) => handleEditMedia(index, 'type', value)}
                              >
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="movie">Movie</SelectItem>
                                  <SelectItem value="show">Show</SelectItem>
                                  <SelectItem value="book">Book</SelectItem>
                                  <SelectItem value="game">Game</SelectItem>
                                  <SelectItem value="podcast">Podcast</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={media.status}
                                onValueChange={(value) => handleEditMedia(index, 'status', value)}
                              >
                                <SelectTrigger className="h-8 flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planned">Planned</SelectItem>
                                  <SelectItem value="watched">Watched</SelectItem>
                                  <SelectItem value="playing">Playing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="reading">Reading</SelectItem>
                                  <SelectItem value="read">Read</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">{media.type}</Badge>
                          <Badge variant="secondary">{getReadableStatus(media.status)}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMedia(prev => {
                              const updated = [...prev];
                              updated[index] = !updated[index];
                              return updated;
                            });
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Checkbox
                          id={`media-${index}`}
                          checked={selectedMedia[index]}
                          onCheckedChange={(checked) => {
                            setSelectedMedia((prev) => {
                              const updated = [...prev];
                              updated[index] = !!checked;
                              return updated;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {media.confidence !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const confidenceInfo = getConfidenceInfo(media.confidence);
                          const ConfidenceIcon = confidenceInfo.icon;
                          return (
                            <>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${confidenceInfo.bgColor}`}>
                                <ConfidenceIcon className={`w-3 h-3 ${confidenceInfo.color}`} />
                                <span className={confidenceInfo.color}>
                                  {Math.round((media.confidence || 0) * 100)}% confidence
                                </span>
                              </div>
                              {media.reasoning && (
                                <span className="text-xs text-muted-foreground">
                                  {media.reasoning}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {console.log("🔍 Habits condition check:", { editableHabitsLength: editableHabits.length, editableHabits })}
          {(editableHabits.length > 0 || safeHabits.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Habits Found ({editableHabits.length > 0 ? editableHabits.length : safeHabits.length})
              </h3>
              <div className="space-y-3">
                {(editableHabits.length > 0 ? editableHabits : safeHabits).map((habit, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 space-y-2">
                        {!editingHabits[index] ? (
                          <span className="font-medium">{habit.name}</span>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={habit.name}
                              onChange={(e) => handleEditHabit(index, 'name', e.target.value)}
                              placeholder="Habit name"
                              className="h-8"
                            />
                            <div className="flex gap-2">
                              <Select
                                value={habit.status}
                                onValueChange={(value) => handleEditHabit(index, 'status', value)}
                              >
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="done">Completed</SelectItem>
                                  <SelectItem value="missed">Missed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={habit.frequency || ''}
                                onChange={(e) => handleEditHabit(index, 'frequency', e.target.value)}
                                placeholder="Frequency (e.g., daily)"
                                className="h-8 flex-1"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={habit.status === "done" ? "secondary" : "destructive"}
                          >
                            {habit.status === "done" ? "Completed" : "Missed"}
                          </Badge>
                          {habit.frequency && !editingHabits[index] && (
                            <Badge variant="outline" className="capitalize">{habit.frequency}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingHabits(prev => {
                              const updated = [...prev];
                              updated[index] = !updated[index];
                              return updated;
                            });
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Checkbox
                          id={`habit-${index}`}
                          checked={selectedHabits[index]}
                          onCheckedChange={(checked) => {
                            setSelectedHabits((prev) => {
                              const updated = [...prev];
                              updated[index] = !!checked;
                              return updated;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {habit.confidence !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const confidenceInfo = getConfidenceInfo(habit.confidence);
                          const ConfidenceIcon = confidenceInfo.icon;
                          return (
                            <>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${confidenceInfo.bgColor}`}>
                                <ConfidenceIcon className={`w-3 h-3 ${confidenceInfo.color}`} />
                                <span className={confidenceInfo.color}>
                                  {Math.round((habit.confidence || 0) * 100)}% confidence
                                </span>
                              </div>
                              {habit.reasoning && (
                                <span className="text-xs text-muted-foreground">
                                  {habit.reasoning}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2 flex-wrap pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleAddAll} disabled={selectedItemsCount === 0}>
              Add to Collections
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 