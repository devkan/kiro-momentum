import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoList } from './TodoList';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';
import * as fc from 'fast-check';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getTodos: vi.fn(() => []),
    setTodos: vi.fn(),
  },
}));

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation
    vi.mocked(StorageService.getTodos).mockReturnValue([]);
  });

  const renderTodoList = () => {
    return render(
      <ThemeProvider>
        <TodoList />
      </ThemeProvider>
    );
  };

  it('renders empty state message when no todos exist', () => {
    renderTodoList();
    expect(screen.getByText(/embrace possibility/i)).toBeInTheDocument();
  });

  it('loads todos from LocalStorage on mount', () => {
    const mockTodos = [
      { id: '1', text: 'Test todo', createdAt: Date.now() },
    ];
    vi.mocked(StorageService.getTodos).mockReturnValue(mockTodos);

    renderTodoList();
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('adds a new todo when form is submitted with valid text', () => {
    renderTodoList();
    
    const input = screen.getByPlaceholderText(/what is your focus/i);

    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('New task')).toBeInTheDocument();
  });

  it('clears input field after adding a todo', () => {
    renderTodoList();
    
    const input = screen.getByPlaceholderText(/what is your focus/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);

    expect(input.value).toBe('');
  });

  it('rejects empty string todo', () => {
    renderTodoList();
    
    const input = screen.getByPlaceholderText(/what is your focus/i);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/embrace possibility/i)).toBeInTheDocument();
  });

  it('rejects whitespace-only todo', () => {
    renderTodoList();
    
    const input = screen.getByPlaceholderText(/what is your focus/i);

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/embrace possibility/i)).toBeInTheDocument();
  });

  it('deletes a todo when delete button is clicked', () => {
    const mockTodos = [
      { id: '1', text: 'Test todo', createdAt: Date.now() },
    ];
    vi.mocked(StorageService.getTodos).mockReturnValue(mockTodos);

    renderTodoList();
    
    const deleteButton = screen.getByLabelText(/delete task: test todo/i);
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    expect(screen.getByText(/embrace possibility/i)).toBeInTheDocument();
  });

  it('persists todos to LocalStorage with debouncing', async () => {
    vi.useFakeTimers();
    
    try {
      renderTodoList();
      
      const input = screen.getByPlaceholderText(/what is your focus/i);

      fireEvent.change(input, { target: { value: 'New task' } });
      fireEvent.submit(input.closest('form')!);

      // Should not save immediately
      expect(StorageService.setTodos).not.toHaveBeenCalled();

      // Fast-forward 300ms
      await vi.advanceTimersByTimeAsync(300);

      expect(StorageService.setTodos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ text: 'New task' })
        ])
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('trims whitespace from todo text', () => {
    renderTodoList();
    
    const input = screen.getByPlaceholderText(/what is your focus/i);

    fireEvent.change(input, { target: { value: '  Task with spaces  ' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('Task with spaces')).toBeInTheDocument();
  });

  /**
   * Property-Based Test
   * Feature: devops-nightmare-dashboard, Property 4: Empty task rejection
   * Validates: Requirements 4.2
   */
  it('property: rejects all whitespace-only strings', () => {
    fc.assert(
      fc.property(
        // Generate strings composed entirely of whitespace characters
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r', '\v', '\f'), { minLength: 0, maxLength: 20 }),
        (whitespaceString) => {
          // Render a fresh TodoList for each test
          const { unmount } = renderTodoList();
          
          try {
            const input = screen.getByPlaceholderText(/what is your focus/i);

            // Attempt to add the whitespace-only string
            fireEvent.change(input, { target: { value: whitespaceString } });
            fireEvent.submit(input.closest('form')!);

            // The todo list should remain empty (showing the empty state message)
            const emptyMessage = screen.queryByText(/embrace possibility/i);
            expect(emptyMessage).toBeInTheDocument();
            
            // Verify no todo items were added
            const todoItems = screen.queryAllByRole('listitem');
            expect(todoItems).toHaveLength(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
