import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';
import { StorageService } from '../services/StorageService';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getUnsplashKey: vi.fn(),
    setUnsplashKey: vi.fn(),
    getWeatherKey: vi.fn(),
    setWeatherKey: vi.fn(),
  },
}));

describe('SettingsModal', () => {
  const mockOnClose = vi.fn();
  const mockOnApiKeySaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <SettingsModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Unsplash API Key')).toBeInTheDocument();
  });

  it('should load existing API key from storage when opened', () => {
    const existingKey = 'test-api-key-123';
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(existingKey);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const input = screen.getByLabelText('Unsplash API Key') as HTMLInputElement;
    expect(input.value).toBe(existingKey);
  });

  it('should allow submission with empty API keys (optional fields)', async () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    vi.mocked(StorageService.getWeatherKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Should still save (both keys are optional)
    expect(mockOnApiKeySaved).toHaveBeenCalled();
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('should save API keys to storage on submit', async () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    vi.mocked(StorageService.getWeatherKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const unsplashInput = screen.getByLabelText('Unsplash API Key');
    const weatherInput = screen.getByLabelText('OpenWeatherMap API Key');
    const newUnsplashKey = 'new-unsplash-key-456';
    const newWeatherKey = 'new-weather-key-789';
    
    fireEvent.change(unsplashInput, { target: { value: newUnsplashKey } });
    fireEvent.change(weatherInput, { target: { value: newWeatherKey } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(StorageService.setUnsplashKey).toHaveBeenCalledWith(newUnsplashKey);
    expect(StorageService.setWeatherKey).toHaveBeenCalledWith(newWeatherKey);
    expect(mockOnApiKeySaved).toHaveBeenCalled();
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const closeButton = screen.getByLabelText('Close settings');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should trim whitespace from API key before saving', () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const input = screen.getByLabelText('Unsplash API Key');
    const keyWithSpaces = '  api-key-with-spaces  ';
    
    fireEvent.change(input, { target: { value: keyWithSpaces } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(StorageService.setUnsplashKey).toHaveBeenCalledWith('api-key-with-spaces');
  });

  it('should handle storage errors gracefully', () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
    vi.mocked(StorageService.setUnsplashKey).mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    render(
      <SettingsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onApiKeySaved={mockOnApiKeySaved} 
      />
    );
    
    const input = screen.getByLabelText('Unsplash API Key');
    fireEvent.change(input, { target: { value: 'test-key' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Storage quota exceeded')).toBeInTheDocument();
    expect(mockOnApiKeySaved).not.toHaveBeenCalled();
  });
});
