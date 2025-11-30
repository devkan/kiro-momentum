import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BackgroundManager } from './BackgroundManager';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';
import * as fc from 'fast-check';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getUnsplashKey: vi.fn(() => null),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BackgroundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderBackgroundManager = () => {
    return render(
      <ThemeProvider>
        <BackgroundManager />
      </ThemeProvider>
    );
  };

  /**
   * Property-Based Test
   * Feature: devops-nightmare-dashboard, Property 6: Background fallback reliability
   * Validates: Requirements 5.2, 5.3
   */
  it('property: always displays a local fallback image when Unsplash API fails or no API key exists', async () => {
    fc.assert(
      await fc.asyncProperty(
        // Generate different failure scenarios
        fc.record({
          // Whether an API key exists
          hasApiKey: fc.boolean(),
          // If API key exists, what kind of failure occurs
          apiFailureType: fc.constantFrom(
            'network-error',
            'http-404',
            'http-500',
            'http-403',
            'invalid-json',
            'timeout'
          ),
          // Random API key value (when hasApiKey is true)
          apiKey: fc.string({ minLength: 10, maxLength: 50 }),
        }),
        async (scenario) => {
          // Setup: Configure the API key state
          if (scenario.hasApiKey) {
            vi.mocked(StorageService.getUnsplashKey).mockReturnValue(scenario.apiKey);
            
            // Setup: Configure the API failure
            switch (scenario.apiFailureType) {
              case 'network-error':
                mockFetch.mockRejectedValue(new Error('Network error'));
                break;
              case 'http-404':
                mockFetch.mockResolvedValue({
                  ok: false,
                  status: 404,
                  json: async () => ({ error: 'Not found' }),
                } as Response);
                break;
              case 'http-500':
                mockFetch.mockResolvedValue({
                  ok: false,
                  status: 500,
                  json: async () => ({ error: 'Server error' }),
                } as Response);
                break;
              case 'http-403':
                mockFetch.mockResolvedValue({
                  ok: false,
                  status: 403,
                  json: async () => ({ error: 'Forbidden' }),
                } as Response);
                break;
              case 'invalid-json':
                mockFetch.mockResolvedValue({
                  ok: true,
                  status: 200,
                  json: async () => {
                    throw new Error('Invalid JSON');
                  },
                } as Response);
                break;
              case 'timeout':
                mockFetch.mockImplementation(() => 
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 100)
                  )
                );
                break;
            }
          } else {
            // No API key scenario
            vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);
          }

          // Render the component
          const { container, unmount } = renderBackgroundManager();

          try {
            // Wait for the background to be set
            await waitFor(
              () => {
                const backgroundDiv = container.querySelector('[role="img"]');
                expect(backgroundDiv).toBeInTheDocument();
                
                // Get the background image style
                const style = window.getComputedStyle(backgroundDiv!);
                const backgroundImage = backgroundDiv!.getAttribute('style');
                
                // Verify that a background image is set (not empty or 'none')
                expect(backgroundImage).toBeTruthy();
                expect(backgroundImage).toContain('url(');
                
                // Verify that the component is not in a loading state
                const loadingText = container.querySelector('div:has(> .text-white)');
                expect(loadingText).not.toBeInTheDocument();
              },
              { timeout: 3000 }
            );

            // Additional verification: ensure no errors were thrown
            // The component should gracefully handle all failure scenarios
            const backgroundDiv = container.querySelector('[role="img"]');
            expect(backgroundDiv).toBeInTheDocument();
            
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('displays local fallback when no API key exists', async () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue(null);

    const { container } = renderBackgroundManager();

    await waitFor(() => {
      const backgroundDiv = container.querySelector('[role="img"]');
      const backgroundImage = backgroundDiv!.getAttribute('style');
      
      expect(backgroundImage).toContain('url(');
      expect(backgroundDiv).toBeInTheDocument();
    });
  });

  it('falls back to local image when Unsplash API fails', async () => {
    vi.mocked(StorageService.getUnsplashKey).mockReturnValue('test-api-key');
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { container } = renderBackgroundManager();

    await waitFor(() => {
      const backgroundDiv = container.querySelector('[role="img"]');
      const backgroundImage = backgroundDiv!.getAttribute('style');
      
      expect(backgroundImage).toContain('url(');
      expect(backgroundDiv).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
