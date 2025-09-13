import React from 'react';
import { render, fireEvent, waitFor } from '../../test-utils';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { AddHabitScreen } from '../../screens/habits/AddHabitScreen';
import { createMockApiService, mockHabit } from '../../test-utils';

// Mock the API service
const mockApiService = createMockApiService();
jest.mock('../../services/ApiService', () => ({
  apiService: mockApiService,
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  reset: jest.fn(),
  setOptions: jest.fn(),
};

describe('Habit Management Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Habits List', () => {
    it('should load and display habits', async () => {
      const { getByText, findByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      // Wait for habits to load
      await waitFor(() => {
        expect(mockApiService.getHabits).toHaveBeenCalled();
      });

      const habitName = await findByText(mockHabit.name);
      expect(habitName).toBeTruthy();
    });

    it('should toggle habit completion', async () => {
      const { getByTestId, findByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      // Wait for habits to load
      await findByText(mockHabit.name);

      // Find and press the toggle button
      const toggleButton = getByTestId(`habit-toggle-${mockHabit._id}`);
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(mockApiService.toggleHabitDate).toHaveBeenCalledWith(
          mockHabit._id,
          expect.any(String) // Today's date
        );
      });
    });

    it('should navigate to add habit screen', () => {
      const { getByTestId } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const addButton = getByTestId('add-habit-button');
      fireEvent.press(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('AddHabit');
    });

    it('should show empty state when no habits exist', async () => {
      mockApiService.getHabits.mockResolvedValueOnce([]);

      const { findByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const emptyMessage = await findByText(/no habits/i);
      expect(emptyMessage).toBeTruthy();
    });
  });

  describe('Add Habit Flow', () => {
    it('should create a new habit successfully', async () => {
      const { getByTestId, getByText } = render(
        <AddHabitScreen navigation={mockNavigation as any} route={{} as any} />
      );

      // Fill in the form
      const nameInput = getByTestId('habit-name-input');
      const categoryInput = getByTestId('habit-category-input');
      const saveButton = getByText('Save Habit');

      fireEvent.changeText(nameInput, 'New Habit');
      fireEvent.changeText(categoryInput, 'Health');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockApiService.createHabit).toHaveBeenCalledWith({
          name: 'New Habit',
          category: 'Health',
        });
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const { getByText, findByText } = render(
        <AddHabitScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const saveButton = getByText('Save Habit');
      fireEvent.press(saveButton);

      const errorMessage = await findByText(/name is required/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.createHabit.mockRejectedValueOnce(new Error('Network error'));

      const { getByTestId, getByText, findByText } = render(
        <AddHabitScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const nameInput = getByTestId('habit-name-input');
      const saveButton = getByText('Save Habit');

      fireEvent.changeText(nameInput, 'New Habit');
      fireEvent.press(saveButton);

      const errorMessage = await findByText(/failed to create habit/i);
      expect(errorMessage).toBeTruthy();
    });

    it('should cancel and go back', () => {
      const { getByText } = render(
        <AddHabitScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Habit Streak Tracking', () => {
    it('should display current streak', async () => {
      const { findByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      const streakText = await findByText(`${mockHabit.streak} day streak`);
      expect(streakText).toBeTruthy();
    });

    it('should update streak when habit is completed', async () => {
      const updatedHabit = { ...mockHabit, streak: mockHabit.streak + 1 };
      mockApiService.toggleHabitDate.mockResolvedValueOnce(updatedHabit);

      const { getByTestId, findByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      // Wait for initial load
      await findByText(mockHabit.name);

      const toggleButton = getByTestId(`habit-toggle-${mockHabit._id}`);
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(findByText(`${updatedHabit.streak} day streak`)).toBeTruthy();
      });
    });
  });

  describe('Habit Categories', () => {
    it('should filter habits by category', async () => {
      const healthHabit = { ...mockHabit, _id: 'habit1', category: 'Health' };
      const workHabit = { ...mockHabit, _id: 'habit2', name: 'Work Habit', category: 'Work' };
      
      mockApiService.getHabits.mockResolvedValueOnce([healthHabit, workHabit]);

      const { getByTestId, findByText, queryByText } = render(
        <HabitsScreen navigation={mockNavigation as any} route={{} as any} />
      );

      // Wait for habits to load
      await findByText(healthHabit.name);
      await findByText(workHabit.name);

      // Filter by Health category
      const categoryFilter = getByTestId('category-filter');
      fireEvent(categoryFilter, 'valueChange', 'Health');

      await waitFor(() => {
        expect(queryByText(workHabit.name)).toBeFalsy();
      });
    });
  });
});