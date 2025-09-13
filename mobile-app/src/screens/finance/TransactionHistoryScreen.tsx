import React, { useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { TransactionHistory } from '@/components/finance/TransactionHistory';
import { useFinanceEntries } from '@/hooks/useFinance';

export const TransactionHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { refetch } = useFinanceEntries();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Transaction History" 
        showBack 
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <TransactionHistory 
          showFilters={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});