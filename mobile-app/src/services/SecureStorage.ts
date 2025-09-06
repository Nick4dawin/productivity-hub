import Keychain from 'react-native-keychain';

export interface SecureStorageError extends Error {
  code?: string;
  userCancel?: boolean;
}

/**
 * SecureStorage service for managing authentication tokens using React Native Keychain
 * Provides secure storage, retrieval, and clearing of authentication tokens
 */
export class SecureStorage {
  private static readonly TOKEN_SERVICE = 'ProductivityHub_AuthToken';
  private static readonly REFRESH_TOKEN_SERVICE = 'ProductivityHub_RefreshToken';
  private static readonly USER_DATA_SERVICE = 'ProductivityHub_UserData';

  /**
   * Store authentication token securely in keychain
   * @param token - JWT authentication token
   * @throws SecureStorageError when keychain access fails
   */
  static async storeToken(token: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        this.TOKEN_SERVICE,
        'auth_token',
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to store token: ${secureError.message}`);
    }
  }

  /**
   * Retrieve authentication token from keychain
   * @returns Promise<string | null> - Returns token or null if not found
   * @throws SecureStorageError when keychain access fails
   */
  static async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(this.TOKEN_SERVICE);
      
      if (credentials && typeof credentials === 'object' && 'password' in credentials) {
        return credentials.password;
      }
      
      return null;
    } catch (error) {
      const secureError = error as SecureStorageError;
      
      // Handle user cancellation gracefully
      if (secureError.userCancel) {
        return null;
      }
      
      throw new Error(`Failed to retrieve token: ${secureError.message}`);
    }
  }

  /**
   * Store refresh token securely in keychain
   * @param refreshToken - JWT refresh token
   * @throws SecureStorageError when keychain access fails
   */
  static async storeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        this.REFRESH_TOKEN_SERVICE,
        'refresh_token',
        refreshToken,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to store refresh token: ${secureError.message}`);
    }
  }

  /**
   * Retrieve refresh token from keychain
   * @returns Promise<string | null> - Returns refresh token or null if not found
   * @throws SecureStorageError when keychain access fails
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(this.REFRESH_TOKEN_SERVICE);
      
      if (credentials && typeof credentials === 'object' && 'password' in credentials) {
        return credentials.password;
      }
      
      return null;
    } catch (error) {
      const secureError = error as SecureStorageError;
      
      // Handle user cancellation gracefully
      if (secureError.userCancel) {
        return null;
      }
      
      throw new Error(`Failed to retrieve refresh token: ${secureError.message}`);
    }
  }

  /**
   * Store user data securely in keychain
   * @param userData - User data object as JSON string
   * @throws SecureStorageError when keychain access fails
   */
  static async storeUserData(userData: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        this.USER_DATA_SERVICE,
        'user_data',
        userData,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to store user data: ${secureError.message}`);
    }
  }

  /**
   * Retrieve user data from keychain
   * @returns Promise<string | null> - Returns user data JSON string or null if not found
   * @throws SecureStorageError when keychain access fails
   */
  static async getUserData(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(this.USER_DATA_SERVICE);
      
      if (credentials && typeof credentials === 'object' && 'password' in credentials) {
        return credentials.password;
      }
      
      return null;
    } catch (error) {
      const secureError = error as SecureStorageError;
      
      // Handle user cancellation gracefully
      if (secureError.userCancel) {
        return null;
      }
      
      throw new Error(`Failed to retrieve user data: ${secureError.message}`);
    }
  }

  /**
   * Clear authentication token from keychain
   * @throws SecureStorageError when keychain access fails
   */
  static async clearToken(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(this.TOKEN_SERVICE);
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to clear token: ${secureError.message}`);
    }
  }

  /**
   * Clear refresh token from keychain
   * @throws SecureStorageError when keychain access fails
   */
  static async clearRefreshToken(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(this.REFRESH_TOKEN_SERVICE);
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to clear refresh token: ${secureError.message}`);
    }
  }

  /**
   * Clear user data from keychain
   * @throws SecureStorageError when keychain access fails
   */
  static async clearUserData(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(this.USER_DATA_SERVICE);
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to clear user data: ${secureError.message}`);
    }
  }

  /**
   * Clear all stored authentication data from keychain
   * @throws SecureStorageError when keychain access fails
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.clearToken(),
        this.clearRefreshToken(),
        this.clearUserData(),
      ]);
    } catch (error) {
      const secureError = error as SecureStorageError;
      throw new Error(`Failed to clear all data: ${secureError.message}`);
    }
  }

  /**
   * Check if authentication token exists in keychain
   * @returns Promise<boolean> - Returns true if token exists, false otherwise
   */
  static async hasToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if refresh token exists in keychain
   * @returns Promise<boolean> - Returns true if refresh token exists, false otherwise
   */
  static async hasRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      return refreshToken !== null;
    } catch (error) {
      return false;
    }
  }
}