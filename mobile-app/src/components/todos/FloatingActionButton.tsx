import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCreateTodo } from '@/hooks/useTodos';
import { CreateTodoData } from '@/types';

interface FloatingActionButtonProps {
  onAddTodo?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddTodo,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const createTodo = useCreateTodo();

  const rotateAnim = new Animated.Value(0);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }

    try {
      const todoData: CreateTodoData = {
        title: quickTitle.trim(),
        category: 'Personal',
        priority: 'medium',
      };

      await createTodo.mutateAsync(todoData);
      setQuickTitle('');
      setShowQuickAdd(false);
      setIsExpanded(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create todo. Please try again.');
    }
  };

  const handleFullAdd = () => {
    setIsExpanded(false);
    onAddTodo?.();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const quickAddOptions = [
    {
      icon: 'flash',
      label: 'Quick Add',
      onPress: () => setShowQuickAdd(true),
      color: '#FF9500',
    },
    {
      icon: 'add-circle',
      label: 'Full Form',
      onPress: handleFullAdd,
      color: '#007AFF',
    },
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Expanded Options */}
        {isExpanded && (
          <View style={styles.expandedOptions}>
            {quickAddOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color }
                ]}
                onPress={option.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name={option.icon as any} size={20} color="white" />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Main FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Quick Add Modal */}
      <Modal
        visible={showQuickAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickAdd(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Quick Add Todo
            </Text>
            
            <TextInput
              style={[
                styles.quickInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textSecondary}
              value={quickTitle}
              onChangeText={setQuickTitle}
              autoFocus
              multiline
              numberOfLines={2}
              maxLength={100}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setQuickTitle('');
                  setShowQuickAdd(false);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleQuickAdd}
                disabled={!quickTitle.trim() || createTodo.isPending}
              >
                <Text style={styles.addButtonText}>
                  {createTodo.isPending ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  expandedOptions: {
    marginBottom: 12,
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    // backgroundColor set dynamically
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});