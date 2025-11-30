import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Weather } from './Weather';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

// Mock StorageService
vi.mock('../services/StorageService', () => ({
  StorageService: {
    getWeatherKey: vi.fn(() => 'test-api-key'),
  },
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

describe('Weather Component', () => {
  beforeEach(() => {
    // Setup geolocation mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display loading state initially', () => {
    // Don't call the geolocation callback immediately
    mockGeolocation.getCurrentPosition.mockImplementation(() => {});
    
    render(
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display weather data when geolocation succeeds', async () => {
    const mockWeatherData = {
      main: { temp: 22.5 },
      weather: [{ icon: '01d', description: 'clear sky' }],
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 40.7128, longitude: -74.0060 },
      });
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('23°')).toBeInTheDocument();
      expect(screen.getByText('clear sky')).toBeInTheDocument();
    });
  });

  it('should handle geolocation denial gracefully', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'User denied geolocation' });
    });

    render(
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Weather N/A')).toBeInTheDocument();
    });
  });

  it('should handle API failures gracefully', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 40.7128, longitude: -74.0060 },
      });
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Weather N/A')).toBeInTheDocument();
    });
  });

  it('should handle missing geolocation support', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    );

    expect(screen.getByText('Weather N/A')).toBeInTheDocument();
  });
});
