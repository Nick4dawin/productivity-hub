"use client";

import React, { useState } from "react";
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
import { BrainCircuit, Calendar, Film, CheckCircle } from "lucide-react";

interface ExtractedTodo {
  title: string;
  time: "past" | "future";
  dueDate?: string;
  priority?: string;
}

interface ExtractedMedia {
  title: string;
  type: "game" | "show" | "movie" | "book" | "podcast" | "music";
  status: "planned" | "watched" | "playing" | "completed" | "reading" | "read";
}

interface ExtractedHabit {
  name: string;
  status: "done" | "missed";
  frequency?: string;
}

interface ExtractedData {
  mood: string;
  todos: ExtractedTodo[];
  media: ExtractedMedia[];
  habits: ExtractedHabit[];
}

interface JournalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedData;
  onConfirm: (data: {
    mood?: string;
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
  // Initialize selected state for each item
  const [selectedMood, setSelectedMood] = useState(!!extractedData.mood);
  const [selectedTodos, setSelectedTodos] = useState<boolean[]>(
    extractedData.todos.map(() => true)
  );
  const [selectedMedia, setSelectedMedia] = useState<boolean[]>(
    extractedData.media.map(() => true)
  );
  const [selectedHabits, setSelectedHabits] = useState<boolean[]>(
    extractedData.habits.map(() => true)
  );

  // Get emoji for mood
  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      tired: "😴",
      motivated: "💪",
      excited: "🤩",
      relaxed: "😌",
      stressed: "😩",
      neutral: "😐",
      angry: "😡",
      frustrated: "😤",
      calm: "😌",
    };
    
    // Check if mood includes any key from moodMap (case insensitive)
    const matchedKey = Object.keys(moodMap).find(key => 
      mood.toLowerCase().includes(key.toLowerCase())
    );
    
    return matchedKey ? moodMap[matchedKey] : "🤔";
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

  const handleAddAll = () => {
    onConfirm({
      mood: selectedMood ? extractedData.mood : undefined,
      todos: extractedData.todos.filter((_, index) => selectedTodos[index]),
      media: extractedData.media.filter((_, index) => selectedMedia[index]),
      habits: extractedData.habits.filter((_, index) => selectedHabits[index]),
    });
    onClose();
  };

  const handleSkip = () => {
    onClose();
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
        </DialogHeader>

        <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Mood */}
          {extractedData.mood && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodEmoji(extractedData.mood)}</span>
                <div>
                  <h3 className="font-medium">Detected Mood</h3>
                  <p className="text-sm text-muted-foreground">"{extractedData.mood}"</p>
                </div>
              </div>
              <Checkbox
                id="mood"
                checked={selectedMood}
                onCheckedChange={(checked) => setSelectedMood(!!checked)}
              />
            </div>
          )}

          {/* Todos */}
          {extractedData.todos.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <Calendar className="w-4 h-4 text-blue-400" />
                Tasks Found ({extractedData.todos.length})
              </h3>
              <div className="space-y-3">
                {extractedData.todos.map((todo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="space-y-1">
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
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={todo.time === "past" ? "secondary" : "outline"}>
                          {todo.time === "past" ? "Completed Task" : "Future Task"}
                        </Badge>
                        {todo.dueDate && (
                          <Badge variant="secondary">Due: {todo.dueDate}</Badge>
                        )}
                      </div>
                    </div>
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
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {extractedData.media.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <Film className="w-4 h-4 text-purple-400" />
                Media Found ({extractedData.media.length})
              </h3>
              <div className="space-y-3">
                {extractedData.media.map((media, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMediaTypeIcon(media.type)}</span>
                        <span className="font-medium">{media.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">{media.type}</Badge>
                        <Badge variant="secondary">{getReadableStatus(media.status)}</Badge>
                      </div>
                    </div>
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
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {extractedData.habits.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2 pb-1 border-b">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Habits Found ({extractedData.habits.length})
              </h3>
              <div className="space-y-3">
                {extractedData.habits.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <span className="font-medium">{habit.name}</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={habit.status === "done" ? "secondary" : "destructive"}
                        >
                          {habit.status === "done" ? "Completed" : "Missed"}
                        </Badge>
                        {habit.frequency && (
                          <Badge variant="outline" className="capitalize">{habit.frequency}</Badge>
                        )}
                      </div>
                    </div>
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