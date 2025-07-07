import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, List, BrainCircuit } from "lucide-react";

interface Analysis {
  summary: string;
  sentiment: string;
  keywords: string[];
  suggestions: string[];
  insights: string;
}

interface JournalAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: Analysis | null;
}

export const JournalAnalysis = ({ isOpen, onClose, analysis }: JournalAnalysisProps) => {
  if (!analysis) return null;

  const sentimentColor =
    analysis.sentiment === 'Positive' ? 'bg-green-500' :
    analysis.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-6 rounded-lg border border-white/20 bg-black/50 text-white shadow-lg journal-analysis-modal">
        <DialogHeader className="journal-analysis-header">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Journal Analysis
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {analysis.summary}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Sentiment</h3>
            <Badge className={`${sentimentColor} text-white`}>{analysis.sentiment}</Badge>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, i) => (
                <Badge key={i} variant="secondary">{keyword}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Insights
            </h3>
            <p className="text-gray-300">{analysis.insights}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <List className="w-5 h-5 text-blue-400" />
              Suggestions
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {analysis.suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
