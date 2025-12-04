import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePomodoro } from '../hooks/usePomodoro';
import { CircularProgressRing } from './CircularProgressRing';

/**
 * Format time as HH:MM
 * @param date - Date object to format
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format seconds as MM:SS
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface ClockProps {
  pomodoroState?: ReturnType<typeof usePomodoro>['state'];
}

export function Clock({ pomodoroState }: ClockProps) {
  const { theme } = useTheme();
  const [time, setTime] = useState<string>(formatTime(new Date()));

  useEffect(() => {
    // Update time immediately
    setTime(formatTime(new Date()));

    // Set up interval to update every second
    const intervalId = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Determine what to display
  const isTimerActive = pomodoroState?.isActive;
  const displayTime = isTimerActive 
    ? formatCountdown(pomodoroState.remainingSeconds)
    : time;

  // Calculate progress for ring
  const progress = isTimerActive && pomodoroState.totalSeconds > 0
    ? pomodoroState.remainingSeconds / pomodoroState.totalSeconds
    : 1;

  // Determine label based on mode and phase
  const getLabel = () => {
    if (!isTimerActive) return null;

    const isWork = pomodoroState.phase === 'work';
    
    switch (theme.mode) {
      case 'nightmare':
        return isWork ? 'EMERGENCY PATCHING...' : 'SYSTEM COOLDOWN...';
      case 'glitch':
        return isWork ? 'FOCUS SESSION' : 'BREAK TIME';
      case 'peaceful':
      default:
        return isWork ? 'Focus Time' : 'Break Time';
    }
  };

  const label = getLabel();

  return (
    <div 
      className={`clock ${theme.mode} flex flex-col items-center`}
      style={{
        fontFamily: theme.fontFamily,
      }}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={isTimerActive ? `Timer: ${displayTime} remaining, ${label}` : `Current time: ${displayTime}`}
    >
      <div className="relative flex items-center justify-center" style={{ overflow: 'visible' }}>
        {/* Circular Progress Ring */}
        {isTimerActive && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ overflow: 'visible' }} aria-hidden="true">
            <CircularProgressRing
              progress={progress}
              size={420}
              strokeWidth={16}
              mode={theme.mode}
            />
          </div>
        )}

        {/* Time Display */}
        <div 
          className={`text-8xl md:text-9xl lg:text-[10rem] font-bold text-white ${theme.textGlitch ? 'glitch' : ''} z-10`}
          style={{
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.6)',
            letterSpacing: '0.05em'
          }}
          aria-hidden="true"
        >
          {displayTime}
        </div>
      </div>

      {/* Timer Label */}
      {label && (
        <div 
          className={`mt-4 text-2xl font-bold tracking-wider ${
            theme.mode === 'nightmare' ? 'text-red-500 animate-pulse' : 
            theme.mode === 'glitch' ? 'text-yellow-400 glitch-text' : 
            'text-green-400'
          }`}
          style={{
            textShadow: theme.mode === 'nightmare' 
              ? '0 0 10px rgba(239, 68, 68, 0.8)' 
              : '0 0 8px rgba(0, 0, 0, 0.5)',
          }}
          aria-hidden="true"
        >
          {label}
        </div>
      )}
    </div>
  );
}
