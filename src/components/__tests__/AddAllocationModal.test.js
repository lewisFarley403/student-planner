import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddAllocationModal from '../AddAllocationModal'; // Adjust path if needed

// Mock props
const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();
const initialDate = new Date(2024, 5, 15); // June 15, 2024
const goals = ['Goal 1', 'Goal 2', 'Goal 3'];

// Helper function to render the modal with default props
const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    initialDate: initialDate,
    goals: goals,
    goalsLoading: false,
    goalsError: null,
  };
  return render(<AddAllocationModal {...defaultProps} {...props} />);
};

describe('AddAllocationModal Component (Blackbox Tests)', () => {
  // Clear mocks before each test
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  test('renders correctly when open', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: /add study allocation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/goal\/module/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save allocation/i })).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('heading', { name: /add study allocation/i })).not.toBeInTheDocument();
  });

  test('displays goal options correctly', () => {
    renderModal();
    const goalSelect = screen.getByLabelText(/goal\/module/i);
    expect(goalSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /-- select goal --/i })).toBeInTheDocument();
    goals.forEach(goal => {
      expect(screen.getByRole('option', { name: goal })).toBeInTheDocument();
    });
  });

  test('shows loading state for goals', () => {
    renderModal({ goalsLoading: true });
    expect(screen.getByText(/loading goals.../i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/goal\/module/i)).not.toBeInTheDocument(); // Select is hidden
    expect(screen.getByRole('button', { name: /save allocation/i })).toBeDisabled(); // Save disabled while loading
  });

  test('shows error state for goals', () => {
    const errorMsg = 'Failed to fetch';
    renderModal({ goalsError: errorMsg });
    expect(screen.getByText(`Error loading goals: ${errorMsg}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(/goal\/module/i)).not.toBeInTheDocument(); // Select is hidden
    expect(screen.getByRole('button', { name: /save allocation/i })).toBeDisabled(); // Save disabled on error
  });

  test('initializes date input with initialDate prop', () => {
    renderModal();
    const dateInput = screen.getByLabelText(/date/i);
    expect(dateInput).toHaveValue('2024-06-15'); // Check YYYY-MM-DD format
  });

  test('calls onClose when Cancel button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // --- Input and Validation Tests ---

  test('updates state when inputs change', () => {
    renderModal();
    const goalSelect = screen.getByLabelText(/goal\/module/i);
    const dateInput = screen.getByLabelText(/date/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);

    fireEvent.change(goalSelect, { target: { value: 'Goal 1' } });
    fireEvent.change(dateInput, { target: { value: '2024-06-16' } });
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });

    expect(goalSelect).toHaveValue('Goal 1');
    expect(dateInput).toHaveValue('2024-06-16');
    expect(startTimeInput).toHaveValue('09:00');
    expect(endTimeInput).toHaveValue('10:00');
  });

  test('shows validation error if goal is not selected on submit', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));
    expect(screen.getByText(/please select a goal/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error if date is missing on submit', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: 'Goal 1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '' } }); // Clear date
    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));
    expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error if start time is missing on submit', () => {
    renderModal();
    // Fill other fields
    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: 'Goal 1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-06-16' } });
    // Start time empty
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: '10:00' } });

    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));
    expect(screen.getByText(/please select a start time/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

    test('shows validation error if end time is missing on submit', () => {
    renderModal();
    // Fill other fields
    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: 'Goal 1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-06-16' } });
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '09:00' } });
    // End time empty

    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));
    expect(screen.getByText(/please select an end time/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error if end time is not after start time', () => {
    renderModal();
    // Fill fields with invalid times
    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: 'Goal 1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-06-16' } });
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: '09:00' } }); // End before start

    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));
    expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // --- Submission Tests ---

  test('calls onSubmit with correct data when form is valid', async () => {
    renderModal();
    const goal = 'Goal 2';
    const date = '2024-06-17';
    const startTime = '14:00';
    const endTime = '15:30';

    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: goal } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: date } });
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: startTime } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: endTime } });

    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));

    // Expect onSubmit to be called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        module_title: goal,
        date: date,
        startTime: startTime,
        endTime: endTime,
      });
    });

    // Check button text changes to 'Saving...' (requires onSubmit to be async and handle state)
    expect(screen.getByRole('button', { name: /saving.../i })).toBeInTheDocument();

    // Further check: ensure error message is NOT displayed
     expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // Assuming error uses alert role or similar
  });

   test('displays error message if onSubmit promise rejects', async () => {
    const submitErrorMsg = 'API Failed';
    // Make the mock onSubmit reject
    mockOnSubmit.mockRejectedValueOnce(new Error(submitErrorMsg));

    renderModal();
    // Fill with valid data
    fireEvent.change(screen.getByLabelText(/goal\/module/i), { target: { value: 'Goal 1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-06-16' } });
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: '10:00' } });

    fireEvent.click(screen.getByRole('button', { name: /save allocation/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(submitErrorMsg)).toBeInTheDocument();
    });

    // Ensure submit was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    // Ensure button is enabled again after error
    expect(screen.getByRole('button', { name: /save allocation/i })).toBeEnabled();
   });

}); 