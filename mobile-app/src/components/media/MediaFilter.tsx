import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MediaFilterProps {
  selectedType: string;
  selectedStatus: string;
  selectedRating: number;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onRatingChange: (rating: number) => void;
}

const MEDIA_TYPES = ['All', 'Movie', 'TV Show', 'Book', 'Game'];
const MEDIA_STATUSES = ['All', 'Completed', 'In Progress', 'Planned'];
const RATING_OPTIONS = [0, 1, 2, 3, 4, 5];

export const MediaFilter: React.FC<MediaFilterProps> = ({
  selectedType,
  selectedStatus,
  selectedRating,
  onTypeChange,
  onStatusChange,
  onRatingChange,
}) => {
  const { colors } = useTheme();

  const renderFilterSection = (
    title: string,
    options: (string | number)[],
    selectedValue: string | number,
    onValueChange: (value: any) => void,
    renderOption?: (option: string | number) => string
  ) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterTitle, { color: colors.text }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option === selectedValue;
          const displayText = renderOption ? renderOption(option) : String(option);
          
          return (
            <TouchableOpacity
              key={String(option)}
              style={[
                styles.filterOption,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onValueChange(option)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color: isSelected ? colors.surface : colors.text,
                  },
                ]}
              >
                {displayText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRatingOption = (rating: number) => {
    if (rating === 0) return 'Any Rating';
    return `${rating}+ ★`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderFilterSection('Type', MEDIA_TYPES, selectedType, onTypeChange)}
      {renderFilterSection('Status', MEDIA_STATUSES, selectedStatus, onStatusChange)}
      {renderFilterSection('Rating', RATING_OPTIONS, selectedRating, onRatingChange, renderRatingOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});