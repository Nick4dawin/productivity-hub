import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodos';
import { CreateTodoData, Todo } from '@/types';

interface AddTodoForm {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

interface RouteParams {
  todo?: Todo;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#34C759', icon: 'arrow-down' },
  { value: 'medium', label: 'Medium', color: '#FF9500', icon: 'remove' },
  { value: 'high', label: 'High', color: '#FF3B30', icon: 'arrow-up' },
] as const;

const CATEGORY_OPTIONS = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Learning',
  'Shopping',
  'Home',
  'Other',
];

export const AddTodoScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { todo } = (route.params as RouteParams) || {};
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  
  const isEditing = !!todo;
  
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AddTodoForm>({
    defaultValues: {
      title: todo?.title || '',
      category: todo?.category || 'Personal',
      priority: todo?.priority || 'medium',
      dueDate: todo?.dueDate ? new Date(todo.dueDate) : undefined,
    },
  });

  const watchedDueDate = watch('dueDate');
  const watchedPriority = watch('priority');
  const watchedCategory = watch('category');

  const onSubmit = async (data: AddTodoForm) => {
    try {
      const todoData: CreateTodoData = {
        title: data.title.trim(),
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate?.toISOString(),
      };

      if (isEditing && todo) {
        await updateTodo.mutateAsync({ id: todo._id, data: todoData });
      } else {
        await createTodo.mutateAsync(todoData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'create'} todo. Please try again.`
      );
    }
  };

  const handleQuickAdd = (title: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    setValue('title', title);
    setValue('priority', priority);
  };

  const quickAddOptions = [
    { title: 'Call doctor', priority: 'high' as const },
    { title: 'Buy groceries', priority: 'medium' as const },
    { title: 'Read for 30 minutes', priority: 'low' as const },
    { title: 'Exercise', priority: 'medium' as const },
    { title: 'Pay bills', priority: 'high' as const },
    { title: 'Clean house', priority: 'low' as const },
  ];

  const renderPrioritySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: colors.text }]}>
        Priority
      </Text>
      <View style={styles.priorityOptions}>
        {PRIORITY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.priorityOption,
              {
                backgroundColor: watchedPriority === option.value ? option.color : colors.surface,
                borderColor: option.color,
              }
            ]}
            onPress={() => setValue('priority', option.value)}
          >
            <Ionicons
              name={option.icon as any}
              size={16}
              color={watchedPriority === option.value ? 'white' : option.color}
            />
            <Text
              style={[
                styles.priorityOptionText,
                {
                  color: watchedPriority === option.value ? 'white' : colors.text,
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: colors.text }]}>
        Category
      </Text>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
      >
        <Text style={[styles.categoryButtonText, { color: colors.text }]}>
          {watchedCategory}
        </Text>
        <Ionicons
          name={showCategoryPicker ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      
      {showCategoryPicker && (
        <View style={[styles.categoryOptions, { backgroundColor: colors.surface }]}>
          {CATEGORY_OPTIONS.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                { borderBottomColor: colors.border }
              ]}
              onPress={() => {
                setValue('category', category);
                setShowCategoryPicker(false);
              }}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  {
                    color: watchedCategory === category ? colors.primary : colors.text,
                    fontWeight: watchedCategory === category ? '600' : 'normal',
                  }
                ]}
              >
                {category}
              </Text>
              {watchedCategory === category && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderDueDateSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: colors.text }]}>
        Due Date (Optional)
      </Text>
      <TouchableOpacity
        style={[
          styles.dueDateButton,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar" size={20} color={colors.textSecondary} />
        <Text style={[styles.dueDateText, { color: colors.text }]}>
          {watchedDueDate ? watchedDueDate.toLocaleDateString() : 'Select date'}
        </Text>
        {watchedDueDate && (
          <TouchableOpacity
            onPress={() => setValue('dueDate', undefined)}
            style={styles.clearDateButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQuickAddOptions = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: colors.text }]}>
        Quick Add
      </Text>
      <View style={styles.quickAddGrid}>
        {quickAddOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.quickAddOption,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => handleQuickAdd(option.title, option.priority)}
          >
            <Text style={[styles.quickAddText, { color: colors.text }]}>
              {option.title}
            </Text>
            <View
              style={[
                styles.quickAddPriority,
                { backgroundColor: PRIORITY_OPTIONS.find(p => p.value === option.priority)?.color }
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isEditing ? 'Edit Todo' : 'Add Todo'}
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || createTodo.isPending || updateTodo.isPending}
          >
            <Text
              style={[
                styles.saveButton,
                {
                  color: isValid ? colors.primary : colors.textSecondary,
                }
              ]}
            >
              {isEditing ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.formCard}>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Todo title is required',
                minLength: {
                  value: 1,
                  message: 'Title must be at least 1 character',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Todo Title"
                  placeholder="What do you need to do?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  autoFocus={!isEditing}
                  multiline
                  numberOfLines={2}
                />
              )}
            />

            {!isEditing && renderQuickAddOptions()}
            {renderCategorySelector()}
            {renderPrioritySelector()}
            {renderDueDateSelector()}
          </Card>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Update Todo' : 'Create Todo'}
            onPress={handleSubmit(onSubmit)}
            loading={createTodo.isPending || updateTodo.isPending}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        open={showDatePicker}
        date={watchedDueDate || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setValue('dueDate', date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 16,
  },
  categoryOptions: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  dueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  dueDateText: {
    flex: 1,
    fontSize: 16,
  },
  clearDateButton: {
    padding: 4,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAddOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickAddText: {
    fontSize: 14,
    flex: 1,
  },
  quickAddPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});