import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Account } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onPress }) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'Checking':
        return colors.primary;
      case 'Savings':
        return colors.success;
      case 'Investment':
        return colors.warning;
      case 'Credit Card':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.accountName, { color: colors.text }]}>
              {account.name}
            </Text>
            <Text style={[styles.accountType, { color: getAccountTypeColor(account.type) }]}>
              {account.type}
            </Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balance, { color: colors.text }]}>
              {formatCurrency(account.balance)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});