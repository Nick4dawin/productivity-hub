import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { NetWorthCard } from '@/components/finance/NetWorthCard';
import { AccountCard } from '@/components/finance/AccountCard';
import { QuickEntry } from '@/components/finance/QuickEntry';
import { FinanceCharts } from '@/components/finance/FinanceCharts';
import { TransactionHistory } from '@/components/finance/TransactionHistory';
import { useAccounts } from '@/hooks/useFinance';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const FinanceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  const { data: accounts, isLoading, error, refetch } = useAccounts();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Finance" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Finance" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Net Worth Overview */}
        <NetWorthCard />

        {/* Account Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Accounts
            </Text>
            <TouchableOpacity>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>
                Manage
              </Text>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Unable to load accounts
            </Text>
          ) : accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onPress={() => {
                  // Navigate to account detail screen
                }}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No accounts found. Add your first account to get started.
            </Text>
          )}
        </View>

        {/* Quick Entry */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Entry
            </Text>
            <TouchableOpacity onPress={() => setShowQuickEntry(!showQuickEntry)}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>
                {showQuickEntry ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showQuickEntry && <QuickEntry />}
        </View>

        {/* Analytics Charts */}
        <FinanceCharts />

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory' as never)}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <TransactionHistory limit={5} showFilters={false} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddTransaction' as never)}
          >
            <Text style={styles.quickActionText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 20,
    fontStyle: 'italic',
  },
  quickActions: {
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});