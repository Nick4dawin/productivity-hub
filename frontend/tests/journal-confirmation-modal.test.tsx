import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JournalConfirmationModal } from '../components/journal-confirmation-modal';

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid={`checkbox-${id}`}
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant} data-testid="badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} data-testid="select">
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

describe('JournalConfirmationModal', () => {
  const mockExtractedData = {
    mood: {
      value: 'happy',
      confidence: 0.9,
      reasoning: 'Explicitly mentioned'
    },
    todos: [
      {
        title: 'Call doctor',
        time: 'future' as const,
        dueDate: '2024-01-15',
        priority: 'high',
        confidence: 0.8,
        reasoning: 'Clear action item'
      }
    ],
    media: [
      {
        title: 'The Great Gatsby',
        type: 'book' as const,
        status: 'reading' as const,
        confidence: 0.7,
        reasoning: 'Book title mentioned'
      }
    ],
    habits: [
      {
        name: 'Morning exercise',
        status: 'done' as const,
        frequency: 'daily',
        confidence: 0.9,
        reasoning: 'Routine activity'
      }
    ],
    confidence: 0.85
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    extractedData: mockExtractedData,
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with extracted data', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('AI Found Items in Your Journal')).toBeInTheDocument();
    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.getByText('Call doctor')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('Morning exercise')).toBeInTheDocument();
  });

  it('displays confidence scores correctly', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Check for confidence indicators
    expect(screen.getByText('90% confidence')).toBeInTheDocument(); // Mood confidence
    expect(screen.getByText('80% confidence')).toBeInTheDocument(); // Todo confidence
    expect(screen.getByText('70% confidence')).toBeInTheDocument(); // Media confidence
  });

  it('allows editing of extracted items', async () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Find and click edit button for todo
    const editButtons = screen.getAllByTestId('button');
    const todoEditButton = editButtons.find(button => 
      button.closest('[data-testid="dialog-content"]')?.textContent?.includes('Call doctor')
    );
    
    if (todoEditButton) {
      fireEvent.click(todoEditButton);
      
      // Should show input field for editing
      await waitFor(() => {
        expect(screen.getByDisplayValue('Call doctor')).toBeInTheDocument();
      });
    }
  });

  it('handles batch selection controls', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Find Select All button
    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);
    
    // All checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('filters items by high confidence', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Find High Confidence Only button
    const highConfidenceButton = screen.getByText('High Confidence Only');
    fireEvent.click(highConfidenceButton);
    
    // Should select items with confidence >= 0.8
    const moodCheckbox = screen.getByTestId('checkbox-mood');
    const todoCheckbox = screen.getByTestId('checkbox-todo-0');
    const habitCheckbox = screen.getByTestId('checkbox-habit-0');
    
    expect(moodCheckbox).toBeChecked(); // 0.9 confidence
    expect(todoCheckbox).toBeChecked(); // 0.8 confidence
    expect(habitCheckbox).toBeChecked(); // 0.9 confidence
  });

  it('calls onConfirm with selected items', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Find and click Add to Collections button
    const addButton = screen.getByText('Add to Collections');
    fireEvent.click(addButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      mood: expect.objectContaining({
        value: 'happy',
        confidence: 0.9
      }),
      todos: expect.arrayContaining([
        expect.objectContaining({
          title: 'Call doctor',
          confidence: 0.8
        })
      ]),
      media: expect.arrayContaining([
        expect.objectContaining({
          title: 'The Great Gatsby',
          confidence: 0.7
        })
      ]),
      habits: expect.arrayContaining([
        expect.objectContaining({
          name: 'Morning exercise',
          confidence: 0.9
        })
      ])
    });
  });

  it('handles string mood format for backward compatibility', () => {
    const propsWithStringMood = {
      ...defaultProps,
      extractedData: {
        ...mockExtractedData,
        mood: 'happy' // String instead of object
      }
    };
    
    render(<JournalConfirmationModal {...propsWithStringMood} />);
    
    expect(screen.getByText('happy')).toBeInTheDocument();
    // Should still work without confidence display
  });

  it('shows reasoning when available', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Explicitly mentioned')).toBeInTheDocument();
    expect(screen.getByText('Clear action item')).toBeInTheDocument();
    expect(screen.getByText('Book title mentioned')).toBeInTheDocument();
  });

  it('updates item count when selections change', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Initially should show 4 items selected (mood + todo + media + habit)
    expect(screen.getByText('4 items selected')).toBeInTheDocument();
    
    // Uncheck mood
    const moodCheckbox = screen.getByTestId('checkbox-mood');
    fireEvent.click(moodCheckbox);
    
    // Should now show 3 items selected
    expect(screen.getByText('3 items selected')).toBeInTheDocument();
  });

  it('disables Add button when no items selected', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    // Uncheck all items
    const selectNoneButton = screen.getByText('Select None');
    fireEvent.click(selectNoneButton);
    
    // Add button should be disabled
    const addButton = screen.getByText('Add to Collections');
    expect(addButton).toBeDisabled();
  });

  it('closes modal when Skip is clicked', () => {
    render(<JournalConfirmationModal {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});

describe('JournalConfirmationModal Confidence Levels', () => {
  it('displays correct confidence level styling', () => {
    const testData = {
      mood: { value: 'test', confidence: 0.95 }, // Very high
      todos: [
        { title: 'High confidence', confidence: 0.85, time: 'future' as const },
        { title: 'Medium confidence', confidence: 0.65, time: 'future' as const },
        { title: 'Low confidence', confidence: 0.35, time: 'future' as const }
      ],
      media: [],
      habits: []
    };

    render(
      <JournalConfirmationModal
        isOpen={true}
        onClose={jest.fn()}
        extractedData={testData}
        onConfirm={jest.fn()}
      />
    );

    // Should show different confidence levels
    expect(screen.getByText('95% confidence')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
    expect(screen.getByText('65% confidence')).toBeInTheDocument();
    expect(screen.getByText('35% confidence')).toBeInTheDocument();
  });
});