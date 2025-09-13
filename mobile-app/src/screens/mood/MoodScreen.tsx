import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { ActivitySelector } from '@/components/mood/ActivitySelector';
import { MoodHistory } from '@/components/mood/MoodHistory';
import { MoodCorrelation } from '@/components/mood/MoodCorrelation';
import {
  useMoods,
  useCreateMood,
  getMoodForDate,
  getCommonActivities,
} from '@/hooks/useMood';
import { useJournalEntries } from '@/hooks/useJournal';
import { CreateMoodData } from '@/types';

export const MoodScreen: React.FC = () => {
  const { colors } = useTheme();
  
  // State for mood entry
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [currentView, setCurrentView] = useState<'entry' | 'history'>('entry');

  // API hooks
  const { data: moods = [], isLoading, refetch } = useMoods();
  const { data: journalEntries = [] } = useJournalEntries();
  const createMoodMutation = useCreateMood();

  // Get today's mood if it exists
  const today = new Date().toISOString().split('T')[0];
  const todaysMood = getMoodForDate(moods, today);
  
  // Get common activities for suggestions
  const commonActivities = getCommonActivities(moods);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Missing Mood', 'Please select your current mood.');
      return;
    }

    const moodData: CreateMoodData = {
      mood: selectedMood,
      energy: 'medium', // Could be expanded to include energy selector
      activities: selectedActivities,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    try {
      await createMoodMutation.mutateAsync(moodData);
      
      // Reset form
      setSelectedMood('');
      setSelectedActivities([]);
      setNote('');
      
      Alert.alert('Success', 'Your mood has been logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
    }
  };

  const handleQuickMoodLog = (mood: string) => {
    setSelectedMood(mood);
    
    // Auto-save if no activities or note needed
    const quickMoodData: CreateMoodData = {
      mood,
      energy: 'medium',
      activities: [],
      note: '',
      date: new Date().toISOString(),
    };

    createMoodMutation.mutate(quickMoodData);
  };

  const renderTodaysMoodCard = () => {
    if (!todaysMood) return null;

    const getMoodEmoji = (moodValue: string) => {
      switch (moodValue) {
        case 'very-sad': return '😢';
        case 'sad': return '😔';
        case 'neutral': return '😐';
        case 'happy': return '😊';
        case 'very-happy': return '😄';
        default: return '😐';
      }
    };

    return (
      <Card style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Text style={[styles.todayTitle, { color: colors.text }]}>
            Today's Mood
          </Text>
          <Text style={styles.todayEmoji}>
            {getMoodEmoji(todaysMood.mood)}
          </Text>
        </View>
        
        {todaysMood.activities.length > 0 && (
          <View style={styles.todayActivities}>
            <Text style={[styles.activitiesLabel, { color: colors.textSecondary }]}>
              Activities:
            </Text>
            <Text style={[styles.activitiesText, { color: colors.text }]}>
              {todaysMood.activities.join(', ')}
            </Text>
          </View>
        )}
        
        {todaysMood.note && (
          <Text style={[styles.todayNote, { color: colors.textSecondary }]}>
            "{todaysMood.note}"
          </Text>
        )}
      </Card>
    );
  };

  const renderMoodEntry = () => (
    <ScrollView style={styles.entryContainer} showsVerticalScrollIndicator={false}>
      {renderTodaysMoodCard()}
      
      <Card style={styles.entryCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How are you feeling?
        </Text>
        
        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
          size="large"
        />
        
        <View style={styles.quickActions}>
          <Text style={[styles.quickActionsLabel, { color: colors.textSecondary }]}>
            Quick log:
          </Text>
          <View style={styles.quickButtons}>
            {['very-happy', 'happy', 'neutral', 'sad', 'very-sad'].map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[styles.quickButton, { backgroundColor: colors.surface }]}
                onPress={() => handleQuickMoodLog(mood)}
              >
                <Text style={styles.quickButtonEmoji}>
                  {mood === 'very-sad' ? '😢' :
                   mood === 'sad' ? '😔' :
                   mood === 'neutral' ? '😐' :
                   mood === 'happy' ? '😊' : '😄'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <Card style={styles.activitiesCard}>
        <ActivitySelector
          selectedActivities={selectedActivities}
          onActivitiesChange={setSelectedActivities}
          commonActivities={commonActivities}
        />
      </Card>

      <Card style={styles.noteCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Add a note (optional)
        </Text>
        <Input
          placeholder="What's on your mind?"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={styles.noteInput}
        />
      </Card>

      <Button
        title="Save Mood Entry"
        onPress={handleSaveMood}
        disabled={!selectedMood || createMoodMutation.isPending}
        loading={createMoodMutation.isPending}
        style={styles.saveButton}
      />
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
      <MoodHistory moods={moods} />
      <MoodCorrelation moods={moods} journalEntries={journalEntries} />
    </ScrollView>
  );

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: currentView === 'entry' ? colors.primary : colors.surface,
          },
        ]}
        onPress={() => setCurrentView('entry')}
      >
        <Icon
          name="add-circle-outline"
          size={20}
          color={currentView === 'entry' ? 'white' : colors.text}
        />
        <Text
          style={[
            styles.toggleText,
            {
              color: currentView === 'entry' ? 'white' : colors.text,
            },
          ]}
        >
          Log Mood
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: currentView === 'history' ? colors.primary : colors.surface,
          },
        ]}
        onPress={() => setCurrentView('history')}
      >
        <Icon
          name="history"
          size={20}
          color={currentView === 'history' ? 'white' : colors.text}
        />
        <Text
          style={[
            styles.toggleText,
            {
              color: currentView === 'history' ? 'white' : colors.text,
            },
          ]}
        >
          History
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Mood Tracking" />
      
      {renderViewToggle()}
      
      {currentView === 'entry' ? renderMoodEntry() : renderHistory()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  entryContainer: {
    flex: 1,
    padding: 16,
  },
  todayCard: {
    marginBottom: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayEmoji: {
    fontSize: 24,
  },
  todayActivities: {
    marginBottom: 8,
  },
  activitiesLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitiesText: {
    fontSize: 14,
  },
  todayNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  entryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    marginTop: 20,
  },
  quickActionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickButtonEmoji: {
    fontSize: 20,
  },
  activitiesCard: {
    marginBottom: 16,
  },
  noteCard: {
    marginBottom: 16,
  },
  noteInput: {
    minHeight: 80,
  },
  saveButton: {
    marginBottom: 32,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
});