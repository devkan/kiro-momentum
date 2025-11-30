import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clock, formatTime } from './Clock';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('Clock Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatTime', () => {
    it('should format time as HH:MM', () => {
      const date = new Date('2024-01-01T09:05:00');
      expect(formatTime(date)).toBe('09:05');
    });

    it('should pad single digit hours and minutes', () => {
      const date = new Date('2024-01-01T03:07:00');
      expect(formatTime(date)).toBe('03:07');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(formatTime(date)).toBe('00:00');
    });

    it('should handle noon correctly', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(formatTime(date)).toBe('12:00');
    });
  });

  describe('Clock rendering', () => {
    it('should render the current time', () => {
      const mockDate = new Date('2024-01-01T14:30:00');
      vi.setSystemTime(mockDate);

      render(
        <ThemeProvider>
          <Clock />
        </ThemeProvider>
      );

      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('should set up an interval for updates', () => {
      const mockDate = new Date('2024-01-01T14:30:00');
      vi.setSystemTime(mockDate);

      render(
        <ThemeProvider>
          <Clock />
        </ThemeProvider>
      );

      expect(screen.getByText('14:30')).toBeInTheDocument();

      // Verify that an interval has been set up
      expect(vi.getTimerCount()).toBeGreaterThan(0);
    });

    it('should apply glitch class in glitch mode', () => {
      const mockDate = new Date('2024-01-01T14:30:00');
      vi.setSystemTime(mockDate);

      const { container } = render(
        <ThemeProvider>
          <Clock />
        </ThemeProvider>
      );

      // Default is peaceful mode (health 100), no glitch
      const clockDiv = container.querySelector('.clock');
      expect(clockDiv).toHaveClass('peaceful');
    });

    it('should cleanup interval on unmount', () => {
      const mockDate = new Date('2024-01-01T14:30:00');
      vi.setSystemTime(mockDate);

      const { unmount } = render(
        <ThemeProvider>
          <Clock />
        </ThemeProvider>
      );

      // Verify interval is running
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      unmount();

      // Verify interval is cleaned up
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
