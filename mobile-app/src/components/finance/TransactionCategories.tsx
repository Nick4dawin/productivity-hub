import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

interface TransactionCategoriesProps {
  type: 'income' | 'expense';
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  allowCustom?: boolean;
}

export const TransactionCategories: React.FC<TransactionCategoriesProps> = ({
  type,
  selectedCategory,
  onCategorySelect,
  allowCustom = true,
}) => {
  const { colors } = useTheme();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const expenseCategories: Category[] = [
    { id: '1', name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
    { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
    { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
    { id: '4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
    { id: '5', name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7', type: 'expense' },
    { id: '6', name: 'Healthcare', icon: '🏥', color: '#DDA0DD', type: 'expense' },
    { id: '7', name: 'Education', icon: '📚', color: '#98D8C8', type: 'expense' },
    { id: '8', name: 'Travel', icon: '✈️', color: '#F7DC6F', type: 'expense' },
    { id: '9', name: 'Personal Care', icon: '💄', color: '#BB8FCE', type: 'expense' },
    { id: '10', name: 'Home & Garden', icon: '🏠', color: '#85C1E9', type: 'expense' },
    { id: '11', name: 'Gifts & Donations', icon: '🎁', color: '#F8C471', type: 'expense' },
    { id: '12', name: 'Insurance', icon: '🛡️', color: '#82E0AA', type: 'expense' },
  ];

  const incomeCategories: Category[] = [
    { id: '1', name: 'Salary', icon: '💼', color: '#2ECC71', type: 'income' },
    { id: '2', name: 'Freelance', icon: '💻', color: '#3498DB', type: 'income' },
    { id: '3', name: 'Business', icon: '🏢', color: '#9B59B6', type: 'income' },
    { id: '4', name: 'Investment', icon: '📈', color: '#E67E22', type: 'income' },
    { id: '5', name: 'Rental', icon: '🏘️', color: '#1ABC9C', type: 'income' },
    { id: '6', name: 'Gift', icon: '🎁', color: '#E74C3C', type: 'income' },
    { id: '7', name: 'Refund', icon: '💰', color: '#F39C12', type: 'income' },
    { id: '8', name: 'Bonus', icon: '🎯', color: '#8E44AD', type: 'income' },
  ];

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      onCategorySelect(customCategory.trim());
      setCustomCategory('');
      setShowCustomInput(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { borderColor: colors.border },
        selectedCategory === item.name && {
          backgroundColor: item.color,
          borderColor: item.color,
        },
      ]}
      onPress={() => onCategorySelect(item.name)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryName,
          {
            color: selectedCategory === item.name ? '#fff' : colors.text,
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>
        Select Category
      </Text>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {allowCustom && (
        <View style={styles.customSection}>
          {showCustomInput ? (
            <View style={styles.customInputContainer}>
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChangeText={setCustomCategory}
                onSubmitEditing={handleCustomCategorySubmit}
                style={styles.customInput}
                autoFocus
              />
              <View style={styles.customActions}>
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: colors.success }]}
                  onPress={handleCustomCategorySubmit}
                >
                  <Text style={styles.customButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: colors.textSecondary }]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                >
                  <Text style={styles.customButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addCustomButton, { borderColor: colors.border }]}
              onPress={() => setShowCustomInput(true)}
            >
              <Text style={[styles.addCustomText, { color: colors.primary }]}>
                + Add Custom Category
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryItem: {
    flex: 0.48,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  customSection: {
    marginTop: 8,
  },
  customInputContainer: {
    marginBottom: 8,
  },
  customInput: {
    marginBottom: 8,
  },
  customActions: {
    flexDirection: 'row',
  },
  customButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addCustomButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCustomText: {
    fontSize: 14,
    fontWeight: '600',
  },
});