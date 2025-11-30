
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

/**
 * Get the time of day based on current hour
 * @param hour - Current hour (0-23)
 * @returns Time of day string: 'morning', 'afternoon', or 'evening'
 */
export function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

/**
 * Format the greeting message based on theme and time
 * @param template - Greeting template from theme
 * @param name - User's name
 * @param timeOfDay - Time of day string
 * @returns Formatted greeting message
 */
export function formatGreeting(template: string, name: string, timeOfDay: string): string {
  return template
    .replace('{name}', name)
    .replace('{timeOfDay}', timeOfDay);
}

export function Greeting() {
  const { theme } = useTheme();
  const userName = StorageService.getUserName() || 'User';
  
  // Get current time of day
  const currentHour = new Date().getHours();
  const timeOfDay = getTimeOfDay(currentHour);
  
  // Format greeting based on theme template
  const greetingMessage = formatGreeting(theme.greetingTemplate, userName, timeOfDay);
  
  return (
    <div 
      className={`greeting ${theme.mode}`}
      style={{
        fontFamily: theme.fontFamily,
      }}
    >
      <h1 
        className={`text-3xl md:text-4xl lg:text-5xl font-medium text-white ${theme.textGlitch ? 'glitch' : ''}`}
        style={{
          textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.5)',
          letterSpacing: '0.02em'
        }}
      >
        {greetingMessage}
      </h1>
    </div>
  );
}
