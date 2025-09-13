import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/services/ApiService';
import { SecureStorage } from '@/services/SecureStorage';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthError,
} from '@/types';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state and provides auth methods
 * Handles token persistence, automatic login restoration, and auth state management
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Set authentication error with user-friendly message
   */
  const setAuthError = (error: any) => {
    if (error instanceof AuthError) {
      setError(error.message);
    } else if (error?.message) {
      setError(error.message);
    } else {
      setError('An authentication error occurred');
    }
  };

  /**
   * Restore authentication state from stored tokens on app startup
   */
  const restoreAuthState = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have stored tokens
      const hasToken = await SecureStorage.hasToken();
      if (!hasToken) {
        setIsLoading(false);
        return;
      }

      // Try to get current user with stored token
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to restore auth state:', error);
      // Clear invalid tokens
      await SecureStorage.clearAll();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await apiService.login(credentials);
      setUser(response.user);
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google OAuth token
   */
  const googleLogin = async (googleToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await apiService.googleLogin(googleToken);
      setUser(response.user);
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear all auth data
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  /**
   * Refresh authentication state (useful after token refresh)
   */
  const refreshAuth = async () => {
    try {
      setError(null);

      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to refresh auth state:', error);
      setAuthError(error);
      // Don't clear user state on refresh failure unless it's an auth error
      if (error instanceof AuthError) {
        setUser(null);
        await SecureStorage.clearAll();
      }
    }
  };

  /**
   * Update user profile information
   */
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete user account permanently
   */
  const deleteAccount = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiService.deleteUserAccount(password);
      
      // Clear all local data after successful deletion
      setUser(null);
      await SecureStorage.clearAll();
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize auth state on component mount
   */
  useEffect(() => {
    restoreAuthState();
  }, []);

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    googleLogin,
    logout,
    refreshAuth,
    clearError,
    updateProfile,
    changePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Higher-order component to provide authentication context
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
};

/**
 * Hook to check if user has specific permissions (placeholder for future use)
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canAccessFeature: (feature: string) => {
      // Placeholder for permission checking logic
      return !!user;
    },
    isAdmin: () => {
      // Placeholder for admin checking logic
      return false;
    },
  };
};

export default AuthContext;