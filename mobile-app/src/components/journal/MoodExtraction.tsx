import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { JournalEntry } from '@/types';
import { useCreateMood } from '@/hooks/useMood';

interface MoodExtractionProps {
  entry: JournalEntry;
  onMoodSaved?: () => void;
}

interface ExtractedMood {
  mood: string;
  confidence: number;
  reasoning: string;
  suggestedActivities: string[];
}

export const MoodExtraction: React.FC<MoodExtractionProps> = ({
  entry,
  onMoodSaved,
}) => {
  const { colors } = useTheme();
  const [extractedMood, setExtractedMood] = useState<ExtractedMood | null>(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const createMoodMutation = useCreateMood();

  useEffect(() => {
    // Extract mood from journal content using simple keyword analysis
    // In a real app, this would call an AI service
    extractMoodFromContent();
  }, [entry]);

  const extractMoodFromContent = () => {
    const content = (entry.title + ' ' + entry.content).toLowerCase();
    
    // Simple keyword-based mood extraction
    const moodKeywords = {
      'very-happy': ['amazing', 'fantastic', 'incredible', 'wonderful', 'perfect', 'best day', 'ecstatic', 'thrilled'],
      'happy': ['good', 'great', 'nice', 'pleasant', 'positive', 'glad', 'cheerful', 'content', 'satisfied'],
      'neutral': ['okay', 'fine', 'normal', 'regular', 'usual', 'average'],
      'sad': ['bad', 'difficult', 'hard', 'tough', 'disappointed', 'upset', 'down', 'low'],
      'very-sad': ['terrible', 'awful', 'horrible', 'devastating', 'depressed', 'miserable', 'worst'],
    };

    const moodScores: { [key: string]: number } = {};
    let totalMatches = 0;

    // Count keyword matches for each mood
    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      moodScores[mood] = matches;
      totalMatches += matches;
    });

    if (totalMatches === 0) {
      // No clear mood indicators found
      return;
    }

    // Find the mood with the highest score
    const detectedMood = Object.keys(moodScores).reduce((a, b) => 
      moodScores[a] > moodScores[b] ? a : b
    );

    const confidence = Math.min(95, (moodScores[detectedMood] / totalMatches) * 100);

    // Generate reasoning
    const matchedKeywords = moodKeywords[detectedMood as keyof typeof moodKeywords]
      .filter(keyword => content.includes(keyword));

    const reasoning = `Based on words like "${matchedKeywords.slice(0, 3).join('", "')}" in your entry.`;

    // Suggest activities based on mood
    const activitySuggestions = {
      'very-happy': ['Celebrate', 'Share with friends', 'Reflect on success'],
      'happy': ['Exercise', 'Creative activities', 'Social time'],
      'neutral': ['Light exercise', 'Reading', 'Planning'],
      'sad': ['Self-care', 'Talk to someone', 'Gentle activities'],
      'very-sad': ['Rest', 'Seek support', 'Professional help'],
    };

    setExtractedMood({
      mood: detectedMood,
      confidence,
      reasoning,
      suggestedActivities: activitySuggestions[detectedMood as keyof typeof activitySuggestions] || [],
    });

    setSelectedMood(detectedMood);
    setIsVisible(true);
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      await createMoodMutation.mutateAsync({
        mood: selectedMood,
        energy: 'medium',
        activities: extractedMood?.suggestedActivities || [],
        note: `Extracted from journal: "${entry.title}"`,
        date: entry.date,
      });

      Alert.alert('Success', 'Mood entry saved successfully!');
      onMoodSaved?.();
      setIsVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'very-sad': return '😢';
      case 'sad': return '😔';
      case 'neutral': return '😐';
      case 'happy': return '😊';
      case 'very-happy': return '😄';
      default: return '😐';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#9E9E9E';
  };

  if (!extractedMood || !isVisible) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="psychology" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Mood Detected
          </Text>
        </View>
        <TouchableOpacity onPress={handleDismiss}>
          <Icon name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.detectionResult}>
        <View style={styles.moodDisplay}>
          <Text style={styles.moodEmoji}>
            {getMoodEmoji(extractedMood.mood)}
          </Text>
          <View style={styles.moodInfo}>
            <Text style={[styles.moodLabel, { color: colors.text }]}>
              {extractedMood.mood.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <View style={styles.confidenceContainer}>
              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(extractedMood.confidence) }
                ]}
              >
                <Text style={styles.confidenceText}>
                  {Math.round(extractedMood.confidence)}% confident
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.reasoning, { color: colors.textSecondary }]}>
          {extractedMood.reasoning}
        </Text>
      </View>

      <View style={styles.adjustSection}>
        <Text style={[styles.adjustTitle, { color: colors.text }]}>
          Adjust if needed:
        </Text>
        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
          size="small"
          showLabels={false}
        />
      </View>

      {extractedMood.suggestedActivities.length > 0 && (
        <View style={styles.activitiesSection}>
          <Text style={[styles.activitiesTitle, { color: colors.text }]}>
            Suggested activities:
          </Text>
          <View style={styles.activitiesContainer}>
            {extractedMood.suggestedActivities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityChip,
                  { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Text style={[styles.activityText, { color: colors.primary }]}>
                  {activity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Skip"
          onPress={handleDismiss}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Save Mood"
          onPress={handleSaveMood}
          loading={createMoodMutation.isPending}
          style={styles.actionButton}
        />
      </View>
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detectionResult: {
    marginBottom: 16,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  confidenceContainer: {
    flexDirection: 'row',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  reasoning: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  adjustSection: {
    marginBottom: 16,
  },
  adjustTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});