import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export const ChangePasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const { changePassword } = useAuth();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert('Error', 'New password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: colors.textSecondary };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: colors.error };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: colors.warning };
    
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return { strength: 2, label: 'Fair', color: colors.warning };
    if (score < 4) return { strength: 3, label: 'Good', color: colors.info };
    return { strength: 4, label: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Change Password
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Choose a strong password to keep your account secure. Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
          </Text>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Current Password
            </Text>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.currentPassword}
                onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                placeholder="Enter your current password"
                secureTextEntry={!showPasswords.current}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
              >
                <Ionicons
                  name={showPasswords.current ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              New Password
            </Text>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Enter your new password"
                secureTextEntry={!showPasswords.new}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
              >
                <Ionicons
                  name={showPasswords.new ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {formData.newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor: level <= passwordStrength.strength
                            ? passwordStrength.color
                            : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Confirm New Password
            </Text>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Confirm your new password"
                secureTextEntry={!showPasswords.confirm}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                <Ionicons
                  name={showPasswords.confirm ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <Ionicons
                  name={formData.newPassword === formData.confirmPassword ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={formData.newPassword === formData.confirmPassword ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.matchText,
                    {
                      color: formData.newPassword === formData.confirmPassword ? colors.success : colors.error,
                    },
                  ]}
                >
                  {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={isLoading}
            disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            style={styles.submitButton}
          />
        </Card>

        {/* Security Tips */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Password Security Tips
          </Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Use at least 8 characters
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Include uppercase and lowercase letters
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Add numbers and special characters
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Avoid common words or personal information
            </Text>
          </View>
        </Card>
      </ScrollView>
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
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    marginRight: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  tipsCard: {
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});