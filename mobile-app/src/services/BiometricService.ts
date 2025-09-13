import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType[];
}

/**
 * Service for managing biometric authentication
 */
export class BiometricService {
  private static instance: BiometricService;
  private isEnabled: boolean = false;

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Load biometric settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('biometricSettings');
      if (stored) {
        const settings = JSON.parse(stored);
        this.isEnabled = settings.enabled || false;
      }
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  }

  /**
   * Save biometric settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      const settings = {
        enabled: this.isEnabled,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem('biometricSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save biometric settings:', error);
    }
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getAvailableTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  /**
   * Get human-readable biometric type names
   */
  async getBiometricTypeNames(): Promise<string[]> {
    try {
      const types = await this.getAvailableTypes();
      return types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });
    } catch (error) {
      console.error('Failed to get biometric type names:', error);
      return [];
    }
  }

  /**
   * Check if biometric authentication is enabled in app settings
   */
  isBiometricEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Biometric authentication is not available on this device or no biometrics are enrolled.'
        );
        return false;
      }

      // Test biometric authentication
      const result = await this.authenticate({
        promptMessage: 'Enable biometric authentication for quick access',
      });

      if (result.success) {
        this.isEnabled = true;
        await this.saveSettings();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    this.isEnabled = false;
    await this.saveSettings();
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(options: BiometricOptions = {}): Promise<BiometricResult> {
    try {
      // Check if biometric is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      const defaultOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: options.promptMessage || 'Authenticate to continue',
        cancelLabel: options.cancelLabel || 'Cancel',
        fallbackLabel: options.fallbackLabel || 'Use Passcode',
        disableDeviceFallback: options.disableDeviceFallback || false,
      };

      const result = await LocalAuthentication.authenticateAsync(defaultOptions);

      if (result.success) {
        return {
          success: true,
          biometricType: await this.getAvailableTypes(),
        };
      } else {
        let errorMessage = 'Authentication failed';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication was cancelled';
        } else if (result.error === 'user_fallback') {
          errorMessage = 'User chose to use device passcode';
        } else if (result.error === 'biometric_not_available') {
          errorMessage = 'Biometric authentication is not available';
        } else if (result.error === 'biometric_not_enrolled') {
          errorMessage = 'No biometrics are enrolled on this device';
        } else if (result.error === 'too_many_attempts') {
          errorMessage = 'Too many failed attempts';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during authentication',
      };
    }
  }

  /**
   * Authenticate for app unlock
   */
  async authenticateForAppUnlock(): Promise<BiometricResult> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'Biometric authentication is not enabled',
      };
    }

    return this.authenticate({
      promptMessage: 'Unlock the app with your biometric',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
    });
  }

  /**
   * Authenticate for sensitive operations
   */
  async authenticateForSensitiveOperation(operation: string): Promise<BiometricResult> {
    return this.authenticate({
      promptMessage: `Authenticate to ${operation}`,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
    });
  }

  /**
   * Show biometric setup prompt
   */
  async showSetupPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Enable Biometric Authentication',
        'Would you like to enable biometric authentication for quick and secure access to the app?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable',
            onPress: async () => {
              const enabled = await this.enableBiometric();
              resolve(enabled);
            },
          },
        ]
      );
    });
  }

  /**
   * Check if device has biometric hardware
   */
  async hasHardware(): Promise<boolean> {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch (error) {
      console.error('Failed to check biometric hardware:', error);
      return false;
    }
  }

  /**
   * Check if biometrics are enrolled
   */
  async isEnrolled(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch (error) {
      console.error('Failed to check biometric enrollment:', error);
      return false;
    }
  }

  /**
   * Get biometric capability info
   */
  async getCapabilityInfo(): Promise<{
    hasHardware: boolean;
    isEnrolled: boolean;
    availableTypes: LocalAuthentication.AuthenticationType[];
    typeNames: string[];
  }> {
    try {
      const [hasHardware, isEnrolled, availableTypes, typeNames] = await Promise.all([
        this.hasHardware(),
        this.isEnrolled(),
        this.getAvailableTypes(),
        this.getBiometricTypeNames(),
      ]);

      return {
        hasHardware,
        isEnrolled,
        availableTypes,
        typeNames,
      };
    } catch (error) {
      console.error('Failed to get biometric capability info:', error);
      return {
        hasHardware: false,
        isEnrolled: false,
        availableTypes: [],
        typeNames: [],
      };
    }
  }

  /**
   * Show biometric enrollment prompt
   */
  showEnrollmentPrompt(): void {
    Alert.alert(
      'Biometric Authentication Not Set Up',
      'To use biometric authentication, please set up Face ID, Touch ID, or fingerprint authentication in your device settings.',
      [
        { text: 'OK', style: 'default' },
      ]
    );
  }

  /**
   * Get platform-specific biometric name
   */
  getPlatformBiometricName(): string {
    if (Platform.OS === 'ios') {
      return 'Face ID or Touch ID';
    }
    return 'Fingerprint or Face Unlock';
  }

  /**
   * Check if should prompt for biometric setup
   */
  async shouldPromptForSetup(): Promise<boolean> {
    try {
      // Don't prompt if already enabled
      if (this.isEnabled) return false;

      // Don't prompt if not available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;

      // Check if user has been prompted before
      const lastPrompt = await AsyncStorage.getItem('biometricLastPrompt');
      if (lastPrompt) {
        const daysSincePrompt = (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24);
        // Don't prompt again for 7 days
        if (daysSincePrompt < 7) return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check if should prompt for setup:', error);
      return false;
    }
  }

  /**
   * Mark that user was prompted for biometric setup
   */
  async markPrompted(): Promise<void> {
    try {
      await AsyncStorage.setItem('biometricLastPrompt', Date.now().toString());
    } catch (error) {
      console.error('Failed to mark biometric prompt:', error);
    }
  }
}

// Export singleton instance
export const biometricService = BiometricService.getInstance();