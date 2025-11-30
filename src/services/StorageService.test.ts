import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from './StorageService';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    StorageService.clearAll();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: devops-nightmare-dashboard, Property 1: Name persistence round trip
     * Validates: Requirements 1.2
     */
    it('should persist and retrieve any valid user name (round trip)', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary strings for user names
          // We use fc.string() which generates various strings including empty, unicode, etc.
          fc.string({ minLength: 1, maxLength: 100 }),
          (userName) => {
            // Clear storage before each iteration
            StorageService.clearAll();

            // Store the user name
            StorageService.setUserName(userName);

            // Retrieve the user name
            const retrievedName = StorageService.getUserName();

            // The retrieved name should be identical to the stored name
            expect(retrievedName).toBe(userName);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });

    /**
     * Feature: devops-nightmare-dashboard, Property 7: Settings persistence round trip
     * Validates: Requirements 6.3
     */
    it('should persist and retrieve any valid Unsplash API key (round trip)', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary strings for API keys
          // API keys can be various formats, so we test with diverse strings
          fc.string({ minLength: 1, maxLength: 200 }),
          (apiKey) => {
            // Clear storage before each iteration
            StorageService.clearAll();

            // Store the API key
            StorageService.setUnsplashKey(apiKey);

            // Retrieve the API key
            const retrievedKey = StorageService.getUnsplashKey();

            // The retrieved key should be identical to the stored key
            expect(retrievedKey).toBe(apiKey);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });

    /**
     * Feature: devops-nightmare-dashboard, Property 2: Todo list persistence round trip
     * Validates: Requirements 4.4
     */
    it('should persist and retrieve any list of todo items (round trip)', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary arrays of todo items
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              text: fc.string({ minLength: 1, maxLength: 200 }),
              createdAt: fc.integer({ min: 0, max: Date.now() + 1000000 }),
              completed: fc.boolean(),
            }),
            { maxLength: 50 } // Reasonable max number of todos
          ),
          (todos) => {
            // Clear storage before each iteration
            StorageService.clearAll();

            // Store the todo list
            StorageService.setTodos(todos);

            // Retrieve the todo list
            const retrievedTodos = StorageService.getTodos();

            // The retrieved list should be equivalent to the stored list
            expect(retrievedTodos).toEqual(todos);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });

    /**
     * Weather API key persistence round trip
     */
    it('should persist and retrieve any valid Weather API key (round trip)', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary strings for API keys
          fc.string({ minLength: 1, maxLength: 200 }),
          (apiKey) => {
            // Clear storage before each iteration
            StorageService.clearAll();

            // Store the API key
            StorageService.setWeatherKey(apiKey);

            // Retrieve the API key
            const retrievedKey = StorageService.getWeatherKey();

            // The retrieved key should be identical to the stored key
            expect(retrievedKey).toBe(apiKey);
          }
        ),
        { numRuns: 100 } // Run 100 iterations
      );
    });
  });
});
