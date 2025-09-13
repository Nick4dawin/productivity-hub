import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryTagsProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  multiSelect?: boolean;
  showAddButton?: boolean;
  onAddCategory?: () => void;
}

export const CategoryTags: React.FC<CategoryTagsProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  multiSelect = false,
  showAddButton = false,
  onAddCategory,
}) => {
  const { colors } = useTheme();

  const isSelected = (category: string) => {
    return selectedCategories.includes(category);
  };

  const getCategoryColor = (category: string) => {
    // Generate consistent colors for categories
    const colors_list = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors_list[Math.abs(hash) % colors_list.length];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const selected = isSelected(category);
          const categoryColor = getCategoryColor(category);
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.tag,
                {
                  backgroundColor: selected ? categoryColor : colors.surface,
                  borderColor: categoryColor,
                },
              ]}
              onPress={() => onCategoryToggle(category)}
            >
              <Text
                style={[
                  styles.tagText,
                  {
                    color: selected ? 'white' : categoryColor,
                  },
                ]}
              >
                {category}
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
        
        {showAddButton && onAddCategory && (
          <TouchableOpacity
            style={[
              styles.addTag,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
            onPress={onAddCategory}
          >
            <Icon name="add" size={16} color={colors.primary} />
            <Text style={[styles.addTagText, { color: colors.primary }]}>
              Add
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 2,
  },
  addTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  addTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});