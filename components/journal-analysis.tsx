import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JournalAnalysisProps {
  analysis: {
    summary: string;
    insights: string;
    suggestions: string[];
    activities: string[];
    affirmations: string[];
    motivation: string;
    consolation: string;
  };
}

export function JournalAnalysis({ analysis }: JournalAnalysisProps) {
  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.insights}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-muted-foreground">{suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.activities.map((activity, index) => (
                <li key={index} className="text-muted-foreground">{activity}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Affirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.affirmations.map((affirmation, index) => (
                <li key={index} className="text-muted-foreground italic">"{affirmation}"</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.motivation}</p>
          </CardContent>
        </Card>

        {analysis.consolation && (
          <Card>
            <CardHeader>
              <CardTitle>Support & Encouragement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysis.consolation}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
