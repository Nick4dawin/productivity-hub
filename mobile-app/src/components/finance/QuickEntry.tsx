import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCreateFinanceEntry, useAccounts } from '@/hooks/useFinance';
import { FinanceEntry } from '@/types';

export const QuickEntry: React.FC = () => {
  const { colors } = useTheme();
  const [entryType, setEntryType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const { data: accounts } = useAccounts();
  const createEntry = useCreateFinanceEntry();

  const handleSubmit = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill in amount and category');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Use first account as default, or create a default cash account
    const defaultAccount = accounts?.[0]?._id || 'cash';

    const entryData: Omit<FinanceEntry, '_id'> = {
      type: entryType,
      amount: numericAmount,
      category,
      description,
      date: new Date().toISOString(),
      account: defaultAccount,
    };

    try {
      await createEntry.mutateAsync(entryData);
      setAmount('');
      setDescription('');
      setCategory('');
      Alert.alert('Success', `${entryType === 'income' ? 'Income' : 'Expense'} added successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add entry');
    }
  };

  const commonCategories = {
    expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  };

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Quick Entry</Text>
      
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            entryType === 'expense' && { backgroundColor: colors.error },
          ]}
          onPress={() => setEntryType('expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              { color: entryType === 'expense' ? '#fff' : colors.text },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            entryType === 'income' && { backgroundColor: colors.success },
          ]}
          onPress={() => setEntryType('income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              { color: entryType === 'income' ? '#fff' : colors.text },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Input
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <View style={styles.categoryButtons}>
        {commonCategories[entryType].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, { borderColor: colors.border }]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryButtonText, { color: colors.text }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Button
        title={`Add ${entryType === 'income' ? 'Income' : 'Expense'}`}
        onPress={handleSubmit}
        loading={createEntry.isPending}
        style={styles.submitButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
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
  submitButton: {
    marginTop: 8,
  },
});