"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Sparkles, TrendingUp, Calendar, Film, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Suggestion {
  prompt: string;
  type: 'mood' | 'todo' | 'media' | 'habit' | 'reflection';
  relevance: number;
  reasoning: string;
}

interface ContextualSuggestions {
  suggestions: Suggestion[];
  fallbackPrompts: string[];
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
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/journal/suggestions');
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
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
        "What's on your mind today?",
        "How are you feeling right now, and what might be influencing that?",
        "What's one thing you learned recently that surprised you?",
        "What are you looking forward to this week?",
        "What challenged you today, and how did you handle it?"
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
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSuggestions = selectedType === 'all' 
    ? suggestions.suggestions 
    : suggestions.suggestions.filter(s => s.type === selectedType);

  const suggestionTypes = ['all', 'mood', 'todo', 'media', 'habit', 'reflection'];

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
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectSuggestion(suggestion.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2 group-hover:text-primary transition-colors">
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
                            {Math.round(suggestion.relevance * 100)}% match
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
                  {suggestions.fallbackPrompts.slice(0, 3).map((prompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start text-left h-auto p-3 whitespace-normal"
                      onClick={() => onSelectSuggestion(prompt)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
                      <span className="text-sm">{prompt}</span>
                    </Button>
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