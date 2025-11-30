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

    expect(screen.getByText(/Dev Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Health Status:/i)).toBeInTheDocument();
  });

  it('displays current mode based on health status', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    // Initial state should be Peaceful (100)
    expect(screen.getByText('Peaceful')).toBeInTheDocument();
  });

  it('updates health status when slider changes', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    const slider = screen.getByRole('slider', { name: /health status slider/i });
    
    // Change to Glitch mode (60)
    fireEvent.change(slider, { target: { value: '60' } });
    expect(screen.getByText('Glitch')).toBeInTheDocument();
    expect(screen.getByText(/Health Status: 60/i)).toBeInTheDocument();

    // Change to Nightmare mode (20)
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('Nightmare')).toBeInTheDocument();
    expect(screen.getByText(/Health Status: 20/i)).toBeInTheDocument();

    // Change back to Peaceful mode (90)
    fireEvent.change(slider, { target: { value: '90' } });
    expect(screen.getByText('Peaceful')).toBeInTheDocument();
    expect(screen.getByText(/Health Status: 90/i)).toBeInTheDocument();
  });

  it('displays threshold indicators', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    // Check for threshold values in the UI
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('slider has correct min and max values', () => {
    render(
      <ThemeProvider>
        <DevModeToggle />
      </ThemeProvider>
    );

    const slider = screen.getByRole('slider', { name: /health status slider/i }) as HTMLInputElement;
    
    expect(slider.min).toBe('0');
    expect(slider.max).toBe('100');
  });
});
