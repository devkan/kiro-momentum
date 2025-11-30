import { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function AudioManager() {
  const { theme } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    
    // Try to load siren sound first, fallback to heartbeat
    const tryLoadAudio = async () => {
      const audioFiles = [
        '/audio/siren.mp3',
        '/audio/heartbeat.mp3',
        '/audio/horror.mp3'
      ];

      for (const file of audioFiles) {
        try {
          audio.src = file;
          audio.loop = true;
          audio.volume = 0.3;
          
          // Test if the audio can be loaded
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });
          
          // If we get here, audio loaded successfully
          setAudioAvailable(true);
          audioRef.current = audio;
          return;
        } catch (error) {
          // Try next file
          continue;
        }
      }
      
      // No audio files available
      setAudioAvailable(false);
      console.warn('No horror audio files found. Audio features will be disabled.');
    };

    tryLoadAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio playback based on theme mode
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioAvailable) return;

    const shouldPlay = theme.mode === 'nightmare' && theme.soundEnabled && !isMuted;

    if (shouldPlay) {
      // Try to play audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
            setAutoplayBlocked(false);
          })
          .catch((error) => {
            // Autoplay was blocked
            if (error.name === 'NotAllowedError') {
              setAutoplayBlocked(true);
              console.warn('Audio autoplay blocked. User interaction required.');
            }
          });
      }
    } else {
      audio.pause();
      setAutoplayBlocked(false);
    }
  }, [theme.mode, theme.soundEnabled, isMuted, audioAvailable]);

  // Handle manual play when autoplay is blocked
  const handleManualPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play()
      .then(() => {
        setAutoplayBlocked(false);
      })
      .catch((error) => {
        console.error('Failed to play audio:', error);
      });
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Don't render anything if audio is not available
  if (!audioAvailable) {
    return null;
  }

  // Only show controls in nightmare mode
  if (theme.mode !== 'nightmare') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
      {/* Mute/Unmute toggle */}
      <button
        onClick={toggleMute}
        className="p-3 bg-red-900 bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200 backdrop-blur-sm border border-red-500"
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? (
          <VolumeX size={24} className="text-red-300" />
        ) : (
          <Volume2 size={24} className="text-red-300" />
        )}
      </button>

      {/* Manual play button when autoplay is blocked */}
      {autoplayBlocked && !isMuted && (
        <button
          onClick={handleManualPlay}
          className="px-4 py-2 bg-red-900 bg-opacity-70 hover:bg-opacity-90 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-500 text-red-300 text-sm font-semibold animate-pulse"
          aria-label="Enable audio"
        >
          Click to Enable Audio
        </button>
      )}
    </div>
  );
}
