import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { JournalEntry, JournalAnalysis } from '@/types';
import { useAnalyzeJournalEntry } from '@/hooks/useJournal';

interface AIAnalysisProps {
  entry: JournalEntry;
  onAnalysisComplete?: (analysis: JournalAnalysis) => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  entry,
  onAnalysisComplete,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const analyzeEntryMutation = useAnalyzeJournalEntry();

  const handleAnalyze = async () => {
    try {
      const analysis = await analyzeEntryMutation.mutateAsync(entry._id);
      onAnalysisComplete?.(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#F44336';
      case 'neutral':
        return '#FF9800';
      default:
        return colors.textSecondary;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'sentiment-very-satisfied';
      case 'negative':
        return 'sentiment-very-dissatisfied';
      case 'neutral':
        return 'sentiment-neutral';
      default:
        return 'sentiment-neutral';
    }
  };

  const renderAnalysisContent = () => {
    if (!entry.analysis) {
      return (
        <View style={styles.noAnalysisContainer}>
          <Icon name="psychology" size={48} color={colors.primary} />
          <Text style={[styles.noAnalysisTitle, { color: colors.text }]}>
            AI Analysis Available
          </Text>
          <Text style={[styles.noAnalysisDescription, { color: colors.textSecondary }]}>
            Get insights about your mood, key themes, and personalized suggestions from your journal entry.
          </Text>
          <Button
            title="Analyze Entry"
            onPress={handleAnalyze}
            loading={analyzeEntryMutation.isPending}
            style={styles.analyzeButton}
          />
        </View>
      );
    }

    const { analysis } = entry;

    return (
      <View style={styles.analysisContent}>
        {/* Sentiment Analysis */}
        <View style={styles.sentimentContainer}>
          <View style={styles.sentimentHeader}>
            <Icon
              name={getSentimentIcon(analysis.sentiment)}
              size={24}
              color={getSentimentColor(analysis.sentiment)}
            />
            <Text style={[styles.sentimentLabel, { color: colors.text }]}>
              Sentiment
            </Text>
          </View>
          <Text
            style={[
              styles.sentimentValue,
              { color: getSentimentColor(analysis.sentiment) }
            ]}
          >
            {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Summary
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            {analysis.summary}
          </Text>
        </View>

        {/* Keywords */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Key Themes
            </Text>
            <View style={styles.keywordsContainer}>
              {analysis.keywords.map((keyword, index) => (
                <View
                  key={index}
                  style={[
                    styles.keywordChip,
                    { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[styles.keywordText, { color: colors.primary }]}>
                    {keyword}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Insights */}
        {analysis.insights && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Insights
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {analysis.insights}
            </Text>
          </View>
        )}

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suggestions
            </Text>
            {analysis.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Icon name="lightbulb-outline" size={16} color={colors.primary} />
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Re-analyze Button */}
        <Button
          title="Re-analyze"
          onPress={handleAnalyze}
          loading={analyzeEntryMutation.isPending}
          variant="outline"
          style={styles.reanalyzeButton}
        />
      </View>
    );
  };

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Icon name="psychology" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            AI Analysis
          </Text>
          {entry.analysis && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getSentimentColor(entry.analysis.sentiment) }
              ]}
            >
              <Text style={styles.statusText}>
                {entry.analysis.sentiment}
              </Text>
            </View>
          )}
        </View>
        <Icon
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {analyzeEntryMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Analyzing your journal entry...
              </Text>
            </View>
          ) : (
            renderAnalysisContent()
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  noAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noAnalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noAnalysisDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  analyzeButton: {
    minWidth: 150,
  },
  analysisContent: {
    gap: 16,
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sentimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sentimentValue: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  reanalyzeButton: {
    marginTop: 8,
  },
});