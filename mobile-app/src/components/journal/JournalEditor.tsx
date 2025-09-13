import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/common/Input';

interface JournalEditorProps {
  title: string;
  content: string;
  category: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
  placeholder?: string;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  title,
  content,
  category,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  categories,
  placeholder = 'Start writing your journal entry...',
}) => {
  const { colors } = useTheme();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const defaultCategories = [
    'Personal',
    'Work',
    'Health',
    'Relationships',
    'Goals',
    'Gratitude',
    'Reflection',
    'Ideas',
  ];

  const allCategories = [...new Set([...defaultCategories, ...categories])];

  const handleCategorySelect = (selectedCategory: string) => {
    onCategoryChange(selectedCategory);
    setShowCategoryPicker(false);
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      onCategoryChange(newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false);
      setShowCategoryPicker(false);
    }
  };

  const formatText = (type: 'bold' | 'italic' | 'bullet') => {
    // Simple text formatting - in a real app, you might use a rich text editor library
    const selection = content.length; // For simplicity, append at end
    let formattedText = content;

    switch (type) {
      case 'bold':
        formattedText += '**bold text**';
        break;
      case 'italic':
        formattedText += '*italic text*';
        break;
      case 'bullet':
        formattedText += '\n• ';
        break;
    }

    onContentChange(formattedText);
  };

  const insertTemplate = (template: string) => {
    let templateText = '';
    
    switch (template) {
      case 'gratitude':
        templateText = '\n\n🙏 Today I\'m grateful for:\n• \n• \n• ';
        break;
      case 'reflection':
        templateText = '\n\n🤔 Reflection:\nWhat went well today?\n\nWhat could I improve?\n\nWhat did I learn?';
        break;
      case 'goals':
        templateText = '\n\n🎯 Goals for tomorrow:\n• \n• \n• ';
        break;
      case 'mood':
        templateText = '\n\n😊 How I\'m feeling: \n\nWhy: ';
        break;
    }
    
    onContentChange(content + templateText);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title Input */}
      <Input
        placeholder="Entry title..."
        value={title}
        onChangeText={onTitleChange}
        style={styles.titleInput}
        inputStyle={styles.titleInputText}
      />

      {/* Category Selector */}
      <TouchableOpacity
        style={[styles.categorySelector, { backgroundColor: colors.surface }]}
        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
      >
        <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
          Category
        </Text>
        <View style={styles.categoryValue}>
          <Text style={[styles.categoryText, { color: colors.text }]}>
            {category || 'Select category'}
          </Text>
          <Icon
            name={showCategoryPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Category Picker */}
      {showCategoryPicker && (
        <View style={[styles.categoryPicker, { backgroundColor: colors.surface }]}>
          <ScrollView style={styles.categoryList} nestedScrollEnabled>
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    { color: category === cat ? colors.primary : colors.text },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Add New Category Option */}
            {!showNewCategoryInput ? (
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowNewCategoryInput(true)}
              >
                <Icon name="add" size={20} color={colors.primary} />
                <Text style={[styles.addCategoryText, { color: colors.primary }]}>
                  Add new category
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.newCategoryContainer}>
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  style={styles.newCategoryInput}
                  autoFocus
                />
                <View style={styles.newCategoryActions}>
                  <TouchableOpacity
                    style={styles.newCategoryAction}
                    onPress={() => {
                      setShowNewCategoryInput(false);
                      setNewCategory('');
                    }}
                  >
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.newCategoryAction}
                    onPress={handleAddNewCategory}
                  >
                    <Text style={[styles.addText, { color: colors.primary }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Formatting Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('bold')}
        >
          <Icon name="format-bold" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('italic')}
        >
          <Icon name="format-italic" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('bullet')}
        >
          <Icon name="format-list-bulleted" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarSeparator} />
        
        {/* Template Buttons */}
        <TouchableOpacity
          style={styles.templateButton}
          onPress={() => insertTemplate('gratitude')}
        >
          <Text style={[styles.templateButtonText, { color: colors.primary }]}>
            🙏
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={() => insertTemplate('reflection')}
        >
          <Text style={[styles.templateButtonText, { color: colors.primary }]}>
            🤔
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={() => insertTemplate('goals')}
        >
          <Text style={[styles.templateButtonText, { color: colors.primary }]}>
            🎯
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={() => insertTemplate('mood')}
        >
          <Text style={[styles.templateButtonText, { color: colors.primary }]}>
            😊
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Editor */}
      <TextInput
        style={[
          styles.contentInput,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={onContentChange}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
  },
  titleInputText: {
    fontSize: 18,
    fontWeight: '600',
  },
  categorySelector: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
  },
  categoryPicker: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  categoryList: {
    padding: 8,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  newCategoryContainer: {
    padding: 8,
  },
  newCategoryInput: {
    marginBottom: 8,
  },
  newCategoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  newCategoryAction: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toolbarButton: {
    padding: 8,
    marginRight: 8,
  },
  toolbarSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  templateButton: {
    padding: 8,
    marginLeft: 4,
  },
  templateButtonText: {
    fontSize: 18,
  },
  contentInput: {
    minHeight: 300,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});