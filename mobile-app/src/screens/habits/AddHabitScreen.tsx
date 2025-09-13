import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCreateHabit, useUpdateHabit } from '@/hooks/useHabits';
import { Habit, CreateHabitData } from '@/types';

const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Social',
  'Creative',
  'Finance',
  'Personal Care',
  'Other',
];

const HABIT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
];

interface RouteParams {
  habit?: Habit;
}

export const AddHabitScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = (route.params as RouteParams) || {};

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();

  const isEditing = !!habit;

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedCategory(habit.category);
      setSelectedColor(habit.color || HABIT_COLORS[0]);
    }
  }, [habit]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Habit name must be at least 2 characters';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const habitData: CreateHabitData = {
      name: name.trim(),
      category: selectedCategory,
      color: selectedColor,
    };

    try {
      if (isEditing && habit) {
        await updateHabitMutation.mutateAsync({
          id: habit._id,
          data: habitData,
        });
      } else {
        await createHabitMutation.mutateAsync(habitData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'create'} habit. Please try again.`
      );
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
      <View style={styles.categoryGrid}>
        {HABIT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              {
                backgroundColor:
                  selectedCategory === category ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category ? colors.surface : colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errors.category}
        </Text>
      )}
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Color</Text>
      <View style={styles.colorGrid}>
        {HABIT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorItem,
              {
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 1,
                borderColor: selectedColor === color ? colors.text : colors.border,
              },
            ]}
            onPress={() => setSelectedColor(color)}
          >
            {selectedColor === color && (
              <Text style={styles.colorCheckmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isEditing ? 'Edit Habit' : 'Add Habit'}
        showBackButton
        onLeftPress={handleCancel}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Habit Name
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter habit name"
            error={errors.name}
            maxLength={50}
            autoFocus={!isEditing}
          />
        </View>

        {renderCategorySelector()}
        {renderColorSelector()}

        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor: colors.surface,
                borderLeftColor: selectedColor,
              },
            ]}
          >
            <View style={styles.previewContent}>
              <View
                style={[
                  styles.previewCheckbox,
                  { borderColor: colors.border },
                ]}
              />
              <View style={styles.previewInfo}>
                <Text
                  style={[
                    styles.previewName,
                    { color: colors.text },
                  ]}
                >
                  {name || 'Habit Name'}
                </Text>
                <Text
                  style={[
                    styles.previewCategory,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selectedCategory || 'Category'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={isEditing ? 'Update' : 'Create'}
          onPress={handleSave}
          loading={createHabitMutation.isPending || updateHabitMutation.isPending}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorCheckmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});