import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export const DeleteAccountScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, deleteAccount } = useAuth();
  const navigation = useNavigation();

  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation

  const requiredText = 'DELETE MY ACCOUNT';
  const isConfirmationValid = confirmationText === requiredText;

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleDeleteAccount();
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Error', 'Password is required to delete your account');
      return;
    }

    if (!isConfirmationValid) {
      Alert.alert('Error', `Please type "${requiredText}" to confirm`);
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. Are you absolutely sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: performDeletion,
        },
      ]
    );
  };

  const performDeletion = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(password);
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled by auth context
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWarningStep = () => (
    <>
      <Card style={styles.warningCard}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={32} color={colors.error} />
          <Text style={[styles.warningTitle, { color: colors.error }]}>
            Delete Account
          </Text>
        </View>
        
        <Text style={[styles.warningText, { color: colors.text }]}>
          You are about to permanently delete your account. This action cannot be undone.
        </Text>
      </Card>

      <Card style={styles.consequencesCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What will happen:
        </Text>

        <View style={styles.consequenceItem}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.consequenceText, { color: colors.text }]}>
            All your data will be permanently deleted
          </Text>
        </View>

        <View style={styles.consequenceItem}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.consequenceText, { color: colors.text }]}>
            Your habits, journal entries, and goals will be lost
          </Text>
        </View>

        <View style={styles.consequenceItem}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.consequenceText, { color: colors.text }]}>
            Your financial data and media tracking will be removed
          </Text>
        </View>

        <View style={styles.consequenceItem}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.consequenceText, { color: colors.text }]}>
            You will lose access to all premium features
          </Text>
        </View>

        <View style={styles.consequenceItem}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.consequenceText, { color: colors.text }]}>
            This action cannot be reversed
          </Text>
        </View>
      </Card>

      <Card style={styles.alternativesCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Consider these alternatives:
        </Text>

        <TouchableOpacity style={styles.alternativeItem}>
          <Ionicons name="download" size={20} color={colors.primary} />
          <View style={styles.alternativeContent}>
            <Text style={[styles.alternativeTitle, { color: colors.text }]}>
              Export your data
            </Text>
            <Text style={[styles.alternativeDescription, { color: colors.textSecondary }]}>
              Download a copy of your data before deleting
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.alternativeItem}>
          <Ionicons name="pause" size={20} color={colors.primary} />
          <View style={styles.alternativeContent}>
            <Text style={[styles.alternativeTitle, { color: colors.text }]}>
              Deactivate temporarily
            </Text>
            <Text style={[styles.alternativeDescription, { color: colors.textSecondary }]}>
              Take a break without losing your data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.alternativeItem}>
          <Ionicons name="help-circle" size={20} color={colors.primary} />
          <View style={styles.alternativeContent}>
            <Text style={[styles.alternativeTitle, { color: colors.text }]}>
              Contact support
            </Text>
            <Text style={[styles.alternativeDescription, { color: colors.textSecondary }]}>
              Get help with any issues you're experiencing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <Card style={styles.confirmationCard}>
        <Text style={[styles.confirmationTitle, { color: colors.error }]}>
          Final Confirmation
        </Text>
        
        <Text style={[styles.confirmationText, { color: colors.text }]}>
          To confirm account deletion, please:
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Type "{requiredText}" below:
          </Text>
          <Input
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder={requiredText}
            autoCapitalize="characters"
            style={[
              styles.confirmationInput,
              {
                borderColor: confirmationText && !isConfirmationValid ? colors.error : colors.border,
              },
            ]}
          />
          {confirmationText && !isConfirmationValid && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Text does not match. Please type exactly: {requiredText}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Enter your password:
          </Text>
          <View style={styles.passwordContainer}>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.finalWarning}>
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text style={[styles.finalWarningText, { color: colors.error }]}>
            This action is permanent and cannot be undone
          </Text>
        </View>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Delete Account
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? renderWarningStep() : renderConfirmationStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step === 1 ? (
          <>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Continue"
              onPress={handleContinue}
              style={[styles.footerButton, { backgroundColor: colors.error }]}
            />
          </>
        ) : (
          <>
            <Button
              title="Go Back"
              onPress={() => setStep(1)}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              loading={isLoading}
              disabled={!isConfirmationValid || !password}
              style={[styles.footerButton, { backgroundColor: colors.error }]}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  consequencesCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  consequenceText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  alternativesCard: {
    padding: 16,
    marginBottom: 16,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  alternativeContent: {
    flex: 1,
    marginLeft: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  alternativeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  confirmationCard: {
    padding: 16,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  confirmationInput: {
    fontFamily: 'monospace',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  finalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  finalWarningText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});