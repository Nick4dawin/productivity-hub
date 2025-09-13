import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/common/Button';

interface ActivitySelectorProps {
  selectedActivities: string[];
  onActivitiesChange: (activities: string[]) => void;
  commonActivities: string[];
  maxSelections?: number;
}

const DEFAULT_ACTIVITIES = [
  'Work', 'Exercise', 'Reading', 'Socializing', 'Cooking',
  'Music', 'Gaming', 'Walking', 'Shopping', 'Cleaning',
  'Learning', 'Relaxing', 'Family Time', 'Hobbies', 'Travel',
  'Movies', 'Sports', 'Art', 'Meditation', 'Volunteering',
];

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivities,
  onActivitiesChange,
  commonActivities,
  maxSelections = 10,
}) => {
  const { colors } = useTheme();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customActivity, setCustomActivity] = useState('');

  // Combine common activities with defaults, removing duplicates
  const allActivities = [
    ...new Set([...commonActivities, ...DEFAULT_ACTIVITIES])
  ].sort();

  const handleActivityToggle = (activity: string) => {
    const isSelected = selectedActivities.includes(activity);
    
    if (isSelected) {
      // Remove activity
      onActivitiesChange(selectedActivities.filter(a => a !== activity));
    } else {
      // Add activity if under limit
      if (selectedActivities.length < maxSelections) {
        onActivitiesChange([...selectedActivities, activity]);
      }
    }
  };

  const handleAddCustomActivity = () => {
    const activity = customActivity.trim();
    if (activity && !selectedActivities.includes(activity) && selectedActivities.length < maxSelections) {
      onActivitiesChange([...selectedActivities, activity]);
      setCustomActivity('');
      setShowCustomInput(false);
    }
  };

  const isSelected = (activity: string) => selectedActivities.includes(activity);

  const getActivityColor = (activity: string) => {
    // Generate consistent colors for activities
    const colorList = [
      colors.primary,
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < activity.length; i++) {
      hash = activity.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colorList[Math.abs(hash) % colorList.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Activities ({selectedActivities.length}/{maxSelections})
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCustomInput(true)}
          disabled={selectedActivities.length >= maxSelections}
        >
          <Icon name="add" size={16} color="white" />
          <Text style={styles.addButtonText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.activitiesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.activitiesGrid}>
          {allActivities.map((activity) => {
            const selected = isSelected(activity);
            const activityColor = getActivityColor(activity);
            
            return (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.activityChip,
                  {
                    backgroundColor: selected ? activityColor : colors.surface,
                    borderColor: activityColor,
                  },
                ]}
                onPress={() => handleActivityToggle(activity)}
                disabled={!selected && selectedActivities.length >= maxSelections}
              >
                <Text
                  style={[
                    styles.activityText,
                    {
                      color: selected ? 'white' : activityColor,
                    },
                  ]}
                >
                  {activity}
                </Text>
                {selected && (
                  <Icon
                    name="check"
                    size={14}
                    color="white"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Selected Activities Summary */}
      {selectedActivities.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedTitle, { color: colors.text }]}>
            Selected:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedList}
          >
            {selectedActivities.map((activity) => (
              <View
                key={activity}
                style={[
                  styles.selectedChip,
                  { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Text style={[styles.selectedText, { color: colors.primary }]}>
                  {activity}
                </Text>
                <TouchableOpacity
                  onPress={() => handleActivityToggle(activity)}
                  style={styles.removeButton}
                >
                  <Icon name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Custom Activity Modal */}
      <Modal
        visible={showCustomInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Custom Activity
            </Text>
            
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter activity name..."
              placeholderTextColor={colors.textSecondary}
              value={customActivity}
              onChangeText={setCustomActivity}
              autoFocus
              maxLength={30}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomActivity('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add"
                onPress={handleAddCustomActivity}
                disabled={!customActivity.trim()}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  activitiesContainer: {
    flex: 1,
    maxHeight: 200,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 2,
  },
  selectedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedList: {
    flexDirection: 'row',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    gap: 4,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});