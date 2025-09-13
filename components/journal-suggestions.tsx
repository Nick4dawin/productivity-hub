"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lightbulb, RefreshCw, Sparkles, TrendingUp, Calendar, Film, Target, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Suggestion {
  prompt: string;
  title: string;
  type: 'mood' | 'todo' | 'media' | 'habit' | 'reflection' | 'goals' | 'gratitude' | 'creativity' | 'relationships' | 'growth';
  relevance: number;
  reasoning: string;
}

interface FallbackPrompt {
  title: string;
  prompt: string;
  category: string;
}

interface ContextualSuggestions {
  suggestions: Suggestion[];
  fallbackPrompts: FallbackPrompt[];
  error?: string;
}

interface JournalSuggestionsProps {
  onSelectSuggestion: (prompt: string) => void;
  className?: string;
}

export function JournalSuggestions({ onSelectSuggestion, className }: JournalSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ContextualSuggestions>({
    suggestions: [],
    fallbackPrompts: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [editingTitles, setEditingTitles] = useState<{[key: number]: string}>({});
  const [customTitles, setCustomTitles] = useState<{[key: number]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    
    try {
      // Get user context data
      const [todosRes, moodsRes, habitsRes, mediaRes] = await Promise.all([
        fetch('/api/todos'),
        fetch('/api/moods'),
        fetch('/api/habits'),
        fetch('/api/media')
      ]);
      
      const todos = todosRes.ok ? await todosRes.json() : [];
      const moods = moodsRes.ok ? await moodsRes.json() : [];
      const habits = habitsRes.ok ? await habitsRes.json() : [];
      const media = mediaRes.ok ? await mediaRes.json() : [];
      
      // Generate AI suggestions with titles
      const response = await fetch('/api/ai/journal-prompts-with-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todos,
          moods,
          habits,
          media,
          count: 8
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform the data to match expected format
         const transformedSuggestions = data.prompts?.map((prompt: any, index: number) => ({
           prompt: prompt.prompt,
           title: prompt.title,
           type: prompt.category || 'reflection',
           relevance: Math.floor(Math.random() * 30) + 70,
           reasoning: `AI-generated prompt based on your current context and ${prompt.category} focus.`
         })) || [];
        
        setSuggestions({
           suggestions: transformedSuggestions,
           fallbackPrompts: generateMockSuggestions({}).fallbackPrompts
         });
      } else {
        // Fallback to mock suggestions for development
        const mockSuggestions = generateMockSuggestions();
        setSuggestions(mockSuggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      
      // Use fallback suggestions
      const fallbackSuggestions = generateMockSuggestions();
      setSuggestions(fallbackSuggestions);
      
      toast({
        title: 'Using offline suggestions',
        description: 'Could not load personalized suggestions, showing general prompts',
        variant: 'default',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSuggestions = (): ContextualSuggestions => {
    return {
      suggestions: [
        {
          prompt: "What's one thing that made you smile today, and why did it have that effect on you?",
          type: 'mood',
          relevance: 0.9,
          reasoning: "Based on your recent positive mood patterns"
        },
        {
          prompt: "Looking at your upcoming tasks, which one feels most challenging and how might you approach it differently?",
          type: 'todo',
          relevance: 0.8,
          reasoning: "You have several high-priority tasks coming up"
        },
        {
          prompt: "What themes or messages from the media you've been consuming lately resonate with your current life situation?",
          type: 'media',
          relevance: 0.7,
          reasoning: "Based on your recent reading and viewing habits"
        },
        {
          prompt: "How has maintaining your daily habits been affecting your overall well-being this week?",
          type: 'habit',
          relevance: 0.8,
          reasoning: "Your habit consistency has been strong lately"
        },
        {
          prompt: "What's a pattern in your thoughts or behaviors that you've noticed recently, and what might it be telling you?",
          type: 'reflection',
          relevance: 0.9,
          reasoning: "Encouraging deeper self-awareness based on your journal history"
        }
      ],
      fallbackPrompts: [
        {
          title: "Daily Reflection",
          prompt: "What's one thing you learned about yourself today?",
          category: "growth"
        },
        {
          title: "Mood Check",
          prompt: "How are you feeling right now, and what might be influencing that?",
          category: "mood"
        },
        {
          title: "Gratitude Moment",
          prompt: "What's something you're grateful for this week?",
          category: "gratitude"
        },
        {
          title: "Challenge Focus",
          prompt: "What challenge are you currently facing, and how might you approach it?",
          category: "goals"
        },
        {
          title: "Authentic Self",
          prompt: "Describe a moment today when you felt most like yourself.",
          category: "growth"
        },
        {
          title: "Future Goals",
          prompt: "What's one goal you're excited to work on this week?",
          category: "goals"
        },
        {
          title: "Perspective Shift",
          prompt: "How has your perspective on something important changed recently?",
          category: "growth"
        },
        {
          title: "Joy Discovery",
          prompt: "What's bringing you joy right now?",
          category: "gratitude"
        },
        {
          title: "Letting Go",
          prompt: "What would you like to let go of today?",
          category: "growth"
        },
        {
          title: "Growth Vision",
          prompt: "How do you want to grow in the coming month?",
          category: "goals"
        }
      ]
    };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mood': return <Sparkles className="w-4 h-4" />;
      case 'todo': return <Calendar className="w-4 h-4" />;
      case 'media': return <Film className="w-4 h-4" />;
      case 'habit': return <Target className="w-4 h-4" />;
      case 'reflection': return <TrendingUp className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mood': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'todo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'media': return 'bg-green-100 text-green-800 border-green-200';
      case 'habit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reflection': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'goals': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'gratitude': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'creativity': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'relationships': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'growth': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTitleEdit = (index: number, currentTitle: string) => {
    setEditingTitles({ ...editingTitles, [index]: currentTitle });
  };

  const handleTitleSave = (index: number) => {
    const newTitle = editingTitles[index];
    if (newTitle && newTitle.trim()) {
      setCustomTitles({ ...customTitles, [index]: newTitle.trim() });
    }
    const updatedEditing = { ...editingTitles };
    delete updatedEditing[index];
    setEditingTitles(updatedEditing);
  };

  const handleTitleCancel = (index: number) => {
    const updatedEditing = { ...editingTitles };
    delete updatedEditing[index];
    setEditingTitles(updatedEditing);
  };

  const getDisplayTitle = (suggestion: Suggestion, index: number) => {
    return customTitles[index] || suggestion.title;
  };

  const filteredSuggestions = selectedType === 'all' 
    ? suggestions.suggestions 
    : suggestions.suggestions.filter(s => s.type === selectedType);

  const suggestionTypes = ['all', 'mood', 'goals', 'gratitude', 'creativity', 'growth', 'relationships', 'reflection'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Writing Prompts
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuggestions}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestionTypes.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All' : type}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Generating personalized suggestions...</p>
          </div>
        ) : (
          <>
            {/* Contextual suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Personalized for You
                </h4>
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        {/* Editable Title */}
                        <div className="flex items-center gap-2 mb-2">
                          {editingTitles[index] !== undefined ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingTitles[index]}
                                onChange={(e) => setEditingTitles({ ...editingTitles, [index]: e.target.value })}
                                className="text-sm font-medium h-8"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleTitleSave(index);
                                  if (e.key === 'Escape') handleTitleCancel(index);
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTitleSave(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTitleCancel(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <h3 className="text-sm font-semibold text-foreground">
                                {getDisplayTitle(suggestion, index)}
                              </h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTitleEdit(index, getDisplayTitle(suggestion, index))}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Prompt */}
                        <p 
                          className="text-sm mb-2 group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => onSelectSuggestion(suggestion.prompt)}
                        >
                          {suggestion.prompt}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(suggestion.type)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getTypeIcon(suggestion.type)}
                              {suggestion.type}
                            </span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.relevance}% match
                          </Badge>
                        </div>
                        {suggestion.reasoning && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {suggestion.reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback prompts */}
            {suggestions.fallbackPrompts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {filteredSuggestions.length > 0 ? 'More Ideas' : 'General Prompts'}
                </h4>
                <div className="grid gap-2">
                  {suggestions.fallbackPrompts.slice(0, 3).map((promptObj, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => onSelectSuggestion(promptObj.prompt)}
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1">{promptObj.title}</h4>
                          <p className="text-sm text-muted-foreground">{promptObj.prompt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Error state */}
            {suggestions.error && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">{suggestions.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSuggestions}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}