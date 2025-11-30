import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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

export function Clock() {
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

  return (
    <div 
      className={`clock ${theme.mode}`}
      style={{
        fontFamily: theme.fontFamily,
      }}
    >
      <div 
        className={`text-8xl md:text-9xl lg:text-[10rem] font-bold text-white ${theme.textGlitch ? 'glitch' : ''}`}
        style={{
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.6)',
          letterSpacing: '0.05em'
        }}
      >
        {time}
      </div>
    </div>
  );
}
