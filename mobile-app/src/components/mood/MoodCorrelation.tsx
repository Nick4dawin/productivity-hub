import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Mood, JournalEntry } from '@/types';

interface MoodCorrelationProps {
  moods: Mood[];
  journalEntries: JournalEntry[];
}

interface CorrelationInsight {
  type: 'activity' | 'time' | 'journal';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export const MoodCorrelation: React.FC<MoodCorrelationProps> = ({
  moods,
  journalEntries,
}) => {
  const { colors } = useTheme();

  const getMoodValue = (mood: string): number => {
    switch (mood) {
      case 'very-sad': return 1;
      case 'sad': return 2;
      case 'neutral': return 3;
      case 'happy': return 4;
      case 'very-happy': return 5;
      default: return 3;
    }
  };

  const analyzeActivityCorrelations = (): CorrelationInsight[] => {
    const insights: CorrelationInsight[] = [];
    
    if (moods.length < 5) return insights;

    // Analyze activity-mood correlations
    const activityMoodMap: { [activity: string]: number[] } = {};
    
    moods.forEach(mood => {
      const moodValue = getMoodValue(mood.mood);
      mood.activities.forEach(activity => {
        if (!activityMoodMap[activity]) {
          activityMoodMap[activity] = [];
        }
        activityMoodMap[activity].push(moodValue);
      });
    });

    // Find activities with strong positive correlation
    Object.entries(activityMoodMap).forEach(([activity, moodValues]) => {
      if (moodValues.length >= 3) {
        const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
        const overallAvg = moods.reduce((sum, mood) => sum + getMoodValue(mood.mood), 0) / moods.length;
        
        if (avgMood > overallAvg + 0.5) {
          insights.push({
            type: 'activity',
            title: `${activity} boosts your mood`,
            description: `You tend to feel ${(avgMood - overallAvg).toFixed(1)} points happier when doing ${activity.toLowerCase()}.`,
            confidence: Math.min(95, 60 + (moodValues.length * 5)),
          });
        } else if (avgMood < overallAvg - 0.5) {
          insights.push({
            type: 'activity',
            title: `${activity} affects your mood`,
            description: `Your mood tends to be ${(overallAvg - avgMood).toFixed(1)} points lower when doing ${activity.toLowerCase()}.`,
            confidence: Math.min(95, 60 + (moodValues.length * 5)),
          });
        }
      }
    });

    return insights.slice(0, 3); // Return top 3 insights
  };

  const analyzeTimePatterns = (): CorrelationInsight[] => {
    const insights: CorrelationInsight[] = [];
    
    if (moods.length < 7) return insights;

    // Analyze day of week patterns
    const dayMoodMap: { [day: number]: number[] } = {};
    
    moods.forEach(mood => {
      const date = new Date(mood.date);
      const dayOfWeek = date.getDay();
      const moodValue = getMoodValue(mood.mood);
      
      if (!dayMoodMap[dayOfWeek]) {
        dayMoodMap[dayOfWeek] = [];
      }
      dayMoodMap[dayOfWeek].push(moodValue);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const overallAvg = moods.reduce((sum, mood) => sum + getMoodValue(mood.mood), 0) / moods.length;

    Object.entries(dayMoodMap).forEach(([day, moodValues]) => {
      if (moodValues.length >= 2) {
        const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
        const dayName = dayNames[parseInt(day)];
        
        if (avgMood > overallAvg + 0.3) {
          insights.push({
            type: 'time',
            title: `${dayName}s are your best days`,
            description: `Your mood is typically ${(avgMood - overallAvg).toFixed(1)} points higher on ${dayName}s.`,
            confidence: Math.min(90, 50 + (moodValues.length * 8)),
          });
        } else if (avgMood < overallAvg - 0.3) {
          insights.push({
            type: 'time',
            title: `${dayName}s are challenging`,
            description: `Your mood tends to be ${(overallAvg - avgMood).toFixed(1)} points lower on ${dayName}s.`,
            confidence: Math.min(90, 50 + (moodValues.length * 8)),
          });
        }
      }
    });

    return insights.slice(0, 2);
  };

  const analyzeJournalCorrelations = (): CorrelationInsight[] => {
    const insights: CorrelationInsight[] = [];
    
    if (journalEntries.length < 3 || moods.length < 3) return insights;

    // Find journal entries with AI analysis and corresponding moods
    const correlatedEntries = journalEntries
      .filter(entry => entry.analysis?.sentiment)
      .map(entry => {
        const entryDate = new Date(entry.date).toDateString();
        const correspondingMood = moods.find(mood => 
          new Date(mood.date).toDateString() === entryDate
        );
        
        return {
          entry,
          mood: correspondingMood,
        };
      })
      .filter(item => item.mood);

    if (correlatedEntries.length >= 3) {
      const sentimentMoodMap: { [sentiment: string]: number[] } = {};
      
      correlatedEntries.forEach(({ entry, mood }) => {
        if (entry.analysis?.sentiment && mood) {
          const sentiment = entry.analysis.sentiment.toLowerCase();
          const moodValue = getMoodValue(mood.mood);
          
          if (!sentimentMoodMap[sentiment]) {
            sentimentMoodMap[sentiment] = [];
          }
          sentimentMoodMap[sentiment].push(moodValue);
        }
      });

      // Check correlation between journal sentiment and mood
      const positiveEntries = sentimentMoodMap['positive'] || [];
      const negativeEntries = sentimentMoodMap['negative'] || [];
      
      if (positiveEntries.length >= 2 && negativeEntries.length >= 2) {
        const posAvg = positiveEntries.reduce((sum, val) => sum + val, 0) / positiveEntries.length;
        const negAvg = negativeEntries.reduce((sum, val) => sum + val, 0) / negativeEntries.length;
        
        if (posAvg > negAvg + 0.5) {
          insights.push({
            type: 'journal',
            title: 'Writing reflects your mood',
            description: `Your journal sentiment aligns with your mood tracking. Positive entries correlate with ${posAvg.toFixed(1)}/5 mood ratings.`,
            confidence: 75,
          });
        }
      }
    }

    return insights;
  };

  const getAllInsights = (): CorrelationInsight[] => {
    return [
      ...analyzeActivityCorrelations(),
      ...analyzeTimePatterns(),
      ...analyzeJournalCorrelations(),
    ].sort((a, b) => b.confidence - a.confidence);
  };

  const insights = getAllInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🏃‍♂️';
      case 'time': return '📅';
      case 'journal': return '📝';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#9E9E9E';
  };

  if (insights.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Mood Insights
        </Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Keep tracking your mood and activities to discover patterns and insights!
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            We need at least 5-7 mood entries to generate meaningful correlations.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Mood Insights
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {insights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightCard,
              { backgroundColor: colors.background }
            ]}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleContainer}>
                <Text style={styles.insightIcon}>
                  {getInsightIcon(insight.type)}
                </Text>
                <Text style={[styles.insightTitle, { color: colors.text }]}>
                  {insight.title}
                </Text>
              </View>
              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(insight.confidence) }
                ]}
              >
                <Text style={styles.confidenceText}>
                  {insight.confidence}%
                </Text>
              </View>
            </View>
            
            <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
              {insight.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});