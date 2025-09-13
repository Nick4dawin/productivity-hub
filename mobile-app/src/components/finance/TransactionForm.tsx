import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCreateFinanceEntry, useAccounts } from '@/hooks/useFinance';
import { FinanceEntry } from '@/types';

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialType?: 'income' | 'expense';
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  onCancel,
  initialType = 'expense',
}) => {
  const { colors } = useTheme();
  const [entryType, setEntryType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: accounts } = useAccounts();
  const createEntry = useCreateFinanceEntry();

  const handleSubmit = async () => {
    if (!amount || !category || !selectedAccount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const entryData: Omit<FinanceEntry, '_id'> = {
      type: entryType,
      amount: numericAmount,
      category,
      description,
      date: new Date(date).toISOString(),
      account: selectedAccount,
    };

    try {
      await createEntry.mutateAsync(entryData);
      Alert.alert('Success', `${entryType === 'income' ? 'Income' : 'Expense'} added successfully`);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  const expenseCategories = [
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
    'Gifts & Donations',
    'Other',
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Rental',
    'Gift',
    'Refund',
    'Other',
  ];

  const categories = entryType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Card style={styles.card}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Add Transaction</Text>
        
        {/* Transaction Type */}
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

        {/* Amount */}
        <Input
          placeholder="Amount *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Account Selection */}
        <Text style={[styles.label, { color: colors.text }]}>Account *</Text>
        <View style={styles.accountSelector}>
          {accounts?.map((account) => (
            <TouchableOpacity
              key={account._id}
              style={[
                styles.accountButton,
                { borderColor: colors.border },
                selectedAccount === account._id && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedAccount(account._id)}
            >
              <Text
                style={[
                  styles.accountButtonText,
                  { color: selectedAccount === account._id ? '#fff' : colors.text },
                ]}
              >
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
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

        {/* Description */}
        <Input
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {/* Date */}
        <Input
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
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
            title={`Add ${entryType === 'income' ? 'Income' : 'Expense'}`}
            onPress={handleSubmit}
            loading={createEntry.isPending}
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  accountButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  accountButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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