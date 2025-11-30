import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioManager } from './AudioManager';

// Mock the useTheme hook
vi.mock('../contexts/ThemeContext', async () => {
  const actual = await vi.importActual('../contexts/ThemeContext') as Record<string, unknown>;
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});

describe('AudioManager', () => {
  let mockAudio: any;
  let audioInstances: any[] = [];

  beforeEach(() => {
    // Mock Audio constructor
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        if (event === 'canplaythrough') {
          // Simulate successful load
          setTimeout(() => handler(), 0);
        }
      }),
      removeEventListener: vi.fn(),
      src: '',
      loop: false,
      volume: 1,
    };

    global.Audio = vi.fn(() => {
      audioInstances.push(mockAudio);
      return mockAudio;
    }) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    audioInstances = [];
  });

  it('should not render when audio files are not available', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    (useTheme as any).mockReturnValue({
      theme: {
        mode: 'nightmare',
        soundEnabled: true,
      },
    });

    // Mock audio to fail loading
    mockAudio.addEventListener = vi.fn((event, handler) => {
      if (event === 'error') {
        setTimeout(() => handler(), 0);
      }
    });

    const { container } = render(<AudioManager />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should not render in peaceful mode', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    (useTheme as any).mockReturnValue({
      theme: {
        mode: 'peaceful',
        soundEnabled: false,
      },
    });

    const { container } = render(<AudioManager />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render mute button in nightmare mode when audio is available', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    (useTheme as any).mockReturnValue({
      theme: {
        mode: 'nightmare',
        soundEnabled: true,
      },
    });

    render(<AudioManager />);
    
    await waitFor(() => {
      const muteButton = screen.queryByLabelText(/mute audio/i);
      expect(muteButton).toBeInTheDocument();
    });
  });

  it('should toggle mute state when mute button is clicked', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    (useTheme as any).mockReturnValue({
      theme: {
        mode: 'nightmare',
        soundEnabled: true,
      },
    });

    const user = userEvent.setup();
    render(<AudioManager />);
    
    await waitFor(() => {
      expect(screen.queryByLabelText(/mute audio/i)).toBeInTheDocument();
    });

    const muteButton = screen.getByLabelText(/mute audio/i);
    await user.click(muteButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/unmute audio/i)).toBeInTheDocument();
    });
  });

  it('should handle autoplay blocking gracefully', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    (useTheme as any).mockReturnValue({
      theme: {
        mode: 'nightmare',
        soundEnabled: true,
      },
    });

    // Mock play to reject with NotAllowedError
    mockAudio.play = vi.fn().mockRejectedValue({ name: 'NotAllowedError' });

    render(<AudioManager />);
    
    await waitFor(() => {
      expect(screen.queryByText(/click to enable audio/i)).toBeInTheDocument();
    });
  });

  it('should pause audio when switching from nightmare to glitch mode', async () => {
    const { useTheme } = await import('../contexts/ThemeContext');
    const mockUseTheme = useTheme as any;
    
    mockUseTheme.mockReturnValue({
      theme: {
        mode: 'nightmare',
        soundEnabled: true,
      },
    });

    const { rerender } = render(<AudioManager />);
    
    await waitFor(() => {
      expect(mockAudio.play).toHaveBeenCalled();
    });

    // Switch to glitch mode
    mockUseTheme.mockReturnValue({
      theme: {
        mode: 'glitch',
        soundEnabled: false,
      },
    });

    rerender(<AudioManager />);
    
    await waitFor(() => {
      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });
});
