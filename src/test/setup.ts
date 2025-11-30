import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock HTMLMediaElement methods that aren't implemented in JSDOM
class MockAudio {
  src = '';
  loop = false;
  volume = 1;
  paused = true;
  
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  load = vi.fn();
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
}

// Replace the global Audio constructor with our mock
global.Audio = MockAudio as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
