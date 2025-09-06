import Keychain from 'react-native-keychain';
import { SecureStorage } from '../SecureStorage';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  },
}));

const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('SecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeToken', () => {
    it('should store token successfully', async () => {
      mockKeychain.setInternetCredentials.mockResolvedValue(true);

      await SecureStorage.storeToken('test-token');

      expect(mockKeychain.setInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_AuthToken',
        'auth_token',
        'test-token',
        {
          accessControl: 'BiometryCurrentSetOrDevicePasscode',
          accessible: 'WhenUnlockedThisDeviceOnly',
        }
      );
    });

    it('should throw error when keychain fails', async () => {
      const error = new Error('Keychain error');
      mockKeychain.setInternetCredentials.mockRejectedValue(error);

      await expect(SecureStorage.storeToken('test-token')).rejects.toThrow(
        'Failed to store token: Keychain error'
      );
    });
  });

  describe('getToken', () => {
    it('should retrieve token successfully', async () => {
      const mockCredentials = {
        username: 'auth_token',
        password: 'test-token',
        service: 'ProductivityHub_AuthToken',
      };
      mockKeychain.getInternetCredentials.mockResolvedValue(mockCredentials);

      const token = await SecureStorage.getToken();

      expect(token).toBe('test-token');
      expect(mockKeychain.getInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_AuthToken'
      );
    });

    it('should return null when no credentials found', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue(false);

      const token = await SecureStorage.getToken();

      expect(token).toBeNull();
    });

    it('should return null when user cancels', async () => {
      const error = new Error('User canceled') as any;
      error.userCancel = true;
      mockKeychain.getInternetCredentials.mockRejectedValue(error);

      const token = await SecureStorage.getToken();

      expect(token).toBeNull();
    });

    it('should throw error when keychain fails', async () => {
      const error = new Error('Keychain error');
      mockKeychain.getInternetCredentials.mockRejectedValue(error);

      await expect(SecureStorage.getToken()).rejects.toThrow(
        'Failed to retrieve token: Keychain error'
      );
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token successfully', async () => {
      mockKeychain.setInternetCredentials.mockResolvedValue(true);

      await SecureStorage.storeRefreshToken('refresh-token');

      expect(mockKeychain.setInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_RefreshToken',
        'refresh_token',
        'refresh-token',
        {
          accessControl: 'BiometryCurrentSetOrDevicePasscode',
          accessible: 'WhenUnlockedThisDeviceOnly',
        }
      );
    });

    it('should throw error when keychain fails', async () => {
      const error = new Error('Keychain error');
      mockKeychain.setInternetCredentials.mockRejectedValue(error);

      await expect(SecureStorage.storeRefreshToken('refresh-token')).rejects.toThrow(
        'Failed to store refresh token: Keychain error'
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token successfully', async () => {
      const mockCredentials = {
        username: 'refresh_token',
        password: 'refresh-token',
        service: 'ProductivityHub_RefreshToken',
      };
      mockKeychain.getInternetCredentials.mockResolvedValue(mockCredentials);

      const token = await SecureStorage.getRefreshToken();

      expect(token).toBe('refresh-token');
      expect(mockKeychain.getInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_RefreshToken'
      );
    });

    it('should return null when no credentials found', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue(false);

      const token = await SecureStorage.getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('storeUserData', () => {
    it('should store user data successfully', async () => {
      mockKeychain.setInternetCredentials.mockResolvedValue(true);
      const userData = JSON.stringify({ id: '1', email: 'test@example.com' });

      await SecureStorage.storeUserData(userData);

      expect(mockKeychain.setInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_UserData',
        'user_data',
        userData,
        {
          accessible: 'WhenUnlockedThisDeviceOnly',
        }
      );
    });
  });

  describe('getUserData', () => {
    it('should retrieve user data successfully', async () => {
      const userData = JSON.stringify({ id: '1', email: 'test@example.com' });
      const mockCredentials = {
        username: 'user_data',
        password: userData,
        service: 'ProductivityHub_UserData',
      };
      mockKeychain.getInternetCredentials.mockResolvedValue(mockCredentials);

      const result = await SecureStorage.getUserData();

      expect(result).toBe(userData);
    });
  });

  describe('clearToken', () => {
    it('should clear token successfully', async () => {
      mockKeychain.resetInternetCredentials.mockResolvedValue(true);

      await SecureStorage.clearToken();

      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_AuthToken'
      );
    });

    it('should throw error when keychain fails', async () => {
      const error = new Error('Keychain error');
      mockKeychain.resetInternetCredentials.mockRejectedValue(error);

      await expect(SecureStorage.clearToken()).rejects.toThrow(
        'Failed to clear token: Keychain error'
      );
    });
  });

  describe('clearRefreshToken', () => {
    it('should clear refresh token successfully', async () => {
      mockKeychain.resetInternetCredentials.mockResolvedValue(true);

      await SecureStorage.clearRefreshToken();

      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_RefreshToken'
      );
    });
  });

  describe('clearUserData', () => {
    it('should clear user data successfully', async () => {
      mockKeychain.resetInternetCredentials.mockResolvedValue(true);

      await SecureStorage.clearUserData();

      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_UserData'
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all data successfully', async () => {
      mockKeychain.resetInternetCredentials.mockResolvedValue(true);

      await SecureStorage.clearAll();

      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledTimes(3);
      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_AuthToken'
      );
      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_RefreshToken'
      );
      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith(
        'ProductivityHub_UserData'
      );
    });

    it('should throw error when any clear operation fails', async () => {
      const error = new Error('Keychain error');
      mockKeychain.resetInternetCredentials.mockRejectedValue(error);

      await expect(SecureStorage.clearAll()).rejects.toThrow(
        'Failed to clear all data: Keychain error'
      );
    });
  });

  describe('hasToken', () => {
    it('should return true when token exists', async () => {
      const mockCredentials = {
        username: 'auth_token',
        password: 'test-token',
        service: 'ProductivityHub_AuthToken',
      };
      mockKeychain.getInternetCredentials.mockResolvedValue(mockCredentials);

      const hasToken = await SecureStorage.hasToken();

      expect(hasToken).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue(false);

      const hasToken = await SecureStorage.hasToken();

      expect(hasToken).toBe(false);
    });

    it('should return false when error occurs', async () => {
      const error = new Error('Keychain error');
      mockKeychain.getInternetCredentials.mockRejectedValue(error);

      const hasToken = await SecureStorage.hasToken();

      expect(hasToken).toBe(false);
    });
  });

  describe('hasRefreshToken', () => {
    it('should return true when refresh token exists', async () => {
      const mockCredentials = {
        username: 'refresh_token',
        password: 'refresh-token',
        service: 'ProductivityHub_RefreshToken',
      };
      mockKeychain.getInternetCredentials.mockResolvedValue(mockCredentials);

      const hasRefreshToken = await SecureStorage.hasRefreshToken();

      expect(hasRefreshToken).toBe(true);
    });

    it('should return false when refresh token does not exist', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue(false);

      const hasRefreshToken = await SecureStorage.hasRefreshToken();

      expect(hasRefreshToken).toBe(false);
    });

    it('should return false when error occurs', async () => {
      const error = new Error('Keychain error');
      mockKeychain.getInternetCredentials.mockRejectedValue(error);

      const hasRefreshToken = await SecureStorage.hasRefreshToken();

      expect(hasRefreshToken).toBe(false);
    });
  });
});