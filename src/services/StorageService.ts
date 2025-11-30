import { Todo } from '../types';

export class StorageService {
  private static readonly KEYS = {
    USER_NAME: 'devops_dashboard_user_name',
    TODOS: 'devops_dashboard_todos',
    UNSPLASH_KEY: 'devops_dashboard_unsplash_key',
    WEATHER_KEY: 'devops_dashboard_weather_key',
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

    try {
      localStorage.setItem(this.KEYS.USER_NAME, name);
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

    // Validate each todo item
    for (const todo of todos) {
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
    }

    try {
      const todosJson = JSON.stringify(todos);
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

    try {
      localStorage.setItem(this.KEYS.UNSPLASH_KEY, key);
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

    try {
      localStorage.setItem(this.KEYS.WEATHER_KEY, key);
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
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
