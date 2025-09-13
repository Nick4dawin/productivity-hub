// Mock dependencies first
jest.mock('@/services/ApiService');
jest.mock('@/services/SecureStorage');

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiService } from '@/services/ApiService';
import { SecureStorage } from '@/services/SecureStorage';
import { AuthError } from '@/types';

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockSecureStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
  } = useAuth();

  return (
    <>
      <Text testID="user">{user ? user.name : 'No user'}</Text>
      <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
      <Text testID="isLoading">{isLoading.toString()}</Text>
      <Text testID="error">{error || 'No error'}</Text>
    </>
  );
};

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      mockSecureStorage.hasToken.mockResolvedValue(false);

      const { getByTestId } = renderWithAuth();

      expect(getByTestId('user')).toHaveTextContent('No user');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(getByTestId('isLoading')).toHaveTextContent('true');
      expect(getByTestId('error')).toHaveTextContent('No error');
    });

    it('should restore auth state when token exists', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockSecureStorage.hasToken.mockResolvedValue(true);
      mockApiService.getCurrentUser.mockResolvedValue(mockUser);

      const { getByTestId } = renderWithAuth();

      await waitFor(() => {
        expect(getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(getByTestId('user')).toHaveTextContent('Test User');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(getByTestId('error')).toHaveTextContent('No error');
    });

    it('should clear invalid tokens on restore failure', async () => {
      mockSecureStorage.hasToken.mockResolvedValue(true);
      mockApiService.getCurrentUser.mockRejectedValue(new AuthError('Invalid token'));

      const { getByTestId } = renderWithAuth();

      await waitFor(() => {
        expect(getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(getByTestId('user')).toHaveTextContent('No user');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(mockSecureStorage.clearAll).toHaveBeenCalled();
    });

    it('should handle no stored token gracefully', async () => {
      mockSecureStorage.hasToken.mockResolvedValue(false);

      const { getByTestId } = renderWithAuth();

      await waitFor(() => {
        expect(getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(getByTestId('user')).toHaveTextContent('No user');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(mockApiService.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Basic Functionality', () => {
    it('should provide authentication context', async () => {
      mockSecureStorage.hasToken.mockResolvedValue(false);

      const { getByTestId } = renderWithAuth();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(getByTestId('isLoading')).toHaveTextContent('false');
      });

      expect(getByTestId('user')).toHaveTextContent('No user');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(getByTestId('error')).toHaveTextContent('No error');
    });
  });



  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const TestComponentWithoutProvider = () => {
        useAuth();
        return <Text>Test</Text>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});