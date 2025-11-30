import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Greeting, getTimeOfDay, formatGreeting } from './Greeting';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

describe('Greeting Component', () => {
  beforeEach(() => {
    // Clear storage before each test
    StorageService.clearAll();
  });

  describe('getTimeOfDay', () => {
    it('should return "morning" for hours 5-11', () => {
      expect(getTimeOfDay(5)).toBe('morning');
      expect(getTimeOfDay(8)).toBe('morning');
      expect(getTimeOfDay(11)).toBe('morning');
    });

    it('should return "afternoon" for hours 12-17', () => {
      expect(getTimeOfDay(12)).toBe('afternoon');
      expect(getTimeOfDay(15)).toBe('afternoon');
      expect(getTimeOfDay(17)).toBe('afternoon');
    });

    it('should return "evening" for hours 18-4', () => {
      expect(getTimeOfDay(18)).toBe('evening');
      expect(getTimeOfDay(22)).toBe('evening');
      expect(getTimeOfDay(0)).toBe('evening');
      expect(getTimeOfDay(4)).toBe('evening');
    });
  });

  describe('formatGreeting', () => {
    it('should format peaceful mode greeting correctly', () => {
      const template = 'Good {timeOfDay}, {name}';
      const result = formatGreeting(template, 'Alice', 'morning');
      expect(result).toBe('Good morning, Alice');
    });

    it('should format nightmare mode greeting correctly', () => {
      const template = 'SYSTEM FAILURE... RUN {name}...';
      const result = formatGreeting(template, 'Bob', 'evening');
      expect(result).toBe('SYSTEM FAILURE... RUN Bob...');
    });
  });

  describe('Greeting rendering', () => {
    it('should render greeting with user name from storage', () => {
      StorageService.setUserName('TestUser');
      
      render(
        <ThemeProvider>
          <Greeting />
        </ThemeProvider>
      );

      // Should contain the user's name
      expect(screen.getByText(/TestUser/i)).toBeDefined();
    });

    it('should render with default "User" when no name in storage', () => {
      render(
        <ThemeProvider>
          <Greeting />
        </ThemeProvider>
      );

      // Should contain "User" as fallback
      expect(screen.getByText(/User/i)).toBeDefined();
    });

    it('should render peaceful mode greeting format', () => {
      StorageService.setUserName('Alice');
      
      render(
        <ThemeProvider>
          <Greeting />
        </ThemeProvider>
      );

      // Should contain "Good" (morning/afternoon/evening)
      const greeting = screen.getByRole('heading');
      expect(greeting.textContent).toMatch(/Good (morning|afternoon|evening), Alice/);
    });
  });
});
