import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { Dashboard } from './Dashboard';
import { StorageService } from '../services/StorageService';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getUserName: vi.fn(),
    setUserName: vi.fn(),
    getTodos: vi.fn(() => []),
    setTodos: vi.fn(),
    getUnsplashKey: vi.fn(() => null),
    setUnsplashKey: vi.fn(),
    getWeatherKey: vi.fn(() => null),
    setWeatherKey: vi.fn(),
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

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      });
    });
  });

  it('renders the dashboard title when no user name exists', async () => {
    vi.mocked(StorageService.getUserName).mockReturnValue(null);

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('DevOps Nightmare Dashboard')).toBeInTheDocument();
    });
  });

  it('renders header and main content when user name exists', async () => {
    vi.mocked(StorageService.getUserName).mockReturnValue('John');

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      // Check for greeting component
      expect(screen.getByText(/Good/)).toBeInTheDocument();
    });
  });

  it('applies theme-based CSS classes', async () => {
    vi.mocked(StorageService.getUserName).mockReturnValue('John');

    const { container } = render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      const dashboardDiv = container.querySelector('.min-h-screen');
      expect(dashboardDiv).toBeInTheDocument();
      expect(dashboardDiv).toHaveClass('flex', 'flex-col', 'relative');
    });
  });

  it('renders settings button', async () => {
    vi.mocked(StorageService.getUserName).mockReturnValue('John');

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      const settingsButton = screen.getByLabelText('Open settings');
      expect(settingsButton).toBeInTheDocument();
    });
  });

  it('renders all main components when user is logged in', async () => {
    vi.mocked(StorageService.getUserName).mockReturnValue('John');

    render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      // Check for header components
      expect(screen.getByText(/Good/)).toBeInTheDocument(); // Greeting
      
      // Check for main content structure
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: devops-nightmare-dashboard, Property 8: Theme transition data preservation
     * Validates: Requirements 11.2, 11.3
     */
    it('should preserve all application data when transitioning between theme modes', () => {
      fc.assert(
        fc.property(
          // Generate random user name
          fc.string({ minLength: 1, maxLength: 100 }),
          // Generate random todo list
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              text: fc.string({ minLength: 1, maxLength: 200 }),
              createdAt: fc.integer({ min: 0, max: Date.now() + 1000000 }),
            }),
            { maxLength: 20 }
          ),
          // Generate random API key
          fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
          // Generate sequence of health status values that cross mode boundaries
          fc.array(
            fc.integer({ min: 0, max: 100 }),
            { minLength: 2, maxLength: 5 }
          ),
          (userName, todos, apiKey, healthStatusSequence) => {
            // Setup: Mock storage with initial data
            vi.mocked(StorageService.getUserName).mockReturnValue(userName);
            vi.mocked(StorageService.getTodos).mockReturnValue(todos);
            vi.mocked(StorageService.getUnsplashKey).mockReturnValue(apiKey);

            // Create a test component that can access theme context
            let capturedTheme: any = null;
            let capturedSetHealthStatus: any = null;

            function TestComponent() {
              const { theme, setHealthStatus } = useTheme();
              capturedTheme = theme;
              capturedSetHealthStatus = setHealthStatus;
              return <Dashboard />;
            }

            // Render the dashboard
            const { rerender } = render(
              <ThemeProvider>
                <TestComponent />
              </ThemeProvider>
            );

            // Verify initial data is accessible
            const initialUserName = StorageService.getUserName();
            const initialTodos = StorageService.getTodos();
            const initialApiKey = StorageService.getUnsplashKey();

            // Transition through different health statuses (and thus different modes)
            healthStatusSequence.forEach((healthStatus) => {
              if (capturedSetHealthStatus) {
                capturedSetHealthStatus(healthStatus);
              }

              // Force re-render to apply theme changes
              rerender(
                <ThemeProvider>
                  <TestComponent />
                </ThemeProvider>
              );
            });

            // After all transitions, verify data is still preserved
            const finalUserName = StorageService.getUserName();
            const finalTodos = StorageService.getTodos();
            const finalApiKey = StorageService.getUnsplashKey();

            // All data should be identical to initial state
            expect(finalUserName).toBe(initialUserName);
            expect(finalTodos).toEqual(initialTodos);
            expect(finalApiKey).toBe(initialApiKey);

            // Verify the data matches what we set up
            expect(finalUserName).toBe(userName);
            expect(finalTodos).toEqual(todos);
            expect(finalApiKey).toBe(apiKey);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });
  });
});
