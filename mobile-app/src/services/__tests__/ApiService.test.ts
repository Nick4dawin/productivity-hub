// Mock dependencies first
jest.mock('axios');
jest.mock('@react-native-community/netinfo');
jest.mock('../SecureStorage');

import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { SecureStorage } from '../SecureStorage';
import {
  ApiError,
  NetworkError,
  AuthError,
  OfflineError,
  LoginCredentials,
  RegisterData,
} from '@/types';

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockSecureStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;

// Mock axios instance
const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Mock axios.create before importing ApiService
mockAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

// Now import ApiService after mocks are set up
import { ApiService, apiService } from '../ApiService';

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock to return our mock instance
    mockAxios.create.mockReturnValue(mockAxiosInstance as any);
    
    // Mock NetInfo to return connected by default
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as any);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ApiService.getInstance();
      const instance2 = ApiService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Request Interceptors', () => {
    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should add auth token to requests when available', async () => {
      const mockToken = 'test-token';
      mockSecureStorage.getToken.mockResolvedValue(mockToken);

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(result.headers['X-Request-ID']).toBeDefined();
    });

    it('should throw NetworkError when offline', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      await expect(requestInterceptor({ headers: {} })).rejects.toThrow(NetworkError);
    });
  });

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('should login successfully and store tokens', async () => {
        const credentials: LoginCredentials = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockResponse = {
          token: 'auth-token',
          user: { _id: '1', email: 'test@example.com', name: 'Test User' },
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockResponse,
          status: 200,
        });

        const result = await apiService.login(credentials);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/auth/login',
          data: credentials,
        });

        expect(mockSecureStorage.storeToken).toHaveBeenCalledWith('auth-token');
        expect(mockSecureStorage.storeUserData).toHaveBeenCalledWith(
          JSON.stringify(mockResponse.user)
        );
        expect(result).toEqual(mockResponse);
      });

      it('should throw ApiError on login failure', async () => {
        const credentials: LoginCredentials = {
          email: 'test@example.com',
          password: 'wrong-password',
        };

        mockAxiosInstance.request.mockRejectedValue({
          response: {
            status: 401,
            data: { message: 'Invalid credentials' },
          },
        });

        await expect(apiService.login(credentials)).rejects.toThrow(ApiError);
      });
    });

    describe('register', () => {
      it('should register successfully and store tokens', async () => {
        const userData: RegisterData = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };

        const mockResponse = {
          token: 'auth-token',
          user: { _id: '1', email: 'test@example.com', name: 'Test User' },
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockResponse,
          status: 201,
        });

        const result = await apiService.register(userData);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/auth/register',
          data: userData,
        });

        expect(mockSecureStorage.storeToken).toHaveBeenCalledWith('auth-token');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('googleLogin', () => {
      it('should login with Google token successfully', async () => {
        const googleToken = 'google-token';
        const mockResponse = {
          token: 'auth-token',
          user: { _id: '1', email: 'test@example.com', name: 'Test User' },
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockResponse,
          status: 200,
        });

        const result = await apiService.googleLogin(googleToken);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/auth/google',
          data: { token: googleToken },
        });

        expect(result).toEqual(mockResponse);
      });
    });

    describe('logout', () => {
      it('should logout and clear auth data', async () => {
        mockAxiosInstance.request.mockResolvedValue({ data: {}, status: 200 });

        await apiService.logout();

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/auth/logout',
        });

        expect(mockSecureStorage.clearAll).toHaveBeenCalled();
      });

      it('should clear auth data even if API call fails', async () => {
        mockAxiosInstance.request.mockRejectedValue(new Error('Network error'));

        await apiService.logout();

        expect(mockSecureStorage.clearAll).toHaveBeenCalled();
      });
    });
  });

  describe('Habit Methods', () => {
    describe('getHabits', () => {
      it('should fetch habits successfully', async () => {
        const mockHabits = [
          { _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 },
          { _id: '2', name: 'Read', category: 'Learning', completedDates: [], streak: 0 },
        ];

        mockAxiosInstance.request.mockResolvedValue({
          data: mockHabits,
          status: 200,
        });

        const result = await apiService.getHabits();

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/habits',
        });

        expect(result).toEqual(mockHabits);
      });
    });

    describe('createHabit', () => {
      it('should create habit successfully', async () => {
        const habitData = {
          name: 'Morning Exercise',
          category: 'Health',
          color: '#FF5722',
        };

        const mockHabit = {
          _id: '1',
          ...habitData,
          completedDates: [],
          streak: 0,
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockHabit,
          status: 201,
        });

        const result = await apiService.createHabit(habitData);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/habits',
          data: habitData,
        });

        expect(result).toEqual(mockHabit);
      });
    });

    describe('toggleHabitDate', () => {
      it('should toggle habit date successfully', async () => {
        const habitId = '1';
        const date = '2024-01-15';
        const mockHabit = {
          _id: habitId,
          name: 'Exercise',
          category: 'Health',
          completedDates: [date],
          streak: 1,
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockHabit,
          status: 200,
        });

        const result = await apiService.toggleHabitDate(habitId, date);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: `/api/habits/${habitId}/toggle`,
          data: { date },
        });

        expect(result).toEqual(mockHabit);
      });
    });
  });

  describe('Todo Methods', () => {
    describe('getTodos', () => {
      it('should fetch todos successfully', async () => {
        const mockTodos = [
          {
            _id: '1',
            title: 'Complete project',
            completed: false,
            priority: 'high' as const,
            category: 'Work',
          },
        ];

        mockAxiosInstance.request.mockResolvedValue({
          data: mockTodos,
          status: 200,
        });

        const result = await apiService.getTodos();

        expect(result).toEqual(mockTodos);
      });
    });

    describe('createTodo', () => {
      it('should create todo successfully', async () => {
        const todoData = {
          title: 'New task',
          priority: 'medium' as const,
          category: 'Personal',
        };

        const mockTodo = {
          _id: '1',
          ...todoData,
          completed: false,
        };

        mockAxiosInstance.request.mockResolvedValue({
          data: mockTodo,
          status: 201,
        });

        const result = await apiService.createTodo(todoData);

        expect(result).toEqual(mockTodo);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw NetworkError for network failures', async () => {
      mockAxiosInstance.request.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      });

      await expect(apiService.getHabits()).rejects.toThrow(NetworkError);
    });

    it('should throw ApiError for API failures', async () => {
      mockAxiosInstance.request.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      });

      await expect(apiService.getHabits()).rejects.toThrow(ApiError);
    });

    it('should handle API response with success: false', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {
          success: false,
          message: 'Operation failed',
        },
        status: 200,
      });

      await expect(apiService.getHabits()).rejects.toThrow(ApiError);
    });
  });

  describe('Offline Support', () => {
    it('should queue write operations when offline', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);

      // Mock the request interceptor to throw NetworkError
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      mockAxiosInstance.request.mockImplementation(async (config) => {
        await requestInterceptor(config); // This will throw NetworkError
      });

      const habitData = {
        name: 'Test Habit',
        category: 'Health',
      };

      await expect(apiService.createHabit(habitData)).rejects.toThrow(OfflineError);
    });
  });

  describe('Health Check', () => {
    it('should check API health successfully', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-15T10:00:00Z',
      };

      mockAxiosInstance.request.mockResolvedValue({
        data: mockHealth,
        status: 200,
      });

      const result = await apiService.checkHealth();

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/health',
      });

      expect(result).toEqual(mockHealth);
    });
  });
});