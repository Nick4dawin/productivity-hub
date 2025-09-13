import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MoodOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'very-sad',
    label: 'Very Sad',
    emoji: '😢',
    color: '#FF4444',
  },
  {
    value: 'sad',
    label: 'Sad',
    emoji: '😔',
    color: '#FF8A80',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    color: '#FFB74D',
  },
  {
    value: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#81C784',
  },
  {
    value: 'very-happy',
    label: 'Very Happy',
    emoji: '😄',
    color: '#4CAF50',
  },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  size = 'medium',
  showLabels = true,
}) => {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          button: styles.smallButton,
          emoji: styles.smallEmoji,
          label: styles.smallLabel,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          button: styles.largeButton,
          emoji: styles.largeEmoji,
          label: styles.largeLabel,
        };
      default:
        return {
          container: styles.mediumContainer,
          button: styles.mediumButton,
          emoji: styles.mediumEmoji,
          label: styles.mediumLabel,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const handleMoodPress = (mood: MoodOption) => {
    onMoodSelect(mood.value);
    
    // Add haptic feedback if available
    if (typeof require !== 'undefined') {
      try {
        const HapticFeedback = require('react-native-haptic-feedback');
        HapticFeedback.trigger('impactLight');
      } catch (error) {
        // Haptic feedback not available
      }
    }
  };

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {MOOD_OPTIONS.map((mood) => {
        const isSelected = selectedMood === mood.value;
        
        return (
          <View key={mood.value} style={styles.moodItem}>
            <TouchableOpacity
              style={[
                styles.moodButton,
                sizeStyles.button,
                {
                  backgroundColor: isSelected ? mood.color : colors.surface,
                  borderColor: mood.color,
                  borderWidth: isSelected ? 0 : 2,
                },
              ]}
              onPress={() => handleMoodPress(mood)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emoji, sizeStyles.emoji]}>
                {mood.emoji}
              </Text>
            </TouchableOpacity>
            
            {showLabels && (
              <Text
                style={[
                  styles.label,
                  sizeStyles.label,
                  {
                    color: isSelected ? mood.color : colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {mood.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodItem: {
    alignItems: 'center',
  },
  moodButton: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Small size styles
  smallContainer: {
    gap: 8,
  },
  smallButton: {
    width: 40,
    height: 40,
  },
  smallEmoji: {
    fontSize: 20,
  },
  smallLabel: {
    fontSize: 10,
  },
  
  // Medium size styles
  mediumContainer: {
    gap: 12,
  },
  mediumButton: {
    width: 60,
    height: 60,
  },
  mediumEmoji: {
    fontSize: 28,
  },
  mediumLabel: {
    fontSize: 12,
  },
  
  // Large size styles
  largeContainer: {
    gap: 16,
  },
  largeButton: {
    width: 80,
    height: 80,
  },
  largeEmoji: {
    fontSize: 36,
  },
  largeLabel: {
    fontSize: 14,
  },
});