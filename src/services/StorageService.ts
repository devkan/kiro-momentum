import { Todo } from '../types';
import { sanitizeInput, validateApiKey, sanitizeTodoText } from '../utils/security';

export class StorageService {
  private static readonly KEYS = {
    USER_NAME: 'devops_dashboard_user_name',
    TODOS: 'devops_dashboard_todos',
    UNSPLASH_KEY: 'devops_dashboard_unsplash_key',
    WEATHER_KEY: 'devops_dashboard_weather_key',
    POMODORO_CONFIG: 'devops_dashboard_pomodoro_config',
    POMODORO_END_TIME: 'devops_dashboard_pomodoro_end_time',
    POMODORO_PHASE: 'devops_dashboard_pomodoro_phase',
    POMODORO_TOTAL_SECONDS: 'devops_dashboard_pomodoro_total_seconds',
    SOUND_ENABLED: 'devops_dashboard_sound_enabled',
    REDUCED_MOTION: 'devops_dashboard_reduced_motion',
    DATA_SOURCE: 'devops_dashboard_data_source',
    AWS_ACCESS_KEY: 'devops_dashboard_aws_access_key',
    AWS_SECRET_KEY: 'devops_dashboard_aws_secret_key',
    AWS_REGION: 'devops_dashboard_aws_region',
  };

  /**
   * Check if LocalStorage is available and functional
   */
  private static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Handle storage errors with appropriate fallback behavior
   */
  private static handleStorageError(error: unknown, operation: string): void {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Unable to save data.');
        throw new Error('Storage quota exceeded. Please clear some data.');
      } else if (error.name === 'SecurityError') {
        console.error('LocalStorage is disabled or unavailable.');
        throw new Error('Storage is disabled. Please enable it in browser settings.');
      }
    }
    console.error(`Storage ${operation} failed:`, error);
    throw error;
  }

  /**
   * Get user name from storage
   */
  static getUserName(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.USER_NAME);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set user name in storage
   */
  static setUserName(name: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // Sanitize input to prevent XSS
    const sanitizedName = sanitizeInput(name);
    
    if (!sanitizedName) {
      throw new Error('Invalid name provided');
    }

    try {
      localStorage.setItem(this.KEYS.USER_NAME, sanitizedName);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get todos from storage with validation
   */
  static getTodos(): Todo[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const todosJson = localStorage.getItem(this.KEYS.TODOS);
      if (!todosJson) {
        return [];
      }

      const parsed = JSON.parse(todosJson);
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid todos data format, returning empty array');
        return [];
      }

      // Validate each todo item and add completed field if missing
      const validTodos = parsed.filter((item): item is Todo => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.text === 'string' &&
          typeof item.createdAt === 'number'
        );
      }).map(item => ({
        ...item,
        completed: typeof item.completed === 'boolean' ? item.completed : false
      }));

      // Warn if some items were filtered out
      if (validTodos.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validTodos.length} invalid todo items`);
      }

      return validTodos;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Failed to parse todos JSON, returning empty array');
        return [];
      }
      this.handleStorageError(error, 'read');
      return [];
    }
  }

  /**
   * Set todos in storage with validation
   */
  static setTodos(todos: Todo[]): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // Validate input
    if (!Array.isArray(todos)) {
      throw new Error('Todos must be an array');
    }

    // Validate and sanitize each todo item
    const sanitizedTodos = todos.map(todo => {
      if (
        typeof todo !== 'object' ||
        todo === null ||
        typeof todo.id !== 'string' ||
        typeof todo.text !== 'string' ||
        typeof todo.createdAt !== 'number' ||
        typeof todo.completed !== 'boolean'
      ) {
        throw new Error('Invalid todo item format');
      }

      // Sanitize todo text to prevent XSS
      return {
        ...todo,
        text: sanitizeTodoText(todo.text),
      };
    });

    try {
      const todosJson = JSON.stringify(sanitizedTodos);
      localStorage.setItem(this.KEYS.TODOS, todosJson);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get Unsplash API key from storage
   */
  static getUnsplashKey(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.UNSPLASH_KEY);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set Unsplash API key in storage
   */
  static setUnsplashKey(key: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // Validate and sanitize API key
    const validation = validateApiKey(key);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key');
    }

    try {
      localStorage.setItem(this.KEYS.UNSPLASH_KEY, validation.sanitized);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get OpenWeatherMap API key from storage
   */
  static getWeatherKey(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.WEATHER_KEY);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set OpenWeatherMap API key in storage
   */
  static setWeatherKey(key: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // Validate and sanitize API key
    const validation = validateApiKey(key);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key');
    }

    try {
      localStorage.setItem(this.KEYS.WEATHER_KEY, validation.sanitized);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get Pomodoro config from storage
   */
  static getPomodoroConfig(): { workDuration: number; breakDuration: number; autoRepeat: boolean } | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const configJson = localStorage.getItem(this.KEYS.POMODORO_CONFIG);
      if (!configJson) {
        return null;
      }
      return JSON.parse(configJson);
    } catch (error) {
      console.error('Failed to parse Pomodoro config:', error);
      return null;
    }
  }

  /**
   * Set Pomodoro config in storage
   */
  static setPomodoroConfig(config: { workDuration: number; breakDuration: number; autoRepeat: boolean }): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    try {
      localStorage.setItem(this.KEYS.POMODORO_CONFIG, JSON.stringify(config));
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get Pomodoro end time from storage
   */
  static getPomodoroEndTime(): number | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const endTime = localStorage.getItem(this.KEYS.POMODORO_END_TIME);
      return endTime ? parseInt(endTime, 10) : null;
    } catch (error) {
      console.error('Failed to get Pomodoro end time:', error);
      return null;
    }
  }

  /**
   * Set Pomodoro end time in storage
   */
  static setPomodoroEndTime(endTime: number | null): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      if (endTime === null) {
        localStorage.removeItem(this.KEYS.POMODORO_END_TIME);
      } else {
        localStorage.setItem(this.KEYS.POMODORO_END_TIME, endTime.toString());
      }
    } catch (error) {
      console.error('Failed to set Pomodoro end time:', error);
    }
  }

  /**
   * Get Pomodoro phase from storage
   */
  static getPomodoroPhase(): 'work' | 'break' | 'idle' | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const phase = localStorage.getItem(this.KEYS.POMODORO_PHASE);
      if (phase === 'work' || phase === 'break' || phase === 'idle') {
        return phase;
      }
      return null;
    } catch (error) {
      console.error('Failed to get Pomodoro phase:', error);
      return null;
    }
  }

  /**
   * Set Pomodoro phase in storage
   */
  static setPomodoroPhase(phase: 'work' | 'break' | 'idle' | null): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      if (phase === null) {
        localStorage.removeItem(this.KEYS.POMODORO_PHASE);
      } else {
        localStorage.setItem(this.KEYS.POMODORO_PHASE, phase);
      }
    } catch (error) {
      console.error('Failed to set Pomodoro phase:', error);
    }
  }

  /**
   * Get Pomodoro total seconds from storage
   */
  static getPomodoroTotalSeconds(): number | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const totalSeconds = localStorage.getItem(this.KEYS.POMODORO_TOTAL_SECONDS);
      return totalSeconds ? parseInt(totalSeconds, 10) : null;
    } catch (error) {
      console.error('Failed to get Pomodoro total seconds:', error);
      return null;
    }
  }

  /**
   * Set Pomodoro total seconds in storage
   */
  static setPomodoroTotalSeconds(totalSeconds: number | null): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      if (totalSeconds === null) {
        localStorage.removeItem(this.KEYS.POMODORO_TOTAL_SECONDS);
      } else {
        localStorage.setItem(this.KEYS.POMODORO_TOTAL_SECONDS, totalSeconds.toString());
      }
    } catch (error) {
      console.error('Failed to set Pomodoro total seconds:', error);
    }
  }

  /**
   * Clear Pomodoro timer data
   */
  static clearPomodoroTimer(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.KEYS.POMODORO_END_TIME);
      localStorage.removeItem(this.KEYS.POMODORO_PHASE);
      localStorage.removeItem(this.KEYS.POMODORO_TOTAL_SECONDS);
    } catch (error) {
      console.error('Failed to clear Pomodoro timer:', error);
    }
  }

  /**
   * Get sound enabled preference from storage
   */
  static getSoundEnabled(): boolean {
    if (!this.isStorageAvailable()) {
      return true; // Default to enabled
    }

    try {
      const value = localStorage.getItem(this.KEYS.SOUND_ENABLED);
      return value === null ? true : value === 'true';
    } catch (error) {
      console.error('Failed to get sound enabled preference:', error);
      return true;
    }
  }

  /**
   * Set sound enabled preference in storage
   */
  static setSoundEnabled(enabled: boolean): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(this.KEYS.SOUND_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Failed to set sound enabled preference:', error);
    }
  }

  /**
   * Get reduced motion preference from storage
   */
  static getReducedMotion(): boolean {
    // Helper to check system preference safely
    const checkSystemPreference = (): boolean => {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
      } catch (e) {
        // Ignore errors in test environments
      }
      return false;
    };

    if (!this.isStorageAvailable()) {
      return checkSystemPreference();
    }

    try {
      const value = localStorage.getItem(this.KEYS.REDUCED_MOTION);
      if (value === null) {
        return checkSystemPreference();
      }
      return value === 'true';
    } catch (error) {
      console.error('Failed to get reduced motion preference:', error);
      return checkSystemPreference();
    }
  }

  /**
   * Set reduced motion preference in storage
   */
  static setReducedMotion(enabled: boolean): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(this.KEYS.REDUCED_MOTION, enabled.toString());
    } catch (error) {
      console.error('Failed to set reduced motion preference:', error);
    }
  }

  /**
   * Get data source preference from storage
   */
  static getDataSource(): 'aws' | 'hackernews' {
    if (!this.isStorageAvailable()) {
      return 'hackernews'; // Default to Hacker News
    }

    try {
      const value = localStorage.getItem(this.KEYS.DATA_SOURCE);
      return value === 'aws' ? 'aws' : 'hackernews';
    } catch (error) {
      console.error('Failed to get data source preference:', error);
      return 'hackernews';
    }
  }

  /**
   * Set data source preference in storage
   */
  static setDataSource(source: 'aws' | 'hackernews'): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(this.KEYS.DATA_SOURCE, source);
    } catch (error) {
      console.error('Failed to set data source preference:', error);
    }
  }

  /**
   * Get AWS Access Key from storage
   */
  static getAwsAccessKey(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.AWS_ACCESS_KEY);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set AWS Access Key in storage
   */
  static setAwsAccessKey(key: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // Validate and sanitize API key
    const validation = validateApiKey(key);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid AWS Access Key');
    }

    try {
      localStorage.setItem(this.KEYS.AWS_ACCESS_KEY, validation.sanitized);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get AWS Secret Key from storage
   */
  static getAwsSecretKey(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.AWS_SECRET_KEY);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set AWS Secret Key in storage
   */
  static setAwsSecretKey(key: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    // AWS secret keys can contain special characters like +, /, =
    // So we use a more lenient validation
    const trimmed = key.trim();
    if (!trimmed || trimmed.length < 10) {
      throw new Error('Invalid AWS Secret Key');
    }

    try {
      localStorage.setItem(this.KEYS.AWS_SECRET_KEY, trimmed);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Get AWS Region from storage
   */
  static getAwsRegion(): string | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.KEYS.AWS_REGION);
    } catch (error) {
      this.handleStorageError(error, 'read');
      return null;
    }
  }

  /**
   * Set AWS Region in storage
   */
  static setAwsRegion(region: string): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Storage is not available');
    }

    const trimmed = region.trim();
    if (!trimmed) {
      throw new Error('Invalid AWS Region');
    }

    try {
      localStorage.setItem(this.KEYS.AWS_REGION, trimmed);
    } catch (error) {
      this.handleStorageError(error, 'write');
    }
  }

  /**
   * Clear all storage data (useful for testing or reset)
   */
  static clearAll(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.KEYS.USER_NAME);
      localStorage.removeItem(this.KEYS.TODOS);
      localStorage.removeItem(this.KEYS.UNSPLASH_KEY);
      localStorage.removeItem(this.KEYS.WEATHER_KEY);
      localStorage.removeItem(this.KEYS.POMODORO_CONFIG);
      localStorage.removeItem(this.KEYS.POMODORO_END_TIME);
      localStorage.removeItem(this.KEYS.POMODORO_PHASE);
      localStorage.removeItem(this.KEYS.POMODORO_TOTAL_SECONDS);
      localStorage.removeItem(this.KEYS.SOUND_ENABLED);
      localStorage.removeItem(this.KEYS.REDUCED_MOTION);
      localStorage.removeItem(this.KEYS.DATA_SOURCE);
      localStorage.removeItem(this.KEYS.AWS_ACCESS_KEY);
      localStorage.removeItem(this.KEYS.AWS_SECRET_KEY);
      localStorage.removeItem(this.KEYS.AWS_REGION);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
