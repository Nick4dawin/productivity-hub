import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { SubscriptionCard } from '@/components/finance/SubscriptionCard';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useSubscriptions } from '@/hooks/useFinance';

export const SubscriptionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: subscriptions, isLoading, error, refetch } = useSubscriptions();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSubscriptionSummary = () => {
    if (!subscriptions) return { total: 0, active: 0, inactive: 0, monthlyTotal: 0 };

    const active = subscriptions.filter(sub => sub.active);
    const inactive = subscriptions.filter(sub => !sub.active);
    
    const monthlyTotal = active.reduce((total, sub) => {
      let monthlyAmount = sub.amount;
      switch (sub.billingCycle) {
        case 'yearly':
          monthlyAmount = sub.amount / 12;
          break;
        case 'weekly':
          monthlyAmount = sub.amount * 4.33; // Average weeks per month
          break;
        case 'quarterly':
          monthlyAmount = sub.amount / 3;
          break;
      }
      return total + monthlyAmount;
    }, 0);

    return {
      total: subscriptions.length,
      active: active.length,
      inactive: inactive.length,
      monthlyTotal,
    };
  };

  const getDueSoon = () => {
    if (!subscriptions) return [];
    
    return subscriptions
      .filter(sub => {
        if (!sub.active) return false;
        const renewalDate = new Date(sub.nextBillingDate);
        const today = new Date();
        const diffTime = renewalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Subscriptions" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  const summary = getSubscriptionSummary();
  const dueSoon = getDueSoon();
  const activeSubscriptions = subscriptions?.filter(sub => sub.active) || [];
  const inactiveSubscriptions = subscriptions?.filter(sub => !sub.active) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Subscriptions" showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Subscription Summary
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                {summary.active}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Active
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.textSecondary }]}>
                {summary.inactive}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Inactive
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.success }]}>
                {formatCurrency(summary.monthlyTotal)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Monthly Total
              </Text>
            </View>
          </View>
        </Card>

        {/* Due Soon */}
        {dueSoon.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Due Soon
            </Text>
            {dueSoon.map((subscription) => (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                onPress={() => {
                  // Navigate to subscription detail/edit screen
                }}
              />
            ))}
          </View>
        )}

        {/* Active Subscriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Subscriptions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddSubscription' as never)}>
              <Text style={[styles.addButton, { color: colors.primary }]}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Unable to load subscriptions
            </Text>
          ) : activeSubscriptions.length > 0 ? (
            activeSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                onPress={() => {
                  // Navigate to subscription detail/edit screen
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No active subscriptions
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddSubscription' as never)}
              >
                <Text style={styles.createButtonText}>Add Subscription</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Inactive Subscriptions */}
        {inactiveSubscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Inactive Subscriptions
            </Text>
            {inactiveSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                onPress={() => {
                  // Navigate to subscription detail/edit screen
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});