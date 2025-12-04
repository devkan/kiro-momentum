import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ThemeMode, ThemeContextValue } from '../types';
import { preloadHorrorFonts } from '../utils/assetLoader';
import { StorageService } from '../services/StorageService';

// Theme configurations for each mode
const PEACEFUL_MODE: ThemeMode = {
  mode: 'peaceful',
  healthStatus: 100,
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "San Francisco", sans-serif',
  backgroundFilter: 'brightness(1) saturate(1) blur(0)',
  textGlitch: false,
  showHorrorOverlay: false,
  greetingTemplate: 'Good {timeOfDay}, {name}',
  soundEnabled: false,
};

const GLITCH_MODE: ThemeMode = {
  mode: 'glitch',
  healthStatus: 60,
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "San Francisco", sans-serif',
  backgroundFilter: 'brightness(0.5) saturate(0.6) blur(1px)',
  textGlitch: true,
  showHorrorOverlay: true,
  greetingTemplate: 'Good {timeOfDay}, {name}',
  soundEnabled: false,
};

const NIGHTMARE_MODE: ThemeMode = {
  mode: 'nightmare',
  healthStatus: 20,
  fontFamily: '"Creepster", "Nosifer", cursive, sans-serif',
  backgroundFilter: 'brightness(0.3) saturate(0.3) blur(2px)',
  textGlitch: true,
  showHorrorOverlay: true,
  greetingTemplate: 'SYSTEM FAILURE... RUN {name}...',
  soundEnabled: true,
};

// Mode resolution function with threshold logic
function resolveMode(healthStatus: number): ThemeMode {
  if (healthStatus >= 80) {
    return { ...PEACEFUL_MODE, healthStatus };
  }
  if (healthStatus >= 40) {
    return { ...GLITCH_MODE, healthStatus };
  }
  return { ...NIGHTMARE_MODE, healthStatus };
}

// Create the context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [healthStatus, setHealthStatus] = useState<number>(100);
  const [theme, setTheme] = useState<ThemeMode>(resolveMode(100));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => StorageService.getSoundEnabled());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => StorageService.getReducedMotion());

  // Update theme when health status changes
  useEffect(() => {
    const newTheme = resolveMode(healthStatus);
    // Override sound based on user preference
    newTheme.soundEnabled = newTheme.soundEnabled && soundEnabled;
    setTheme(newTheme);
    
    // Update CSS custom properties for smooth transitions
    updateCSSProperties(newTheme, reducedMotion);
    
    // Preload horror fonts when entering glitch or nightmare mode
    if (newTheme.mode === 'glitch' || newTheme.mode === 'nightmare') {
      preloadHorrorFonts();
    }
  }, [healthStatus, soundEnabled, reducedMotion]);

  // Memoize setHealthStatus to prevent unnecessary re-renders
  const setHealthStatusMemoized = useCallback((status: number) => {
    setHealthStatus(status);
  }, []);

  // Memoize setSoundEnabled with storage persistence
  const setSoundEnabledMemoized = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    StorageService.setSoundEnabled(enabled);
  }, []);

  // Memoize setReducedMotion with storage persistence
  const setReducedMotionMemoized = useCallback((enabled: boolean) => {
    setReducedMotion(enabled);
    StorageService.setReducedMotion(enabled);
  }, []);

  const value: ThemeContextValue = {
    theme,
    healthStatus,
    setHealthStatus: setHealthStatusMemoized,
    soundEnabled,
    setSoundEnabled: setSoundEnabledMemoized,
    reducedMotion,
    setReducedMotion: setReducedMotionMemoized,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook to use the theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to update CSS custom properties
function updateCSSProperties(theme: ThemeMode, reducedMotion: boolean): void {
  const root = document.documentElement;
  
  root.style.setProperty('--font-primary', theme.fontFamily);
  root.style.setProperty('--bg-filter', theme.backgroundFilter);
  
  // Set text color based on mode
  const textColor = theme.mode === 'nightmare' ? '#ff0000' : 
                    theme.mode === 'glitch' ? '#cccccc' : '#333333';
  root.style.setProperty('--text-color', textColor);
  
  // Set overlay opacity
  const overlayOpacity = theme.mode === 'nightmare' ? '0.3' : 
                         theme.mode === 'glitch' ? '0.1' : '0';
  root.style.setProperty('--overlay-opacity', overlayOpacity);
  
  // Set glitch intensity (disable if reduced motion is enabled)
  const glitchIntensity = (theme.textGlitch && !reducedMotion) ? '1' : '0';
  root.style.setProperty('--glitch-intensity', glitchIntensity);
  
  // Add reduced motion class to body
  if (reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}
