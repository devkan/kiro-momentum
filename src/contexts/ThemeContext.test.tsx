import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ReactNode } from 'react';
import * as fc from 'fast-check';

describe('ThemeContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('should initialize with peaceful mode at health status 100', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.healthStatus).toBe(100);
    expect(result.current.theme.mode).toBe('peaceful');
  });

  it('should resolve to peaceful mode for health status >= 80', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(80);
    });
    
    expect(result.current.theme.mode).toBe('peaceful');
    
    act(() => {
      result.current.setHealthStatus(95);
    });
    
    expect(result.current.theme.mode).toBe('peaceful');
  });

  it('should resolve to glitch mode for health status 40-79', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(79);
    });
    
    expect(result.current.theme.mode).toBe('glitch');
    
    act(() => {
      result.current.setHealthStatus(40);
    });
    
    expect(result.current.theme.mode).toBe('glitch');
    
    act(() => {
      result.current.setHealthStatus(60);
    });
    
    expect(result.current.theme.mode).toBe('glitch');
  });

  it('should resolve to nightmare mode for health status 0-39', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(39);
    });
    
    expect(result.current.theme.mode).toBe('nightmare');
    
    act(() => {
      result.current.setHealthStatus(0);
    });
    
    expect(result.current.theme.mode).toBe('nightmare');
    
    act(() => {
      result.current.setHealthStatus(20);
    });
    
    expect(result.current.theme.mode).toBe('nightmare');
  });

  it('should update theme when health status changes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Start at peaceful
    expect(result.current.theme.mode).toBe('peaceful');
    
    // Move to glitch
    act(() => {
      result.current.setHealthStatus(50);
    });
    expect(result.current.theme.mode).toBe('glitch');
    
    // Move to nightmare
    act(() => {
      result.current.setHealthStatus(10);
    });
    expect(result.current.theme.mode).toBe('nightmare');
    
    // Back to peaceful
    act(() => {
      result.current.setHealthStatus(90);
    });
    expect(result.current.theme.mode).toBe('peaceful');
  });

  it('should have correct theme properties for peaceful mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(100);
    });
    
    expect(result.current.theme.textGlitch).toBe(false);
    expect(result.current.theme.showHorrorOverlay).toBe(false);
    expect(result.current.theme.soundEnabled).toBe(false);
    expect(result.current.theme.greetingTemplate).toContain('Good {timeOfDay}');
  });

  it('should have correct theme properties for glitch mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(50);
    });
    
    expect(result.current.theme.textGlitch).toBe(true);
    expect(result.current.theme.showHorrorOverlay).toBe(true);
    expect(result.current.theme.soundEnabled).toBe(false);
    expect(result.current.theme.greetingTemplate).toContain('Good {timeOfDay}');
  });

  it('should have correct theme properties for nightmare mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.setHealthStatus(20);
    });
    
    expect(result.current.theme.textGlitch).toBe(true);
    expect(result.current.theme.showHorrorOverlay).toBe(true);
    expect(result.current.theme.soundEnabled).toBe(true);
    expect(result.current.theme.greetingTemplate).toBe('SYSTEM FAILURE... RUN {name}...');
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });

  /**
   * Property-Based Test
   * Feature: devops-nightmare-dashboard, Property 3: Mode threshold consistency
   * Validates: Requirements 7.4, 7.5, 7.6
   * 
   * For any health status value, the resolved theme mode should be consistent:
   * - values 80-100 always resolve to Peaceful
   * - values 40-79 always resolve to Glitch
   * - values 0-39 always resolve to Nightmare
   */
  it('property: mode threshold consistency for all health status values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (healthStatus) => {
          const { result } = renderHook(() => useTheme(), { wrapper });
          
          act(() => {
            result.current.setHealthStatus(healthStatus);
          });
          
          const mode = result.current.theme.mode;
          
          // Verify mode consistency based on thresholds
          if (healthStatus >= 80) {
            expect(mode).toBe('peaceful');
          } else if (healthStatus >= 40) {
            expect(mode).toBe('glitch');
          } else {
            expect(mode).toBe('nightmare');
          }
          
          // Verify the health status is preserved in the theme
          expect(result.current.theme.healthStatus).toBe(healthStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property-Based Test
   * Feature: devops-nightmare-dashboard, Property 10: Mode boundary transitions
   * Validates: Requirements 7.3
   * 
   * For any health status value at a mode boundary (80, 40, 39, 0),
   * incrementing or decrementing by 1 should trigger the appropriate mode change exactly once.
   */
  it('property: mode boundary transitions trigger correct mode changes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(0, 39, 40, 79, 80, 100),
        (boundaryValue) => {
          const { result } = renderHook(() => useTheme(), { wrapper });
          
          // Set to boundary value
          act(() => {
            result.current.setHealthStatus(boundaryValue);
          });
          
          const initialMode = result.current.theme.mode;
          
          // Test incrementing by 1 (if not at max)
          if (boundaryValue < 100) {
            act(() => {
              result.current.setHealthStatus(boundaryValue + 1);
            });
            
            const modeAfterIncrement = result.current.theme.mode;
            
            // Verify mode change behavior at boundaries
            if (boundaryValue === 79) {
              // 79 -> 80: should transition from glitch to peaceful
              expect(initialMode).toBe('glitch');
              expect(modeAfterIncrement).toBe('peaceful');
            } else if (boundaryValue === 39) {
              // 39 -> 40: should transition from nightmare to glitch
              expect(initialMode).toBe('nightmare');
              expect(modeAfterIncrement).toBe('glitch');
            } else {
              // Other boundaries: mode should stay the same
              expect(modeAfterIncrement).toBe(initialMode);
            }
            
            // Reset to boundary value for decrement test
            act(() => {
              result.current.setHealthStatus(boundaryValue);
            });
          }
          
          // Test decrementing by 1 (if not at min)
          if (boundaryValue > 0) {
            act(() => {
              result.current.setHealthStatus(boundaryValue - 1);
            });
            
            const modeAfterDecrement = result.current.theme.mode;
            
            // Verify mode change behavior at boundaries
            if (boundaryValue === 80) {
              // 80 -> 79: should transition from peaceful to glitch
              expect(initialMode).toBe('peaceful');
              expect(modeAfterDecrement).toBe('glitch');
            } else if (boundaryValue === 40) {
              // 40 -> 39: should transition from glitch to nightmare
              expect(initialMode).toBe('glitch');
              expect(modeAfterDecrement).toBe('nightmare');
            } else {
              // Other boundaries: mode should stay the same
              expect(modeAfterDecrement).toBe(initialMode);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
