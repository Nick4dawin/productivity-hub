import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface JournalEntry {
  _id: string;
  content: string;
  mood: string;
  energy: string;
  activities: string[];
  analysis?: {
    summary: string;
    sentiment: string;
    keywords: string[];
    insights: string;
    suggestions: string[];
    extracted?: {
      mood?: string;
      todos?: Array<{
        title: string;
        time: "past" | "future";
        dueDate?: string;
        priority?: string;
      }>;
      media?: Array<{
        title: string;
        type: string;
        status: string;
      }>;
      habits?: Array<{
        name: string;
        status: string;
        frequency?: string;
      }>;
    };
  };
  date: string;
}

interface JournalEntryData {
  content: string;
  mood: string;
  energy: string;
  activities: string[];
  title?: string; // Make title optional but include it
  category?: string; // Make category optional but include it
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal');
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal entries',
        variant: 'destructive',
      });
    }
  };

  const createEntry = async (entryData: JournalEntryData): Promise<JournalEntry> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
      
      toast({
        title: 'Success',
        description: 'Journal entry saved successfully',
      });
      
      return newEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, entryData: Partial<JournalEntryData>): Promise<JournalEntry> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) throw new Error('Failed to update entry');

      const updatedEntry = await response.json();
      setEntries(entries.map(entry => 
        entry._id === id ? updatedEntry : entry
      ));
      
      toast({
        title: 'Success',
        description: 'Journal entry updated successfully',
      });
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      setEntries(entries.filter(entry => entry._id !== id));
      
      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete journal entry',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
