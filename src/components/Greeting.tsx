import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

// Motivational greeting messages
const MOTIVATIONAL_GREETINGS = [
  "Ready to conquer the day, {name}?",
  "Shine brighter than ever today, {name}.",
  "Trust yourself and move forward, {name}.",
  "Your strength shines in tough moments, {name}.",
  "Light up the world with your smile today, {name}.",
  "Small wins lead to great joy, {name}.",
  "Each day is a precious gift for you, {name}.",
  "Today's effort shapes tomorrow's you, {name}.",
  "Time is always on your side, {name}. Today is proof.",
  "Be brave today, {name}. You've got this.",
  "Take a breath and move at your own pace, {name}.",
  "Today is a fresh start, {name}.",
  "Your worth never changes, {name}.",
  "New opportunities await you today, {name}.",
  "Every moment grows you, {name}.",
  "Honor your feelings, {name}.",
  "Your choices today build your tomorrow, {name}.",
  "Your best effort makes you the best, {name}.",
  "Small steps lead to great places, {name}.",
  "Remember, you're always enough, {name}.",
  "Write your story today, {name}.",
  "Don't forget your strengths in hard times, {name}.",
  "Take one more step toward your dream, {name}.",
  "Celebrate your small wins today, {name}.",
  "Every start feels scary, but you're amazing, {name}.",
  "Start your day with gratitude, {name}.",
  "Your journey is your precious story, {name}.",
  "Cheering for you today, {name}.",
  "Stay confident, {name}. You can do anything.",
  "Paint today with your colors, {name}."
];

/**
 * Get a random greeting message
 * @returns Random greeting template
 */
function getRandomGreeting(): string {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_GREETINGS.length);
  return MOTIVATIONAL_GREETINGS[randomIndex];
}

/**
 * Format the greeting message with user name
 * @param template - Greeting template
 * @param name - User's name
 * @returns Formatted greeting message
 */
export function formatGreeting(template: string, name: string): string {
  return template.replace('{name}', name);
}

export function Greeting() {
  const { theme } = useTheme();
  const userName = StorageService.getUserName() || 'User';
  
  // Select a random greeting on mount and store it
  const [greetingTemplate, setGreetingTemplate] = useState<string>(() => getRandomGreeting());
  
  // Change greeting once per day (at midnight)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setGreetingTemplate(getRandomGreeting());
      
      // Set up daily interval
      const dailyInterval = setInterval(() => {
        setGreetingTemplate(getRandomGreeting());
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format greeting with user name
  const greetingMessage = theme.mode === 'nightmare' 
    ? `SYSTEM FAILURE... RUN ${userName}...`
    : formatGreeting(greetingTemplate, userName);
  
  return (
    <div 
      className={`greeting ${theme.mode}`}
      style={{
        fontFamily: theme.fontFamily,
      }}
      role="heading"
      aria-level={1}
      aria-label={`Greeting: ${greetingMessage}`}
    >
      <h1 
        className={`text-3xl md:text-4xl lg:text-5xl font-medium text-white ${theme.textGlitch ? 'glitch' : ''}`}
        style={{
          textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.5)',
          letterSpacing: '0.02em'
        }}
        aria-live="polite"
      >
        {greetingMessage}
      </h1>
    </div>
  );
}
