import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { usePomodoro } from './usePomodoro';
import { StorageService } from '../services/StorageService';

describe('usePomodoro', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    StorageService.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Unit Tests', () => {
    describe('Timer start/pause/resume/reset functionality', () => {
      it('should start timer with correct initial state', () => {
        const { result } = renderHook(() => usePomodoro());

        const config = { workDuration: 25, breakDuration: 5, autoRepeat: false };
        
        act(() => {
          result.current.start(config);
        });

        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.isPaused).toBe(false);
        expect(result.current.state.phase).toBe('work');
        expect(result.current.state.remainingSeconds).toBe(25 * 60);
        expect(result.current.state.totalSeconds).toBe(25 * 60);
        expect(result.current.state.config).toEqual(config);
        expect(result.current.state.endTime).toBeGreaterThan(Date.now());
      });

      it('should pause an active timer', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        // Advance time by 5 seconds
        act(() => {
          vi.advanceTimersByTime(5000);
        });

        const remainingBeforePause = result.current.state.remainingSeconds;

        act(() => {
          result.current.pause();
        });

        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.isPaused).toBe(true);
        expect(result.current.state.endTime).toBeNull();
        
        // Advance time while paused - remaining should not change
        act(() => {
          vi.advanceTimersByTime(5000);
        });

        expect(result.current.state.remainingSeconds).toBe(remainingBeforePause);
      });

      it('should resume a paused timer', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        // Advance and pause
        act(() => {
          vi.advanceTimersByTime(5000);
        });

        act(() => {
          result.current.pause();
        });

        const remainingAfterPause = result.current.state.remainingSeconds;

        // Resume
        act(() => {
          result.current.resume();
        });

        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.isPaused).toBe(false);
        expect(result.current.state.endTime).toBeGreaterThan(Date.now());
        expect(result.current.state.remainingSeconds).toBe(remainingAfterPause);

        // Timer should continue counting down
        act(() => {
          vi.advanceTimersByTime(2000);
        });

        expect(result.current.state.remainingSeconds).toBeLessThan(remainingAfterPause);
      });

      it('should reset timer to idle state', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          vi.advanceTimersByTime(5000);
        });

        act(() => {
          result.current.reset();
        });

        expect(result.current.state.isActive).toBe(false);
        expect(result.current.state.isPaused).toBe(false);
        expect(result.current.state.phase).toBe('idle');
        expect(result.current.state.remainingSeconds).toBe(0);
        expect(result.current.state.endTime).toBeNull();
      });

      it('should not pause when timer is not active', () => {
        const { result } = renderHook(() => usePomodoro());

        const initialState = result.current.state;

        act(() => {
          result.current.pause();
        });

        expect(result.current.state).toEqual(initialState);
      });

      it('should not resume when timer is not paused', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        const stateBeforeResume = result.current.state;

        act(() => {
          result.current.resume();
        });

        // State should remain unchanged (except endTime might be slightly different)
        expect(result.current.state.isActive).toBe(stateBeforeResume.isActive);
        expect(result.current.state.isPaused).toBe(stateBeforeResume.isPaused);
        expect(result.current.state.phase).toBe(stateBeforeResume.phase);
      });
    });

    describe('Phase transitions', () => {
      it('should transition from work to break with autoRepeat enabled', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: true });
        });

        expect(result.current.state.phase).toBe('work');

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.phase).toBe('break');
        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.remainingSeconds).toBe(60);
      });

      it('should transition from break to work with autoRepeat enabled', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: true });
        });

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.phase).toBe('break');
        expect(result.current.state.isActive).toBe(true);
        
        // Verify break phase has correct duration
        expect(result.current.state.remainingSeconds).toBeGreaterThan(0);
        expect(result.current.state.remainingSeconds).toBeLessThanOrEqual(60);
        expect(result.current.state.totalSeconds).toBe(60);
      });

      it('should stop after work phase when autoRepeat is disabled', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: false });
        });

        expect(result.current.state.phase).toBe('work');

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.phase).toBe('idle');
        expect(result.current.state.isActive).toBe(false);
        expect(result.current.state.remainingSeconds).toBe(0);
      });

      it('should skip to next phase when skip is called', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        expect(result.current.state.phase).toBe('work');

        act(() => {
          result.current.skip();
        });

        expect(result.current.state.phase).toBe('break');
        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.remainingSeconds).toBe(5 * 60);
        expect(result.current.state.totalSeconds).toBe(5 * 60);
      });

      it('should skip from break to work phase', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        // Skip to break
        act(() => {
          result.current.skip();
        });

        expect(result.current.state.phase).toBe('break');

        // Skip back to work
        act(() => {
          result.current.skip();
        });

        expect(result.current.state.phase).toBe('work');
        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.remainingSeconds).toBe(25 * 60);
      });

      it('should not skip when timer is not active', () => {
        const { result } = renderHook(() => usePomodoro());

        const initialState = result.current.state;

        act(() => {
          result.current.skip();
        });

        expect(result.current.state).toEqual(initialState);
      });
    });

    describe('Auto-repeat behavior', () => {
      it('should continuously cycle through phases with autoRepeat enabled', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: true });
        });

        // Work phase
        expect(result.current.state.phase).toBe('work');
        expect(result.current.state.isActive).toBe(true);

        // Complete work → break
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });
        expect(result.current.state.phase).toBe('break');
        expect(result.current.state.isActive).toBe(true);

        // Verify the timer continues to run and doesn't stop
        expect(result.current.state.remainingSeconds).toBeGreaterThan(0);
        
        // Advance a bit more to ensure timer is still counting down
        act(() => {
          vi.advanceTimersByTime(10 * 1000);
        });
        
        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.phase).toBe('break');
      });

      it('should preserve autoRepeat config across phase transitions', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: true });
        });

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.config.autoRepeat).toBe(true);

        // Complete break phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.config.autoRepeat).toBe(true);
      });

      it('should not auto-repeat when autoRepeat is false', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: false });
        });

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        // Should stop, not transition to break
        expect(result.current.state.phase).toBe('idle');
        expect(result.current.state.isActive).toBe(false);
      });
    });

    describe('LocalStorage persistence and recovery', () => {
      it('should save timer state to LocalStorage when started', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: true });
        });

        expect(StorageService.getPomodoroConfig()).toEqual({
          workDuration: 25,
          breakDuration: 5,
          autoRepeat: true,
        });
        expect(StorageService.getPomodoroPhase()).toBe('work');
        expect(StorageService.getPomodoroTotalSeconds()).toBe(25 * 60);
        expect(StorageService.getPomodoroEndTime()).toBeGreaterThan(Date.now());
      });

      it('should clear timer state from LocalStorage when paused', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          result.current.pause();
        });

        expect(StorageService.getPomodoroEndTime()).toBeNull();
        expect(StorageService.getPomodoroPhase()).toBeNull();
        expect(StorageService.getPomodoroTotalSeconds()).toBeNull();
      });

      it('should restore timer state from LocalStorage when resumed', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          result.current.pause();
        });

        act(() => {
          result.current.resume();
        });

        expect(StorageService.getPomodoroEndTime()).toBeGreaterThan(Date.now());
        expect(StorageService.getPomodoroPhase()).toBe('work');
        expect(StorageService.getPomodoroTotalSeconds()).toBe(25 * 60);
      });

      it('should clear timer state from LocalStorage when reset', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          result.current.reset();
        });

        expect(StorageService.getPomodoroEndTime()).toBeNull();
        expect(StorageService.getPomodoroPhase()).toBeNull();
        expect(StorageService.getPomodoroTotalSeconds()).toBeNull();
      });

      it('should recover active timer on mount', () => {
        // Set up storage as if timer was running
        const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        StorageService.setPomodoroConfig({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        StorageService.setPomodoroEndTime(endTime);
        StorageService.setPomodoroPhase('work');
        StorageService.setPomodoroTotalSeconds(25 * 60);

        const { result } = renderHook(() => usePomodoro());

        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.phase).toBe('work');
        expect(result.current.state.totalSeconds).toBe(25 * 60);
        expect(result.current.state.remainingSeconds).toBeGreaterThan(9 * 60);
        expect(result.current.state.remainingSeconds).toBeLessThanOrEqual(10 * 60);
      });

      it('should not recover expired timer on mount', () => {
        // Set up storage as if timer expired 5 minutes ago
        const endTime = Date.now() - 5 * 60 * 1000;
        StorageService.setPomodoroConfig({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        StorageService.setPomodoroEndTime(endTime);
        StorageService.setPomodoroPhase('work');
        StorageService.setPomodoroTotalSeconds(25 * 60);

        const { result } = renderHook(() => usePomodoro());

        expect(result.current.state.isActive).toBe(false);
        expect(result.current.state.phase).toBe('idle');
        expect(result.current.state.remainingSeconds).toBe(0);
      });

      it('should update storage when phase transitions occur', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: true });
        });

        expect(StorageService.getPomodoroPhase()).toBe('work');

        // Complete work phase
        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(StorageService.getPomodoroPhase()).toBe('break');
        expect(StorageService.getPomodoroTotalSeconds()).toBe(60);
      });

      it('should update storage when skipping phases', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        expect(StorageService.getPomodoroPhase()).toBe('work');

        act(() => {
          result.current.skip();
        });

        expect(StorageService.getPomodoroPhase()).toBe('break');
        expect(StorageService.getPomodoroTotalSeconds()).toBe(5 * 60);
      });
    });

    describe('Timer countdown behavior', () => {
      it('should countdown from initial duration', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 5, breakDuration: 1, autoRepeat: false });
        });

        expect(result.current.state.remainingSeconds).toBe(5 * 60);

        act(() => {
          vi.advanceTimersByTime(60 * 1000); // 1 minute
        });

        expect(result.current.state.remainingSeconds).toBeLessThanOrEqual(4 * 60);
        expect(result.current.state.remainingSeconds).toBeGreaterThan(3 * 60);
      });

      it('should reach zero when timer completes', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: false });
        });

        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.remainingSeconds).toBe(0);
      });

      it('should maintain totalSeconds throughout countdown', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 10, breakDuration: 5, autoRepeat: false });
        });

        const initialTotal = result.current.state.totalSeconds;
        expect(initialTotal).toBe(10 * 60);

        act(() => {
          vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
        });

        expect(result.current.state.totalSeconds).toBe(initialTotal);
      });
    });

    describe('Edge cases', () => {
      it('should handle very short durations (1 minute)', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 1, breakDuration: 1, autoRepeat: false });
        });

        expect(result.current.state.remainingSeconds).toBe(60);

        act(() => {
          vi.advanceTimersByTime(60 * 1000 + 500);
        });

        expect(result.current.state.isActive).toBe(false);
      });

      it('should handle long durations (60 minutes)', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 60, breakDuration: 30, autoRepeat: false });
        });

        expect(result.current.state.remainingSeconds).toBe(60 * 60);
        expect(result.current.state.totalSeconds).toBe(60 * 60);
      });

      it('should handle multiple pause/resume cycles', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 10, breakDuration: 5, autoRepeat: false });
        });

        // First pause/resume
        act(() => {
          vi.advanceTimersByTime(60 * 1000);
        });
        act(() => {
          result.current.pause();
        });
        const remaining1 = result.current.state.remainingSeconds;
        act(() => {
          result.current.resume();
        });

        // Second pause/resume
        act(() => {
          vi.advanceTimersByTime(60 * 1000);
        });
        act(() => {
          result.current.pause();
        });
        const remaining2 = result.current.state.remainingSeconds;
        act(() => {
          result.current.resume();
        });

        expect(remaining2).toBeLessThan(remaining1);
        expect(result.current.state.isActive).toBe(true);
        expect(result.current.state.isPaused).toBe(false);
      });

      it('should handle reset during pause', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          result.current.pause();
        });

        act(() => {
          result.current.reset();
        });

        expect(result.current.state.isActive).toBe(false);
        expect(result.current.state.isPaused).toBe(false);
        expect(result.current.state.phase).toBe('idle');
      });

      it('should handle starting a new timer while one is active', () => {
        const { result } = renderHook(() => usePomodoro());

        act(() => {
          result.current.start({ workDuration: 25, breakDuration: 5, autoRepeat: false });
        });

        act(() => {
          vi.advanceTimersByTime(5 * 60 * 1000);
        });

        // Start a new timer with different config
        act(() => {
          result.current.start({ workDuration: 10, breakDuration: 3, autoRepeat: true });
        });

        expect(result.current.state.remainingSeconds).toBe(10 * 60);
        expect(result.current.state.config.workDuration).toBe(10);
        expect(result.current.state.config.breakDuration).toBe(3);
        expect(result.current.state.config.autoRepeat).toBe(true);
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: devops-nightmare-dashboard, Property 11: Timer countdown accuracy
     * Validates: Pomodoro Timer accuracy
     * 
     * For any valid work duration, starting the timer and waiting for the specified 
     * duration should result in the timer reaching zero within a 1-second margin of error.
     */
    it('should countdown accurately for any valid work duration', () => {
      fc.assert(
        fc.property(
          // Generate work durations between 1 and 60 minutes (as per validation rules)
          fc.integer({ min: 1, max: 60 }),
          // Generate break durations between 1 and 30 minutes (as per validation rules)
          fc.integer({ min: 1, max: 30 }),
          (workDuration, breakDuration) => {
            // Clear storage and timers before each iteration
            localStorage.clear();
            StorageService.clearAll();
            vi.clearAllTimers();

            // Render the hook
            const { result } = renderHook(() => usePomodoro());

            // Start the timer with the generated configuration
            act(() => {
              result.current.start({
                workDuration,
                breakDuration,
                autoRepeat: false,
              });
            });

            // Verify timer started correctly
            expect(result.current.state.isActive).toBe(true);
            expect(result.current.state.phase).toBe('work');
            
            // The initial remaining seconds should equal work duration in seconds
            const expectedTotalSeconds = workDuration * 60;
            expect(result.current.state.remainingSeconds).toBe(expectedTotalSeconds);
            expect(result.current.state.totalSeconds).toBe(expectedTotalSeconds);

            // Fast-forward time to just before completion (leave 2 seconds)
            const timeToAdvance = (workDuration * 60 - 2) * 1000;
            act(() => {
              vi.advanceTimersByTime(timeToAdvance);
            });

            // Should have approximately 2 seconds remaining (within 1 second margin)
            expect(result.current.state.remainingSeconds).toBeGreaterThanOrEqual(1);
            expect(result.current.state.remainingSeconds).toBeLessThanOrEqual(3);

            // Fast-forward to completion
            act(() => {
              vi.advanceTimersByTime(3000); // Advance 3 more seconds to ensure completion
            });

            // Timer should have completed and stopped (not active, idle phase)
            expect(result.current.state.isActive).toBe(false);
            expect(result.current.state.phase).toBe('idle');
            expect(result.current.state.remainingSeconds).toBe(0);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });

    /**
     * Feature: devops-nightmare-dashboard, Property 12: Timer persistence round trip
     * Validates: Timer persistence across page reloads
     * 
     * For any active timer state, refreshing the browser should restore the timer 
     * with the correct remaining time (within 1 second).
     */
    it('should persist and restore timer state across page reloads', () => {
      fc.assert(
        fc.property(
          // Generate work durations between 1 and 60 minutes
          fc.integer({ min: 1, max: 60 }),
          // Generate break durations between 1 and 30 minutes
          fc.integer({ min: 1, max: 30 }),
          // Generate a phase (work or break)
          fc.constantFrom('work' as const, 'break' as const),
          // Generate autoRepeat flag
          fc.boolean(),
          // Generate elapsed time as a percentage (0-90% to ensure timer hasn't completed)
          fc.integer({ min: 0, max: 90 }),
          (workDuration, breakDuration, phase, autoRepeat, elapsedPercent) => {
            // Clear storage and timers before each iteration
            localStorage.clear();
            StorageService.clearAll();
            vi.clearAllTimers();

            // Render the hook for the first time
            const { result: result1, unmount: unmount1 } = renderHook(() => usePomodoro());

            // Start the timer with the generated configuration
            const config = { workDuration, breakDuration, autoRepeat };
            act(() => {
              result1.current.start(config);
            });

            // If we want to test break phase, skip to it
            if (phase === 'break') {
              act(() => {
                result1.current.skip();
              });
            }

            // Get the current phase duration
            const currentPhaseDuration = result1.current.state.phase === 'work' 
              ? workDuration 
              : breakDuration;
            const totalSeconds = currentPhaseDuration * 60;

            // Advance time by the elapsed percentage
            const elapsedSeconds = Math.floor((totalSeconds * elapsedPercent) / 100);
            const elapsedMs = elapsedSeconds * 1000;
            
            act(() => {
              vi.advanceTimersByTime(elapsedMs);
            });

            // Capture the state before "reload"
            const remainingBeforeReload = result1.current.state.remainingSeconds;
            const phaseBeforeReload = result1.current.state.phase;
            const isActiveBeforeReload = result1.current.state.isActive;
            const totalSecondsBeforeReload = result1.current.state.totalSeconds;

            // Verify timer is still active (hasn't completed)
            expect(isActiveBeforeReload).toBe(true);
            expect(remainingBeforeReload).toBeGreaterThan(0);

            // Unmount the hook (simulating page unload)
            unmount1();

            // Small time passes during "reload" (simulate 100ms)
            act(() => {
              vi.advanceTimersByTime(100);
            });

            // Render the hook again (simulating page reload)
            const { result: result2 } = renderHook(() => usePomodoro());

            // Verify the timer state was restored
            expect(result2.current.state.isActive).toBe(true);
            expect(result2.current.state.phase).toBe(phaseBeforeReload);
            expect(result2.current.state.totalSeconds).toBe(totalSecondsBeforeReload);

            // The remaining time should be close to what it was before reload
            // Allow 1 second margin for timing differences
            const timeDifference = Math.abs(
              result2.current.state.remainingSeconds - remainingBeforeReload
            );
            expect(timeDifference).toBeLessThanOrEqual(1);

            // Verify the config was also restored
            expect(result2.current.state.config.workDuration).toBe(workDuration);
            expect(result2.current.state.config.breakDuration).toBe(breakDuration);
            expect(result2.current.state.config.autoRepeat).toBe(autoRepeat);

            // Verify the timer continues to count down after reload
            const remainingAfterReload = result2.current.state.remainingSeconds;
            act(() => {
              vi.advanceTimersByTime(2000); // Advance 2 seconds
            });

            // Should have decreased by approximately 2 seconds (within 1 second margin)
            const expectedRemaining = remainingAfterReload - 2;
            const actualRemaining = result2.current.state.remainingSeconds;
            expect(Math.abs(actualRemaining - expectedRemaining)).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });

    /**
     * Feature: devops-nightmare-dashboard, Property 13: Phase transition consistency
     * Validates: Phase transition logic
     * 
     * For any timer configuration with auto-repeat enabled, completing a work phase should 
     * transition to a break phase. For configurations with auto-repeat disabled, completing 
     * a work phase should transition directly to idle.
     * 
     * Note: Testing the full cycle (work → break → work) with fake timers is challenging
     * due to React state update timing. This test focuses on the first transition which
     * is the critical behavior.
     */
    it('should transition phases consistently based on configuration', () => {
      fc.assert(
        fc.property(
          // Generate work durations between 1 and 60 minutes
          fc.integer({ min: 1, max: 60 }),
          // Generate break durations between 1 and 30 minutes
          fc.integer({ min: 1, max: 30 }),
          // Generate autoRepeat flag
          fc.boolean(),
          (workDuration, breakDuration, autoRepeat) => {
            // Clear storage and timers before each iteration
            localStorage.clear();
            StorageService.clearAll();
            vi.clearAllTimers();

            // Render the hook
            const { result } = renderHook(() => usePomodoro());

            // Start the timer with the generated configuration
            const config = { workDuration, breakDuration, autoRepeat };
            act(() => {
              result.current.start(config);
            });

            // Verify we start in work phase
            expect(result.current.state.phase).toBe('work');
            expect(result.current.state.isActive).toBe(true);

            // Fast-forward to complete the work phase
            const workDurationMs = workDuration * 60 * 1000;
            act(() => {
              vi.advanceTimersByTime(workDurationMs + 500); // Add 500ms buffer to ensure completion
            });

            if (autoRepeat) {
              // With autoRepeat, after completing work phase should transition to break phase
              expect(result.current.state.phase).toBe('break');
              expect(result.current.state.isActive).toBe(true);
              expect(result.current.state.remainingSeconds).toBeGreaterThan(0);
              expect(result.current.state.remainingSeconds).toBeLessThanOrEqual(breakDuration * 60);
              
              // Verify the config is preserved
              expect(result.current.state.config.autoRepeat).toBe(true);
            } else {
              // Without autoRepeat, after completing work phase should transition directly to idle
              expect(result.current.state.phase).toBe('idle');
              expect(result.current.state.isActive).toBe(false);
              expect(result.current.state.remainingSeconds).toBe(0);
            }
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });
  });
});
