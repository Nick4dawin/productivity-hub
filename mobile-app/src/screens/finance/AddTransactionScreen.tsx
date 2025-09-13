import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { ReceiptCapture } from '@/components/finance/ReceiptCapture';

export const AddTransactionScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const handleSuccess = () => {
    Alert.alert(
      'Success',
      'Transaction added successfully!',
      [
        {
          text: 'Add Another',
          onPress: () => {
            // Reset form by staying on screen
            setReceiptUri(null);
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Add Transaction" 
        showBack 
        onBackPress={handleCancel}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TransactionForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
        
        <ReceiptCapture
          onImageSelected={setReceiptUri}
          onImageRemoved={() => setReceiptUri(null)}
          initialImageUri={receiptUri || undefined}
        />
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
    paddingBottom: 32,
  },
});