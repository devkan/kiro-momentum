import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevModeToggle } from './DevModeToggle';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('DevModeToggle', () => {
  it('renders with initial health status', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    expect(screen.getByText(/SYSTEM STABILITY/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('displays current mode based on health status', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    // Initial state should be STABLE (100)
    const stableElements = screen.getAllByText('STABLE');
    expect(stableElements.length).toBeGreaterThan(0);
  });

  it('updates health status when slider changes', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    const slider = screen.getByRole('slider', { name: /system stability slider/i });
    
    // Change to DEGRADED mode (60)
    fireEvent.change(slider, { target: { value: '60' } });
    const degradedElements = screen.getAllByText('DEGRADED');
    expect(degradedElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/60%/i)).toBeInTheDocument();

    // Change to CRITICAL mode (20)
    fireEvent.change(slider, { target: { value: '20' } });
    const criticalElements = screen.getAllByText('CRITICAL');
    expect(criticalElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/20%/i)).toBeInTheDocument();

    // Change back to STABLE mode (90)
    fireEvent.change(slider, { target: { value: '90' } });
    const stableElements = screen.getAllByText('STABLE');
    expect(stableElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/90%/i)).toBeInTheDocument();
  });

  it('displays threshold indicators', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    // Check for status labels in the UI (they appear twice - once as status, once as label)
    const criticalElements = screen.getAllByText('CRITICAL');
    expect(criticalElements.length).toBeGreaterThanOrEqual(1);
    
    const degradedElements = screen.getAllByText('DEGRADED');
    expect(degradedElements.length).toBeGreaterThanOrEqual(1);
    
    const stableElements = screen.getAllByText('STABLE');
    expect(stableElements.length).toBeGreaterThanOrEqual(1);
  });

  it('slider has correct min and max values', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    const slider = screen.getByRole('slider', { name: /system stability slider/i }) as HTMLInputElement;
    
    expect(slider.min).toBe('0');
    expect(slider.max).toBe('100');
  });
});
