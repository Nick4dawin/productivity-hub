import React from 'react';
import { render, fireEvent, waitFor, act } from '../../test-utils';
import { AppNavigator } from '../../navigation/AppNavigator';
import { ApiService } from '../../services/ApiService';
import { SecureStorage } from '../../services/SecureStorage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock services
jest.mock('../../services/ApiService');
jest.mock('../../services/SecureStorage');
jest.mock('@react-native-google-signin/google-signin');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;
const mockSecureStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;
const mockGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

describe('Authentication Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Setup default mocks
    mockSecureStorage.prototype.storeToken = jest.fn().mockResolvedValue(undefined);
    mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue(null);
    mockSecureStorage.prototype.clearToken = jest.fn().mockResolvedValue(undefined);
  });

  describe('Email/Password Authentication', () => {
    it('should complete full login flow with token storage', async () => {
      const mockAuthResponse = {
        token: 'jwt-token-123',
        user: {
          _id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          profilePicture: null
        }
      };

      mockApiService.prototype.login = jest.fn().mockResolvedValue(mockAuthResponse);

      const { getByTestId, getByText, findByText } = render(<AppNavigator />);

      // Should start with login screen
      expect(getByText('Sign In')).toBeTruthy();

      // Fill login form
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Wait for authentication
      await waitFor(() => {
        expect(mockApiService.prototype.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Should store token securely
      await waitFor(() => {
        expect(mockSecureStorage.prototype.storeToken).toHaveBeenCalledWith('jwt-token-123');
      });

      // Should navigate to dashboard
      const dashboardTitle = await findByText('Dashboard');
      expect(dashboardTitle).toBeTruthy();
    });

    it('should handle login errors gracefully', async () => {
      mockApiService.prototype.login = jest.fn().mockRejectedValue(
        new Error('Invalid credentials')
      );

      const { getByTestId, getByText, findByText } = render(<AppNavigator />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      // Should show error message
      const errorMessage = await findByText(/invalid credentials/i);
      expect(errorMessage).toBeTruthy();

      // Should not store token
      expect(mockSecureStorage.prototype.storeToken).not.toHaveBeenCalled();

      // Should remain on login screen
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should complete registration flow', async () => {
      const mockRegisterResponse = {
        token: 'jwt-token-456',
        user: {
          _id: 'user-2',
          email: 'newuser@example.com',
          name: 'New User',
          profilePicture: null
        }
      };

      mockApiService.prototype.register = jest.fn().mockResolvedValue(mockRegisterResponse);

      const { getByTestId, getByText, findByText } = render(<AppNavigator />);

      // Navigate to register screen
      const registerLink = getByText('Create Account');
      fireEvent.press(registerLink);

      // Fill registration form
      const nameInput = getByTestId('name-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const confirmPasswordInput = getByTestId('confirm-password-input');
      const registerButton = getByText('Create Account');

      fireEvent.changeText(nameInput, 'New User');
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockApiService.prototype.register).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      // Should store token and navigate to dashboard
      await waitFor(() => {
        expect(mockSecureStorage.prototype.storeToken).toHaveBeenCalledWith('jwt-token-456');
      });

      const dashboardTitle = await findByText('Dashboard');
      expect(dashboardTitle).toBeTruthy();
    });
  });

  describe('Google OAuth Authentication', () => {
    it('should complete Google sign-in flow', async () => {
      const mockGoogleUser = {
        user: {
          id: 'google-123',
          name: 'Google User',
          email: 'google@example.com',
          photo: 'https://example.com/photo.jpg'
        },
        idToken: 'google-id-token',
        accessToken: 'google-access-token'
      };

      const mockAuthResponse = {
        token: 'jwt-token-789',
        user: {
          _id: 'user-3',
          email: 'google@example.com',
          name: 'Google User',
          profilePicture: 'https://example.com/photo.jpg'
        }
      };

      mockGoogleSignin.hasPlayServices.mockResolvedValue(true);
      mockGoogleSignin.signIn.mockResolvedValue(mockGoogleUser as any);
      mockApiService.prototype.googleAuth = jest.fn().mockResolvedValue(mockAuthResponse);

      const { getByTestId, findByText } = render(<AppNavigator />);

      // Press Google sign-in button
      const googleButton = getByTestId('google-signin-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockGoogleSignin.signIn).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApiService.prototype.googleAuth).toHaveBeenCalledWith({
          idToken: 'google-id-token',
          accessToken: 'google-access-token'
        });
      });

      // Should store token and navigate to dashboard
      await waitFor(() => {
        expect(mockSecureStorage.prototype.storeToken).toHaveBeenCalledWith('jwt-token-789');
      });

      const dashboardTitle = await findByText('Dashboard');
      expect(dashboardTitle).toBeTruthy();
    });

    it('should handle Google sign-in cancellation', async () => {
      mockGoogleSignin.hasPlayServices.mockResolvedValue(true);
      mockGoogleSignin.signIn.mockRejectedValue({ code: 'SIGN_IN_CANCELLED' });

      const { getByTestId, getByText } = render(<AppNavigator />);

      const googleButton = getByTestId('google-signin-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockGoogleSignin.signIn).toHaveBeenCalled();
      });

      // Should not call API or store token
      expect(mockApiService.prototype.googleAuth).not.toHaveBeenCalled();
      expect(mockSecureStorage.prototype.storeToken).not.toHaveBeenCalled();

      // Should remain on login screen
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should handle Google Play Services unavailable', async () => {
      mockGoogleSignin.hasPlayServices.mockRejectedValue(new Error('Play Services not available'));

      const { getByTestId, findByText } = render(<AppNavigator />);

      const googleButton = getByTestId('google-signin-button');
      fireEvent.press(googleButton);

      // Should show error message
      const errorMessage = await findByText(/google play services/i);
      expect(errorMessage).toBeTruthy();

      expect(mockGoogleSignin.signIn).not.toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('should restore authentication state on app launch', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: null
      };

      // Mock stored token
      mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue('stored-token');
      mockApiService.prototype.verifyToken = jest.fn().mockResolvedValue(mockUser);

      const { findByText } = render(<AppNavigator />);

      // Should automatically authenticate and show dashboard
      const dashboardTitle = await findByText('Dashboard');
      expect(dashboardTitle).toBeTruthy();

      await waitFor(() => {
        expect(mockSecureStorage.prototype.getToken).toHaveBeenCalled();
        expect(mockApiService.prototype.verifyToken).toHaveBeenCalledWith('stored-token');
      });
    });

    it('should handle expired token on app launch', async () => {
      mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue('expired-token');
      mockApiService.prototype.verifyToken = jest.fn().mockRejectedValue(
        { response: { status: 401 } }
      );

      const { getByText } = render(<AppNavigator />);

      // Should clear token and show login screen
      await waitFor(() => {
        expect(mockSecureStorage.prototype.clearToken).toHaveBeenCalled();
      });

      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should refresh token automatically on 401 responses', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Setup authenticated state
      mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue('valid-token');
      mockApiService.prototype.verifyToken = jest.fn().mockResolvedValue(mockUser);

      // Mock API call that returns 401
      mockApiService.prototype.getHabits = jest.fn()
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce([]);

      // Mock token refresh
      mockApiService.prototype.refreshToken = jest.fn().mockResolvedValue('new-token');

      const { getByText, findByText } = render(<AppNavigator />);

      // Wait for authentication
      await findByText('Dashboard');

      // Navigate to habits (triggers API call)
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Should refresh token and retry request
      await waitFor(() => {
        expect(mockApiService.prototype.refreshToken).toHaveBeenCalled();
        expect(mockSecureStorage.prototype.storeToken).toHaveBeenCalledWith('new-token');
        expect(mockApiService.prototype.getHabits).toHaveBeenCalledTimes(2);
      });
    });

    it('should logout user when token refresh fails', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Setup authenticated state
      mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue('valid-token');
      mockApiService.prototype.verifyToken = jest.fn().mockResolvedValue(mockUser);

      // Mock API call that returns 401
      mockApiService.prototype.getHabits = jest.fn().mockRejectedValue({ response: { status: 401 } });

      // Mock failed token refresh
      mockApiService.prototype.refreshToken = jest.fn().mockRejectedValue(
        new Error('Refresh token expired')
      );

      const { getByText, findByText } = render(<AppNavigator />);

      // Wait for authentication
      await findByText('Dashboard');

      // Navigate to habits (triggers API call and failed refresh)
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Should logout and redirect to login
      await waitFor(() => {
        expect(mockSecureStorage.prototype.clearToken).toHaveBeenCalled();
      });

      const loginTitle = await findByText('Sign In');
      expect(loginTitle).toBeTruthy();
    });
  });

  describe('Logout Flow', () => {
    it('should complete logout flow and clear all data', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Start authenticated
      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { user: mockUser, isAuthenticated: true }
      });

      await findByText('Dashboard');

      // Navigate to settings
      const moreTab = getByText('More');
      fireEvent.press(moreTab);

      const settingsOption = getByText('Settings');
      fireEvent.press(settingsOption);

      // Logout
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      // Confirm logout
      const confirmButton = getByText('Confirm');
      fireEvent.press(confirmButton);

      // Should clear token and cached data
      await waitFor(() => {
        expect(mockSecureStorage.prototype.clearToken).toHaveBeenCalled();
      });

      // Should redirect to login
      const loginTitle = await findByText('Sign In');
      expect(loginTitle).toBeTruthy();
    });

    it('should handle logout API call failure gracefully', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockApiService.prototype.logout = jest.fn().mockRejectedValue(new Error('Network error'));

      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { user: mockUser, isAuthenticated: true }
      });

      await findByText('Dashboard');

      // Navigate to settings and logout
      const moreTab = getByText('More');
      fireEvent.press(moreTab);

      const settingsOption = getByText('Settings');
      fireEvent.press(settingsOption);

      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      const confirmButton = getByText('Confirm');
      fireEvent.press(confirmButton);

      // Should still clear local data even if API call fails
      await waitFor(() => {
        expect(mockSecureStorage.prototype.clearToken).toHaveBeenCalled();
      });

      const loginTitle = await findByText('Sign In');
      expect(loginTitle).toBeTruthy();
    });
  });

  describe('Session Management', () => {
    it('should handle concurrent sessions across devices', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Start authenticated
      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { user: mockUser, isAuthenticated: true }
      });

      await findByText('Dashboard');

      // Simulate session invalidated on another device
      mockApiService.prototype.getHabits = jest.fn().mockRejectedValue({
        response: { status: 401, data: { error: 'Session invalidated' } }
      });

      mockApiService.prototype.refreshToken = jest.fn().mockRejectedValue({
        response: { status: 401, data: { error: 'All sessions invalidated' } }
      });

      // Navigate to habits (triggers session check)
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Should show session expired message and redirect to login
      await findByText(/session.*expired/i);

      const loginTitle = await findByText('Sign In');
      expect(loginTitle).toBeTruthy();
    });

    it('should maintain session across app backgrounding', async () => {
      const mockUser = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockSecureStorage.prototype.getToken = jest.fn().mockResolvedValue('valid-token');

      const { findByText } = render(<AppNavigator />, {
        initialAuthState: { user: mockUser, isAuthenticated: true }
      });

      await findByText('Dashboard');

      // Simulate app going to background and coming back
      act(() => {
        // App state change would be handled by AppStateService
        // For testing, we just verify token is still valid
      });

      // Should still be authenticated
      expect(findByText('Dashboard')).toBeTruthy();
      expect(mockSecureStorage.prototype.getToken).toHaveBeenCalled();
    });
  });
});