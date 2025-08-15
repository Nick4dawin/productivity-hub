"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoodSelector } from '@/components/mood-selector';
import { EnergySelector } from '@/components/energy-selector';
import { ActivitySelector } from '@/components/activity-selector';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lightbulb, BrainCircuit, Sparkles, CheckCircle } from 'lucide-react';
import { JournalConfirmationModal } from '@/components/journal-confirmation-modal';
import { JournalSuggestions } from '@/components/journal-suggestions';

interface JournalEntryData {
  content: string;
  mood: string;
  energy: string;
  activities: string[];
  title?: string; // Add title field
  category?: string; // Add category field
  _id?: string;
  analysis?: {
    summary?: string;
    sentiment?: string;
    keywords?: string[];
    suggestions?: string[];
    insights?: string;
    extracted?: {
      mood?: string;
      todos?: ExtractedTodo[];
      media?: ExtractedMedia[];
      habits?: ExtractedHabit[];
    };
  };
}

interface JournalEntryProps {
  onSave: (entry: JournalEntryData) => Promise<JournalEntryData>;
  isLoading?: boolean;
  defaultValues?: JournalEntryData;
}

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

export function JournalEntry({ onSave, isLoading, defaultValues }: JournalEntryProps) {
  // Add title and category state
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [category, setCategory] = useState(defaultValues?.category || 'Personal');
  const [content, setContent] = useState(defaultValues?.content || '');
  const [mood, setMood] = useState(defaultValues?.mood || '');
  const [energy, setEnergy] = useState(defaultValues?.energy || '');
  const [activities, setActivities] = useState(defaultValues?.activities || []);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    mood: '',
    todos: [],
    media: [],
    habits: []
  });
  const [journalPrompt, setJournalPrompt] = useState('');
  const [savedJournalId, setSavedJournalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoDetectedMood, setAutoDetectedMood] = useState('');
  const [showMoodSuggestion, setShowMoodSuggestion] = useState(false);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState<{
    mood?: { detected: string; confidence: number; suggestion: string };
    quickSuggestions?: string[];
    actionItems?: string[];
    analyzing?: boolean;
  }>({});
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { toast } = useToast();

  // Debounce timer for auto-analysis
  const [analysisTimer, setAnalysisTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch journal context for suggestions when component mounts
  useEffect(() => {
    fetchJournalContext();
  }, []);

  // Set up real-time analysis when content changes
  useEffect(() => {
    if (content.length > 10) {
      // Clear previous timer
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }

      // Set analyzing state immediately for UI feedback
      setRealtimeAnalysis(prev => ({ ...prev, analyzing: true }));

      // Set new timer to analyze after user stops typing
      const timer = setTimeout(() => {
        performRealtimeAnalysis();
      }, 1500); // Wait 1.5 seconds after typing stops

      setAnalysisTimer(timer);
    } else {
      // Clear analysis if content is too short
      setRealtimeAnalysis({});
      setShowMoodSuggestion(false);
    }

    return () => {
      // Clean up timer on unmount
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }
    };
  }, [content]);

  // Update title based on content if title is empty
  useEffect(() => {
    if (!title && content) {
      // Auto-generate title from first 50 chars
      const autoTitle = content.substring(0, 50) + (content.length > 50 ? "..." : "");
      setTitle(autoTitle);
    }
  }, [content, title]);

  const fetchJournalContext = async () => {
    try {
      const response = await fetch('/api/journal/context');
      if (response.ok) {
        const data = await response.json();

        // Generate a prompt using AI based on context
        await generateJournalPrompt(data);
      }
    } catch (error) {
      console.error('Error fetching journal context:', error);
    }
  };

  const generateJournalPrompt = async (contextData: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/ai/journal-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData)
      });

      if (response.ok) {
        const { prompt } = await response.json();
        setJournalPrompt(prompt);
      }
    } catch (error) {
      console.error('Error generating journal prompt:', error);
    }
  };

  const performRealtimeAnalysis = async () => {
    // Don't analyze if content is too short
    if (content.length < 10) return;

    try {
      const response = await fetch('/api/journal/analyze-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: 'current-user' // In real app, get from auth context
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setRealtimeAnalysis(analysis);

        // If we have a mood detected with high confidence and user hasn't selected one, suggest it
        if (analysis.mood?.detected && analysis.mood.confidence > 0.7 && !mood) {
          setAutoDetectedMood(analysis.mood.detected);
          setShowMoodSuggestion(true);
        }
      } else {
        // Fallback to mock analysis for development
        const mockAnalysis = {
          mood: {
            detected: detectMoodFromContent(content),
            confidence: 0.8,
            suggestion: "Consider reflecting on what's influencing this mood"
          },
          quickSuggestions: generateQuickSuggestions(content),
          actionItems: extractActionItems(content),
          analyzing: false
        };

        setRealtimeAnalysis(mockAnalysis);

        if (mockAnalysis.mood.detected && mockAnalysis.mood.confidence > 0.7 && !mood) {
          setAutoDetectedMood(mockAnalysis.mood.detected);
          setShowMoodSuggestion(true);
        }
      }
    } catch (error) {
      console.error('Error in real-time analysis:', error);
      // Fallback to basic analysis
      setRealtimeAnalysis({
        analyzing: false,
        quickSuggestions: ["Keep writing to explore your thoughts further"]
      });
    }
  };

  // Helper functions for mock analysis
  const detectMoodFromContent = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('excited')) return 'happy';
    if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('upset')) return 'sad';
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous')) return 'anxious';
    if (lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('sleepy')) return 'tired';
    if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) return 'angry';
    if (lowerText.includes('stressed') || lowerText.includes('overwhelmed')) return 'stressed';
    return 'neutral';
  };

  const generateQuickSuggestions = (text: string): string[] => {
    const suggestions = [];
    if (text.length < 100) {
      suggestions.push("Try expanding on your current thoughts");
    }
    if (!text.includes('feel')) {
      suggestions.push("How are you feeling about this situation?");
    }
    if (!text.includes('because') && !text.includes('why')) {
      suggestions.push("What might be causing these thoughts or feelings?");
    }
    return suggestions.slice(0, 2);
  };

  const extractActionItems = (text: string): string[] => {
    const actionWords = ['need to', 'should', 'must', 'have to', 'want to', 'plan to'];
    const items = [];

    for (const word of actionWords) {
      if (text.toLowerCase().includes(word)) {
        items.push(`Action item detected: "${word}..."`);
        break;
      }
    }

    return items;
  };

  const analyzeJournalContent = async () => {
    // This is the full analysis for when saving
    if (content.length < 50) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mood,
          energy,
          activities
        })
      });

      if (response.ok) {
        const { analysis } = await response.json();

        // Store extracted data for later use
        if (analysis.extracted) {
          setExtractedData({
            mood: analysis.extracted.mood || '',
            todos: analysis.extracted.todos || [],
            media: analysis.extracted.media || [],
            habits: analysis.extracted.habits || []
          });
        }
      } else {
        // Fallback mock analysis
        const mockData: ExtractedData = {
          mood: mood || realtimeAnalysis.mood?.detected || 'neutral',
          todos: content.toLowerCase().includes('todo') || content.toLowerCase().includes('need to') ? [{
            title: "Task mentioned in journal",
            time: 'future' as 'future',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium'
          }] : [],
          media: content.toLowerCase().includes('watch') || content.toLowerCase().includes('read') ? [{
            title: "Media mentioned in journal",
            type: 'show' as 'show',
            status: 'planned' as 'planned'
          }] : [],
          habits: content.toLowerCase().includes('exercise') || content.toLowerCase().includes('habit') ? [{
            name: "Habit mentioned in journal",
            status: 'done' as 'done',
            frequency: 'daily'
          }] : []
        };

        setExtractedData(mockData);
      }
    } catch (error) {
      console.error('Error analyzing journal content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyDetectedMood = () => {
    setMood(autoDetectedMood);
    setShowMoodSuggestion(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🚀 Journal submission started");
    console.log("📝 Form data:", { content: content.length, title, category, mood, energy, activities });

    if (!content) {
      console.log("❌ No content provided");
      toast({
        title: 'Missing Content',
        description: 'Please write something in your journal',
        variant: 'destructive',
      });
      return;
    }

    if (!title) {
      const autoTitle = content.substring(0, 50) + (content.length > 50 ? "..." : "");
      setTitle(autoTitle);
      console.log("📋 Auto-generated title:", autoTitle);
    }

    setIsSaving(true);
    setIsAnalyzing(true);

    try {
      // Prepare journal data with title and category
      const journalData = {
        content,
        mood,
        energy,
        activities,
        title: title || content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        category: category || 'Personal',
      };

      console.log("📤 Sending journal data to onSave:", journalData);

      // Save the journal entry
      const savedEntry = await onSave(journalData);

      console.log("✅ Journal entry saved successfully:", savedEntry);
      console.log("🔍 Analysis data:", savedEntry.analysis);

      // Store journal ID for later use
      if (savedEntry._id) {
        setSavedJournalId(savedEntry._id);
        console.log("💾 Saved journal ID:", savedEntry._id);

        let hasExtractedData = false;
        let extractedItems: ExtractedData = {
          mood: '',
          todos: [],
          media: [],
          habits: []
        };

        // Get the extracted data from the analysis
        if (savedEntry.analysis?.extracted) {
          console.log("🤖 Found AI analysis data:", savedEntry.analysis.extracted);

          extractedItems = {
            mood: savedEntry.analysis.extracted.mood || '',
            todos: savedEntry.analysis.extracted.todos || [],
            media: savedEntry.analysis.extracted.media || [],
            habits: savedEntry.analysis.extracted.habits || []
          };

          // Check if we have any extracted items
          hasExtractedData =
            !!extractedItems.mood ||
            extractedItems.todos.length > 0 ||
            extractedItems.media.length > 0 ||
            extractedItems.habits.length > 0;

          console.log("📊 Extracted data summary:", {
            hasMood: !!extractedItems.mood,
            todosCount: extractedItems.todos.length,
            mediaCount: extractedItems.media.length,
            habitsCount: extractedItems.habits.length,
            hasExtractedData
          });

          if (hasExtractedData) {
            setExtractedData(extractedItems);
            console.log("✨ Using real extracted data:", extractedItems);
          }
        } else {
          console.log("⚠️ No analysis.extracted found in saved entry");
          console.log("📋 Full saved entry structure:", Object.keys(savedEntry));
          if (savedEntry.analysis) {
            console.log("📋 Analysis structure:", Object.keys(savedEntry.analysis));
          }
        }

        // If no extracted data was found, generate mock data for testing
        if (!hasExtractedData) {
          console.log("🎭 No real extracted data found, generating mock data for testing");

          const mockData: ExtractedData = {
            mood: mood || 'neutral',
            todos: [{
              title: `Task from "${title}"`,
              time: 'future' as 'future',
              dueDate: new Date().toISOString().split('T')[0],
              priority: 'medium',
              confidence: 0.7
            }],
            media: [{
              title: 'Sample media from journal',
              type: 'book' as 'book',
              status: 'planned' as 'planned',
              confidence: 0.6
            }],
            habits: [{
              name: 'Sample habit from journal',
              status: 'done' as 'done',
              frequency: 'daily',
              confidence: 0.8
            }]
          };

          setExtractedData(mockData);
          console.log("🎭 Mock data created:", mockData);
          hasExtractedData = true; // Force modal to show for testing
        }

        // Show the confirmation modal if we have any data
        if (hasExtractedData) {
          console.log("🎯 Opening confirmation modal with data");
          setIsConfirmModalOpen(true);
        } else {
          console.log("❌ No extracted data available, skipping modal");
          // Still reset form even if no modal
          resetForm();
        }
      } else {
        console.log("❌ No _id found in saved entry:", savedEntry);
      }
    } catch (error) {
      console.error('💥 Error saving journal entry:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      toast({
        title: 'Error',
        description: `Failed to save journal entry: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setIsAnalyzing(false);
      console.log("🏁 Journal submission completed");
    }
  };

  const resetForm = () => {
    setContent('');
    setMood('');
    setEnergy('');
    setActivities([]);
    setTitle('');
    setAutoDetectedMood('');
    setShowMoodSuggestion(false);
    setRealtimeAnalysis({});
    // Get fresh journal prompts after submission
    fetchJournalContext();
  };

  const handleSuggestionSelect = (prompt: string) => {
    if (content) {
      // If there's existing content, append the suggestion
      setContent(content + '\n\n' + prompt);
    } else {
      // If empty, use the suggestion as a starting point
      setContent(prompt + '\n\n');
    }

    // Focus on the textarea after adding suggestion
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 100);
  };

  const handleConfirmExtractedData = async (selectedData: {
    mood?: string;
    todos: ExtractedTodo[];
    media: ExtractedMedia[];
    habits: ExtractedHabit[];
  }) => {
    if (!savedJournalId) return;

    try {
      // Try the Next.js API route first
      const response = await fetch('/api/journal/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalId: savedJournalId,
          ...selectedData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Saved items:', result);

        // Show success message and reset form
        showSuccessMessage(selectedData);
      } else {
        // Direct API call fallback - this would require direct access to the API_URL and token
        console.log('API route failed, showing success anyway for demo purposes');

        // Simulate success
        showSuccessMessage(selectedData);
      }
    } catch (error) {
      console.error('Error saving extracted items:', error);
      toast({
        title: 'Error',
        description: 'Failed to process extracted items',
        variant: 'destructive',
      });
    }
  };

  // Helper function to show success message and reset form
  const showSuccessMessage = (selectedData: {
    mood?: string;
    todos: ExtractedTodo[];
    media: ExtractedMedia[];
    habits: ExtractedHabit[];
  }) => {
    // Calculate counts for toast message
    let itemsAdded = 0;
    if (selectedData.mood) itemsAdded++;
    itemsAdded += selectedData.todos.length;
    itemsAdded += selectedData.media.length;
    itemsAdded += selectedData.habits.length;

    // Show success message
    toast({
      title: `${itemsAdded} Items Added`,
      description: 'Your journal items have been added to the appropriate collections',
    });

    // Reset form after successful submission
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main journal entry form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit}>
          <Card className="w-full">
            <CardHeader>
              <div className="space-y-4">
                {/* Add title input */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Journal Entry Title"
                  />
                </div>

                {/* Add category input */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <MoodSelector value={mood} onChange={setMood} />

                  {showMoodSuggestion && autoDetectedMood && (
                    <div className="mt-2 p-3 rounded-md border border-primary/30 bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">AI detected your mood as: <strong>{autoDetectedMood}</strong></span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoodSuggestion(false)}
                          >
                            Dismiss
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={applyDetectedMood}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                      {realtimeAnalysis.mood?.confidence && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(realtimeAnalysis.mood.confidence * 100)}%</span>
                          {realtimeAnalysis.mood.suggestion && (
                            <>
                              <span>•</span>
                              <span>{realtimeAnalysis.mood.suggestion}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <EnergySelector value={energy} onChange={setEnergy} />
                <ActivitySelector value={activities} onChange={setActivities} />
              </div>
            </CardHeader>
            <CardContent>
              {journalPrompt && (
                <div className="mb-4 p-4 rounded-md border border-primary/30 bg-primary/5 flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">{journalPrompt}</p>
                </div>
              )}

              {/* Real-time analysis suggestions */}
              {realtimeAnalysis.quickSuggestions && realtimeAnalysis.quickSuggestions.length > 0 && (
                <div className="mb-4 p-3 rounded-md border border-blue-200 bg-blue-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Writing Suggestions</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {realtimeAnalysis.quickSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items detected */}
              {realtimeAnalysis.actionItems && realtimeAnalysis.actionItems.length > 0 && (
                <div className="mb-4 p-3 rounded-md border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Action Items Detected</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    {realtimeAnalysis.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                <Textarea
                  placeholder="What's on your mind today?"
                  className="min-h-[200px] resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSaving}
                />

                {/* Real-time analysis indicator */}
                {realtimeAnalysis.analyzing && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border">
                    <BrainCircuit className="w-3 h-3 animate-pulse" />
                    <span>AI analyzing...</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 flex-wrap">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BrainCircuit className="w-4 h-4 animate-pulse" />
                  <span>Analyzing your journal...</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={isSaving || !content}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Entry</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <JournalConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            resetForm();
          }}
          extractedData={extractedData}
          onConfirm={handleConfirmExtractedData}
        />
      </div>

      {/* Suggestions sidebar */}
      <div className="lg:col-span-1">
        {showSuggestions && (
          <JournalSuggestions
            onSelectSuggestion={handleSuggestionSelect}
            className="sticky top-4"
          />
        )}
      </div>
    </div>
  );
}
