export interface Todo {
  id: string;
  text: string;
  createdAt: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  onboardingComplete: boolean;
}

export interface AppSettings {
  unsplashApiKey: string | null;
  soundEnabled: boolean;
}

export type ThemeModeType = 'peaceful' | 'glitch' | 'nightmare';

export interface ThemeMode {
  mode: ThemeModeType;
  healthStatus: number;
  fontFamily: string;
  backgroundFilter: string;
  textGlitch: boolean;
  showHorrorOverlay: boolean;
  greetingTemplate: string;
  soundEnabled: boolean;
}

export interface ThemeContextValue {
  theme: ThemeMode;
  healthStatus: number;
  setHealthStatus: (status: number) => void;
}
