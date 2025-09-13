import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useFinanceEntries, useAccounts } from '@/hooks/useFinance';
import { FinanceEntry } from '@/types';

interface TransactionHistoryProps {
  limit?: number;
  showFilters?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  limit,
  showFilters = true,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: entries, isLoading, error } = useFinanceEntries();
  const { data: accounts } = useAccounts();

  const filteredEntries = useMemo(() => {
    if (!entries) return [];

    let filtered = entries;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((entry) => entry.type === selectedType);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((entry) => entry.category === selectedCategory);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [entries, searchQuery, selectedType, selectedCategory, limit]);

  const categories = useMemo(() => {
    if (!entries) return [];
    const uniqueCategories = [...new Set(entries.map((entry) => entry.category))];
    return uniqueCategories.sort();
  }, [entries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.find((acc) => acc._id === accountId);
    return account?.name || 'Unknown Account';
  };

  const renderTransactionItem = ({ item }: { item: FinanceEntry }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, { color: colors.text }]}>
            {item.description || item.category}
          </Text>
          <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>
            {item.category} • {getAccountName(item.account as string)}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: item.type === 'income' ? colors.success : colors.error },
            ]}
          >
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <Text style={[styles.errorText, { color: colors.error }]}>
        Unable to load transactions
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Search */}
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />

          {/* Type Filter */}
          <View style={styles.typeFilter}>
            {(['all', 'income', 'expense'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  { borderColor: colors.border },
                  selectedType === type && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: selectedType === type ? '#fff' : colors.text },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filter */}
          <View style={styles.categoryFilter}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { borderColor: colors.border },
                !selectedCategory && { backgroundColor: colors.secondary },
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: !selectedCategory ? '#fff' : colors.text },
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            
            {categories.slice(0, 3).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  { borderColor: colors.border },
                  selectedCategory === category && { backgroundColor: colors.secondary },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: selectedCategory === category ? '#fff' : colors.text },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredEntries.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No transactions found
        </Text>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  typeFilter: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 40,
    fontStyle: 'italic',
  },
});