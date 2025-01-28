"use client";

import React from 'react';
import { JournalEntry } from '@/components/journal-entry';
import { JournalAnalysis } from '@/components/journal-analysis';
import { useJournal } from '@/hooks/use-journal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JournalPage() {
  const { entries, isLoading, createEntry } = useJournal();
  const latestEntry = entries[0];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Journal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">New Entry</h2>
          <JournalEntry onSave={createEntry} isLoading={isLoading} />
        </div>

        {latestEntry?.analysis && (
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
            <JournalAnalysis analysis={latestEntry.analysis} />
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Previous Entries</h2>
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{entry.mood}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Energy: {entry.energy}
                      </div>
                    </div>
                    <p className="text-sm mb-2">{entry.content}</p>
                    {entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.activities.map((activity, index) => (
                          <span
                            key={index}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="calendar">
              <div className="text-center text-muted-foreground">
                Calendar view coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
