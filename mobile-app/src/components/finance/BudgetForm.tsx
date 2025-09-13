import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useFinance';
import { Budget } from '@/types';

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onSuccess,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [category, setCategory] = useState(budget?.category || '');
  const [amount, setAmount] = useState(budget?.amount?.toString() || '');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(
    budget?.period || 'monthly'
  );
  const [description, setDescription] = useState(budget?.description || '');
  const [selectedColor, setSelectedColor] = useState(budget?.color || colors.primary);

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const handleSubmit = async () => {
    if (!category || !amount) {
      Alert.alert('Error', 'Please fill in category and amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const budgetData = {
      category,
      amount: numericAmount,
      period,
      description: description || undefined,
      color: selectedColor,
    };

    try {
      if (budget) {
        await updateBudget.mutateAsync({ id: budget._id, data: budgetData });
        Alert.alert('Success', 'Budget updated successfully');
      } else {
        await createBudget.mutateAsync(budgetData);
        Alert.alert('Success', 'Budget created successfully');
      }
      
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', `Failed to ${budget ? 'update' : 'create'} budget`);
    }
  };

  const periods = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ] as const;

  const commonCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Home & Garden',
  ];

  const budgetColors = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.error,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1',
  ];

  return (
    <Card style={styles.card}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          {budget ? 'Edit Budget' : 'Create Budget'}
        </Text>

        {/* Category */}
        <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
        <Input
          placeholder="Budget category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <View style={styles.categoryButtons}>
          {commonCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { borderColor: colors.border },
                category === cat && { backgroundColor: colors.secondary },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: category === cat ? '#fff' : colors.text },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
        <Input
          placeholder="Budget amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Period */}
        <Text style={[styles.label, { color: colors.text }]}>Period *</Text>
        <View style={styles.periodSelector}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodButton,
                { borderColor: colors.border },
                period === p.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: period === p.key ? '#fff' : colors.text },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color */}
        <Text style={[styles.label, { color: colors.text }]}>Color</Text>
        <View style={styles.colorSelector}>
          {budgetColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        {/* Description */}
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <Input
          placeholder="Budget description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            />
          )}
          <Button
            title={budget ? 'Update Budget' : 'Create Budget'}
            onPress={handleSubmit}
            loading={createBudget.isPending || updateBudget.isPending}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});