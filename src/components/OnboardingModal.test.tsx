import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingModal } from './OnboardingModal';
import { StorageService } from '../services/StorageService';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    setUserName: vi.fn(),
  },
}));

describe('OnboardingModal', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with welcome message', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to DevOps Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText("What's your name?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('prevents submission with empty name', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
    expect(StorageService.setUserName).not.toHaveBeenCalled();
  });

  it('prevents submission with whitespace-only name', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: '   ' } });
    
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
    expect(StorageService.setUserName).not.toHaveBeenCalled();
  });

  it('saves valid name to storage and calls onComplete', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    
    expect(StorageService.setUserName).toHaveBeenCalledWith('John Doe');
    expect(mockOnComplete).toHaveBeenCalledWith('John Doe');
  });

  it('trims whitespace from name before saving', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: '  Jane Smith  ' } });
    
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    
    expect(StorageService.setUserName).toHaveBeenCalledWith('Jane Smith');
    expect(mockOnComplete).toHaveBeenCalledWith('Jane Smith');
  });

  it('clears error message when user starts typing', () => {
    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    // Trigger error by submitting empty form
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    
    // Start typing
    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: 'J' } });
    
    // Error should be cleared
    expect(screen.queryByText('Please enter your name')).not.toBeInTheDocument();
  });

  it('handles storage errors gracefully', () => {
    const storageError = new Error('Storage quota exceeded');
    vi.mocked(StorageService.setUserName).mockImplementation(() => {
      throw storageError;
    });

    render(<OnboardingModal onComplete={mockOnComplete} />);
    
    const input = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    const submitButton = screen.getByText('Get Started');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Storage quota exceeded')).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
