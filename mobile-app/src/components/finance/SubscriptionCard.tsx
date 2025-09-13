import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Subscription } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onPress }) => {
  const { colors } = useTheme();

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

  const getDaysUntilRenewal = () => {
    const renewalDate = new Date(subscription.nextBillingDate);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilRenewal = getDaysUntilRenewal();
  const isOverdue = daysUntilRenewal < 0;
  const isDueSoon = daysUntilRenewal <= 7 && daysUntilRenewal >= 0;

  const getRenewalStatusColor = () => {
    if (isOverdue) return colors.error;
    if (isDueSoon) return colors.warning;
    return colors.success;
  };

  const getRenewalStatusText = () => {
    if (isOverdue) return `${Math.abs(daysUntilRenewal)} days overdue`;
    if (daysUntilRenewal === 0) return 'Due today';
    if (daysUntilRenewal === 1) return 'Due tomorrow';
    return `${daysUntilRenewal} days until renewal`;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.card, !subscription.active && styles.inactiveCard]}>
        <View style={styles.header}>
          <View style={styles.subscriptionInfo}>
            <Text style={[styles.subscriptionName, { color: colors.text }]}>
              {subscription.name}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {subscription.category}
            </Text>
          </View>
          <View style={styles.amountInfo}>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatCurrency(subscription.amount)}
            </Text>
            <Text style={[styles.billingCycle, { color: colors.textSecondary }]}>
              /{subscription.billingCycle}
            </Text>
          </View>
        </View>

        {subscription.active && (
          <View style={styles.renewalInfo}>
            <Text style={[styles.renewalDate, { color: colors.textSecondary }]}>
              Next billing: {formatDate(subscription.nextBillingDate)}
            </Text>
            <Text style={[styles.renewalStatus, { color: getRenewalStatusColor() }]}>
              {getRenewalStatusText()}
            </Text>
          </View>
        )}

        {!subscription.active && (
          <View style={styles.inactiveStatus}>
            <Text style={[styles.inactiveText, { color: colors.textSecondary }]}>
              Inactive
            </Text>
          </View>
        )}

        {subscription.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {subscription.description}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  billingCycle: {
    fontSize: 14,
  },
  renewalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  renewalDate: {
    fontSize: 14,
  },
  renewalStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveStatus: {
    marginBottom: 8,
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});