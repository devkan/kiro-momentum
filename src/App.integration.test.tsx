import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { StorageService } from './services/StorageService';

// Mock the StorageService
vi.mock('./services/StorageService', () => ({
  StorageService: {
    getUserName: vi.fn(),
    setUserName: vi.fn(),
    getTodos: vi.fn(() => []),
    setTodos: vi.fn(),
    getUnsplashKey: vi.fn(() => null),
    setUnsplashKey: vi.fn(),
    getWeatherKey: vi.fn(() => null),
    setWeatherKey: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default geolocation mock
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      });
    });

    // Default fetch mock for weather API
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        main: { temp: 20 },
        weather: [{ icon: '01d', description: 'clear sky' }],
      }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Onboarding Flow', () => {
    it('should complete the full onboarding flow from first load to dashboard', async () => {
      // Setup: No user name exists (first load)
      vi.mocked(StorageService.getUserName).mockReturnValue(null);

      render(<App />);

      // Step 1: Verify onboarding modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevOps Dashboard')).toBeInTheDocument();
      });

      // Step 2: Verify input field is present
      const nameInput = screen.getByPlaceholderText('Enter your name');
      expect(nameInput).toBeInTheDocument();

      // Step 3: Enter a name
      await userEvent.type(nameInput, 'Alice');
      expect(nameInput).toHaveValue('Alice');

      // Step 4: Submit the form
      const submitButton = screen.getByRole('button', { name: /get started/i });
      await userEvent.click(submitButton);

      // Step 5: Verify storage was called with the correct name
      await waitFor(() => {
        expect(StorageService.setUserName).toHaveBeenCalledWith('Alice');
      });

      // Step 6: Mock the storage to return the name for subsequent reads
      vi.mocked(StorageService.getUserName).mockReturnValue('Alice');

      // Step 7: Verify the dashboard is now displayed (onboarding modal should be gone)
      await waitFor(() => {
        expect(screen.queryByText('Welcome to DevOps Dashboard')).not.toBeInTheDocument();
      });
    });

    it('should prevent submission with empty name', async () => {
      vi.mocked(StorageService.getUserName).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to DevOps Dashboard')).toBeInTheDocument();
      });

      // Try to submit without entering a name
      const submitButton = screen.getByRole('button', { name: /get started/i });
      await userEvent.click(submitButton);

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      });

      // Verify storage was NOT called
      expect(StorageService.setUserName).not.toHaveBeenCalled();

      // Verify modal is still visible
      expect(screen.getByText('Welcome to DevOps Dashboard')).toBeInTheDocument();
    });

    it('should prevent submission with whitespace-only name', async () => {
      vi.mocked(StorageService.getUserName).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to DevOps Dashboard')).toBeInTheDocument();
      });

      // Enter only whitespace
      const nameInput = screen.getByPlaceholderText('Enter your name');
      await userEvent.type(nameInput, '   ');

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /get started/i });
      await userEvent.click(submitButton);

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      });

      // Verify storage was NOT called
      expect(StorageService.setUserName).not.toHaveBeenCalled();
    });

    it('should skip onboarding when user name already exists', async () => {
      // Setup: User name already exists
      vi.mocked(StorageService.getUserName).mockReturnValue('Bob');

      render(<App />);

      // Verify onboarding modal is NOT displayed
      await waitFor(() => {
        expect(screen.queryByText('Welcome to DevOps Dashboard')).not.toBeInTheDocument();
      });

      // Verify dashboard content is displayed
      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument(); // Greeting
      });
    });
  });

  describe('Settings Modal Flow', () => {
    beforeEach(() => {
      // Setup: User is already onboarded
      vi.mocked(StorageService.getUserName).mockReturnValue('TestUser');
    });

    it('should complete the full settings modal flow: open, save, close', async () => {
      render(<App />);

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Step 1: Open settings modal
      const settingsButton = screen.getByLabelText('Open settings');
      await userEvent.click(settingsButton);

      // Step 2: Verify settings modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // Step 3: Enter Unsplash API key
      const unsplashInput = screen.getByLabelText('Unsplash API Key');
      await userEvent.type(unsplashInput, 'test-unsplash-key-123');
      expect(unsplashInput).toHaveValue('test-unsplash-key-123');

      // Step 4: Enter Weather API key
      const weatherInput = screen.getByLabelText('OpenWeatherMap API Key');
      await userEvent.type(weatherInput, 'test-weather-key-456');
      expect(weatherInput).toHaveValue('test-weather-key-456');

      // Step 5: Save settings
      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await userEvent.click(saveButton);

      // Step 6: Verify storage was called with correct values
      await waitFor(() => {
        expect(StorageService.setUnsplashKey).toHaveBeenCalledWith('test-unsplash-key-123');
        expect(StorageService.setWeatherKey).toHaveBeenCalledWith('test-weather-key-456');
      });

      // Step 7: Verify success message is shown
      await waitFor(() => {
        expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
      });

      // Step 8: Verify modal closes automatically after success
      await waitFor(
        () => {
          expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should load existing API keys when opening settings', async () => {
      // Setup: Existing API keys in storage
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue('existing-unsplash-key');
      vi.mocked(StorageService.getWeatherKey).mockReturnValue('existing-weather-key');

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Open settings modal
      const settingsButton = screen.getByLabelText('Open settings');
      await userEvent.click(settingsButton);

      // Verify existing keys are loaded into inputs
      await waitFor(() => {
        const unsplashInput = screen.getByLabelText('Unsplash API Key') as HTMLInputElement;
        const weatherInput = screen.getByLabelText('OpenWeatherMap API Key') as HTMLInputElement;
        
        expect(unsplashInput.value).toBe('existing-unsplash-key');
        expect(weatherInput.value).toBe('existing-weather-key');
      });
    });

    it('should close settings modal with cancel button', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Open settings modal
      const settingsButton = screen.getByLabelText('Open settings');
      await userEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
      });

      // Verify storage was NOT called
      expect(StorageService.setUnsplashKey).not.toHaveBeenCalled();
      expect(StorageService.setWeatherKey).not.toHaveBeenCalled();
    });

    it('should close settings modal with X button', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Open settings modal
      const settingsButton = screen.getByLabelText('Open settings');
      await userEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // Click X button
      const closeButton = screen.getByLabelText('Close settings');
      await userEvent.click(closeButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Theme Transitions with Mode Changes', () => {
    beforeEach(() => {
      vi.mocked(StorageService.getUserName).mockReturnValue('ThemeTestUser');
    });

    it('should transition from Peaceful to Glitch mode when health decreases', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Find the dev mode toggle slider
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider).toBeInTheDocument();

      // Initial state should be Peaceful mode (health = 100)
      expect(slider.value).toBe('100');

      // Verify initial peaceful mode styling
      const dashboardDiv = container.querySelector('.min-h-screen');
      expect(dashboardDiv).toHaveClass('text-white');

      // Change health to Glitch mode range (40-79)
      fireEvent.change(slider, { target: { value: '60' } });

      // Verify slider value updated
      await waitFor(() => {
        expect(slider.value).toBe('60');
      });

      // Verify glitch mode styling is applied
      await waitFor(() => {
        const updatedDashboardDiv = container.querySelector('.min-h-screen');
        expect(updatedDashboardDiv).toHaveClass('text-gray-300');
      });
    });

    it('should transition from Glitch to Nightmare mode when health decreases further', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;

      // Set to Glitch mode first
      fireEvent.change(slider, { target: { value: '60' } });

      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-gray-300');
      });

      // Change to Nightmare mode (0-39)
      fireEvent.change(slider, { target: { value: '20' } });

      // Verify nightmare mode styling is applied
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-red-500');
      });
    });

    it('should transition back from Nightmare to Peaceful mode', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;

      // Set to Nightmare mode
      fireEvent.change(slider, { target: { value: '20' } });

      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-red-500');
      });

      // Change back to Peaceful mode
      fireEvent.change(slider, { target: { value: '90' } });

      // Verify peaceful mode styling is restored
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-white');
      });
    });

    it('should preserve user data during theme transitions', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;

      // Verify initial user name is displayed
      expect(screen.getByText(/ThemeTestUser/)).toBeInTheDocument();

      // Transition through all modes
      fireEvent.change(slider, { target: { value: '60' } }); // Glitch
      await waitFor(() => {
        expect(slider.value).toBe('60');
      });

      fireEvent.change(slider, { target: { value: '20' } }); // Nightmare
      await waitFor(() => {
        expect(slider.value).toBe('20');
      });

      fireEvent.change(slider, { target: { value: '90' } }); // Back to Peaceful
      await waitFor(() => {
        expect(slider.value).toBe('90');
      });

      // Verify user name is still displayed after all transitions
      expect(screen.getByText(/ThemeTestUser/)).toBeInTheDocument();
    });

    it('should apply correct mode at exact threshold boundaries', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;

      // Test boundary at 80 (should be Peaceful)
      fireEvent.change(slider, { target: { value: '80' } });
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-white');
      });

      // Test boundary at 79 (should be Glitch)
      fireEvent.change(slider, { target: { value: '79' } });
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-gray-300');
      });

      // Test boundary at 40 (should be Glitch)
      fireEvent.change(slider, { target: { value: '40' } });
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-gray-300');
      });

      // Test boundary at 39 (should be Nightmare)
      fireEvent.change(slider, { target: { value: '39' } });
      await waitFor(() => {
        const dashboardDiv = container.querySelector('.min-h-screen');
        expect(dashboardDiv).toHaveClass('text-red-500');
      });
    });
  });

  describe('Background Loading with Mocked API Responses', () => {
    beforeEach(() => {
      vi.mocked(StorageService.getUserName).mockReturnValue('BackgroundTestUser');
    });

    it('should load Unsplash background when API key exists and request succeeds', async () => {
      // Setup: API key exists
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue('valid-unsplash-key');

      // Mock successful Unsplash API response
      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('unsplash')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              urls: {
                regular: 'https://images.unsplash.com/photo-123?w=1920',
              },
            }),
          } as Response);
        }
        // Default weather API response
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: { temp: 20 },
            weather: [{ icon: '01d', description: 'clear sky' }],
          }),
        } as Response);
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Verify Unsplash API was called
      await waitFor(() => {
        const fetchCalls = vi.mocked(fetch).mock.calls;
        const unsplashCall = fetchCalls.find(
          (call) => typeof call[0] === 'string' && call[0].includes('unsplash.com/photos/random')
        );
        expect(unsplashCall).toBeDefined();
      });
    });

    it('should fall back to local image when Unsplash API fails', async () => {
      // Setup: API key exists but API fails
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue('invalid-key');

      // Mock failed Unsplash API response
      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('unsplash')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({ errors: ['Unauthorized'] }),
          } as Response);
        }
        // Default weather API response
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: { temp: 20 },
            weather: [{ icon: '01d', description: 'clear sky' }],
          }),
        } as Response);
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Verify Unsplash API was attempted
      await waitFor(() => {
        const fetchCalls = vi.mocked(fetch).mock.calls;
        const unsplashCall = fetchCalls.find(
          (call) => typeof call[0] === 'string' && call[0].includes('unsplash.com/photos/random')
        );
        expect(unsplashCall).toBeDefined();
      });

      // The component should handle the error gracefully and fall back to local image
      // (We can't easily verify the background image in JSDOM, but we can verify no errors were thrown)
    });

    it('should use local image when no API key exists', async () => {
      // Setup: No API key
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Verify Unsplash API was NOT called
      await waitFor(
        () => {
          const unsplashCalls = vi.mocked(fetch).mock.calls.filter(
            (call) => typeof call[0] === 'string' && call[0].includes('unsplash')
          );
          expect(unsplashCalls.length).toBe(0);
        },
        { timeout: 1000 }
      );
    });

    it('should refresh background when new API key is saved', async () => {
      // Setup: No initial API key
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Good/)).toBeInTheDocument();
      });

      // Open settings and save a new API key
      const settingsButton = screen.getByLabelText('Open settings');
      await userEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // Mock successful Unsplash API response for after key is saved
      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('unsplash')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              urls: {
                regular: 'https://images.unsplash.com/photo-456?w=1920',
              },
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: { temp: 20 },
            weather: [{ icon: '01d', description: 'clear sky' }],
          }),
        } as Response);
      });

      // Update mock to return the new key
      vi.mocked(StorageService.getUnsplashKey).mockReturnValue('new-api-key');

      const unsplashInput = screen.getByLabelText('Unsplash API Key');
      await userEvent.type(unsplashInput, 'new-api-key');

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await userEvent.click(saveButton);

      // Wait for modal to close
      await waitFor(
        () => {
          expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Verify background refresh was triggered (Unsplash API should be called)
      await waitFor(() => {
        const unsplashCalls = vi.mocked(fetch).mock.calls.filter(
          (call) => typeof call[0] === 'string' && call[0].includes('unsplash')
        );
        expect(unsplashCalls.length).toBeGreaterThan(0);
      });
    });
  });
});
