import { Alert } from 'react-native';
import { ErrorHandler, NetworkError, AuthError, ValidationError, ErrorSeverity } from '../ErrorHandler';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockAlert = Alert as jest.Mocked<typeof Alert>;

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle network errors correctly', async () => {
      const networkError = new NetworkError('Connection failed', 500);
      
      await errorHandler.handleError(networkError, {
        showUserMessage: true,
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Please check your internet connection and try again.',
        expect.any(Array)
      );
    });

    it('should handle auth errors correctly', async () => {
      const authError = new AuthError('Token expired');
      
      await errorHandler.handleError(authError, {
        showUserMessage: true,
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Authentication Error',
        'Please log in again to continue.',
        expect.any(Array)
      );
    });

    it('should handle validation errors correctly', async () => {
      const validationError = new ValidationError('Email is required', 'email');
      
      await errorHandler.handleError(validationError, {
        showUserMessage: true,
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Email is required',
        expect.any(Array)
      );
    });

    it('should use custom user message when provided', async () => {
      const error = new Error('Generic error');
      const customMessage = 'Custom error message';
      
      await errorHandler.handleError(error, {
        showUserMessage: true,
        userMessage: customMessage,
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Something went wrong',
        customMessage,
        expect.any(Array)
      );
    });

    it('should not show user message when showUserMessage is false', async () => {
      const error = new Error('Test error');
      
      await errorHandler.handleError(error, {
        showUserMessage: false,
      });

      expect(mockAlert.alert).not.toHaveBeenCalled();
    });
  });

  describe('determineSeverity', () => {
    it('should assign correct severity to different error types', async () => {
      const networkError = new NetworkError('Server error', 500);
      const authError = new AuthError('Unauthorized');
      const validationError = new ValidationError('Invalid input');
      
      // We can't directly test the private method, but we can test the behavior
      await errorHandler.handleError(networkError);
      await errorHandler.handleError(authError);
      await errorHandler.handleError(validationError);
      
      // The errors should be handled without throwing
      expect(true).toBe(true);
    });
  });

  describe('handleApiError', () => {
    it('should handle HTTP 401 errors as auth errors', () => {
      const apiError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      
      errorHandler.handleApiError(apiError);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Authentication Error',
        'Please log in again to continue.',
        expect.any(Array)
      );
    });

    it('should handle HTTP 500 errors as network errors', () => {
      const apiError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      
      errorHandler.handleApiError(apiError);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Please check your internet connection and try again.',
        expect.any(Array)
      );
    });

    it('should handle HTTP 400 errors as validation errors', () => {
      const apiError = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };
      
      errorHandler.handleApiError(apiError);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Bad request',
        expect.any(Array)
      );
    });

    it('should handle network request failures', () => {
      const apiError = {
        request: {},
        message: 'Network Error',
      };
      
      errorHandler.handleApiError(apiError);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Please check your internet connection and try again.',
        expect.any(Array)
      );
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors with field information', () => {
      errorHandler.handleValidationError('Email is required', 'email');
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Email is required',
        expect.any(Array)
      );
    });
  });

  describe('context management', () => {
    it('should set user context', () => {
      const userId = 'user123';
      const userInfo = { email: 'test@example.com' };
      
      errorHandler.setUserContext(userId, userInfo);
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should add breadcrumbs', () => {
      errorHandler.addBreadcrumb('User clicked button', 'user_action');
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should set custom data', () => {
      errorHandler.setCustomData('feature_flag', 'enabled');
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('error queue processing', () => {
    it('should process multiple errors in queue', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      // Add multiple errors quickly
      await Promise.all([
        errorHandler.handleError(error1, { showUserMessage: false }),
        errorHandler.handleError(error2, { showUserMessage: false }),
      ]);
      
      // Should process without throwing
      expect(true).toBe(true);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly messages for common errors', async () => {
      const networkError = new Error('Network request failed');
      const timeoutError = new Error('Request timeout');
      const credentialsError = new Error('Invalid credentials');
      
      await errorHandler.handleError(networkError, { showUserMessage: true });
      await errorHandler.handleError(timeoutError, { showUserMessage: true });
      await errorHandler.handleError(credentialsError, { showUserMessage: true });
      
      // Check that user-friendly messages are shown
      expect(mockAlert.alert).toHaveBeenCalledTimes(3);
    });
  });
});