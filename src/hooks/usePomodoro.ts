import { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroState, PomodoroConfig, PomodoroPhase } from '../types';
import { StorageService } from '../services/StorageService';

const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  breakDuration: 5,
  autoRepeat: false,
};

export interface UsePomodoroReturn {
  state: PomodoroState;
  start: (config: PomodoroConfig) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

export function usePomodoro(): UsePomodoroReturn {
  const [state, setState] = useState<PomodoroState>(() => {
    // Try to recover timer state from localStorage
    const savedConfig = StorageService.getPomodoroConfig();
    const savedEndTime = StorageService.getPomodoroEndTime();
    const savedPhase = StorageService.getPomodoroPhase();
    const savedTotalSeconds = StorageService.getPomodoroTotalSeconds();

    const config = savedConfig || DEFAULT_CONFIG;

    // Check if timer was active and hasn't expired
    if (savedEndTime && savedPhase && savedTotalSeconds) {
      const now = Date.now();
      if (now < savedEndTime) {
        // Timer is still active
        const remainingMs = savedEndTime - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        
        return {
          isActive: true,
          isPaused: false,
          phase: savedPhase,
          remainingSeconds,
          totalSeconds: savedTotalSeconds,
          endTime: savedEndTime,
          config,
        };
      } else {
        // Timer expired while page was closed
        StorageService.clearPomodoroTimer();
      }
    }

    // Default idle state
    return {
      isActive: false,
      isPaused: false,
      phase: 'idle',
      remainingSeconds: 0,
      totalSeconds: 0,
      endTime: null,
      config,
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteCallbackRef = useRef<(() => void) | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (!state.isActive || state.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start interval
    intervalRef.current = setInterval(() => {
      setState((prevState) => {
        if (!prevState.endTime) return prevState;

        const now = Date.now();
        const remainingMs = prevState.endTime - now;

        if (remainingMs <= 0) {
          // Timer completed
          
          // Trigger completion callback
          if (onCompleteCallbackRef.current) {
            onCompleteCallbackRef.current();
          }

          // Handle phase transition
          if (prevState.config.autoRepeat) {
            const nextPhase: PomodoroPhase = prevState.phase === 'work' ? 'break' : 'work';
            const nextDuration = nextPhase === 'work' 
              ? prevState.config.workDuration 
              : prevState.config.breakDuration;
            const nextTotalSeconds = nextDuration * 60;
            const nextEndTime = Date.now() + nextTotalSeconds * 1000;

            // Save to storage
            StorageService.setPomodoroEndTime(nextEndTime);
            StorageService.setPomodoroPhase(nextPhase);
            StorageService.setPomodoroTotalSeconds(nextTotalSeconds);

            // Continue with next phase - don't clear interval
            return {
              ...prevState,
              phase: nextPhase,
              remainingSeconds: nextTotalSeconds,
              totalSeconds: nextTotalSeconds,
              endTime: nextEndTime,
              isActive: true,
              isPaused: false,
            };
          } else {
            // Stop timer - clear interval and storage
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            StorageService.clearPomodoroTimer();
            
            return {
              ...prevState,
              isActive: false,
              phase: 'idle',
              remainingSeconds: 0,
              endTime: null,
            };
          }
        }

        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return {
          ...prevState,
          remainingSeconds,
        };
      });
    }, 100); // Update every 100ms for smooth countdown

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isActive, state.isPaused]);

  const start = useCallback((config: PomodoroConfig) => {
    const totalSeconds = config.workDuration * 60;
    const endTime = Date.now() + totalSeconds * 1000;

    // Save to storage
    StorageService.setPomodoroConfig(config);
    StorageService.setPomodoroEndTime(endTime);
    StorageService.setPomodoroPhase('work');
    StorageService.setPomodoroTotalSeconds(totalSeconds);

    setState({
      isActive: true,
      isPaused: false,
      phase: 'work',
      remainingSeconds: totalSeconds,
      totalSeconds,
      endTime,
      config,
    });
  }, []);

  const pause = useCallback(() => {
    setState((prevState) => {
      if (!prevState.isActive || prevState.isPaused) return prevState;

      // Clear storage when paused
      StorageService.clearPomodoroTimer();

      return {
        ...prevState,
        isPaused: true,
        endTime: null,
      };
    });
  }, []);

  const resume = useCallback(() => {
    setState((prevState) => {
      if (!prevState.isActive || !prevState.isPaused) return prevState;

      const endTime = Date.now() + prevState.remainingSeconds * 1000;

      // Save to storage
      StorageService.setPomodoroEndTime(endTime);
      StorageService.setPomodoroPhase(prevState.phase);
      StorageService.setPomodoroTotalSeconds(prevState.totalSeconds);

      return {
        ...prevState,
        isPaused: false,
        endTime,
      };
    });
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear storage
    StorageService.clearPomodoroTimer();

    setState((prevState) => ({
      ...prevState,
      isActive: false,
      isPaused: false,
      phase: 'idle',
      remainingSeconds: 0,
      endTime: null,
    }));
  }, []);

  const skip = useCallback(() => {
    setState((prevState) => {
      if (!prevState.isActive) return prevState;

      const nextPhase: PomodoroPhase = prevState.phase === 'work' ? 'break' : 'work';
      const nextDuration = nextPhase === 'work' 
        ? prevState.config.workDuration 
        : prevState.config.breakDuration;
      const nextTotalSeconds = nextDuration * 60;
      const nextEndTime = Date.now() + nextTotalSeconds * 1000;

      // Save to storage
      StorageService.setPomodoroEndTime(nextEndTime);
      StorageService.setPomodoroPhase(nextPhase);
      StorageService.setPomodoroTotalSeconds(nextTotalSeconds);

      return {
        ...prevState,
        phase: nextPhase,
        remainingSeconds: nextTotalSeconds,
        totalSeconds: nextTotalSeconds,
        endTime: nextEndTime,
        isPaused: false,
      };
    });
  }, []);

  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
