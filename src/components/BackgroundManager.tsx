import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

// Import local fallback images (all jpg format based on actual files)
import fallback1 from '../assets/fallback-1.jpg';
import fallback2 from '../assets/fallback-2.jpg';
import fallback3 from '../assets/fallback-3.jpg';
import fallback4 from '../assets/fallback-4.jpg';
import fallback5 from '../assets/fallback-5.jpg';
import horrorBackground from '../assets/horror-background.jpg';

const LOCAL_FALLBACK_IMAGES = [
  fallback1,
  fallback2,
  fallback3,
  fallback4,
  fallback5,
];

interface BackgroundState {
  imageUrl: string;
  isLoading: boolean;
  source: 'unsplash' | 'local' | 'horror';
}

export function BackgroundManager() {
  const { theme } = useTheme();
  const [backgroundState, setBackgroundState] = useState<BackgroundState>({
    imageUrl: '',
    isLoading: true,
    source: 'local',
  });

  // Preload local fallback images for performance
  useEffect(() => {
    LOCAL_FALLBACK_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
      };
    });
    
    // Preload horror background
    const horrorImg = new Image();
    horrorImg.src = horrorBackground;
    horrorImg.onerror = () => {
      console.warn('Failed to preload horror background');
    };
  }, []);

  // Helper function to get a random local fallback image
  const getRandomLocalImage = (): string => {
    if (LOCAL_FALLBACK_IMAGES.length === 0) {
      console.error('No fallback images available');
      return '';
    }
    const randomIndex = Math.floor(Math.random() * LOCAL_FALLBACK_IMAGES.length);
    return LOCAL_FALLBACK_IMAGES[randomIndex];
  };

  // Fetch background image based on mode and API key availability
  useEffect(() => {
    const fetchBackground = async () => {
      // Override with horror image in Nightmare Mode
      if (theme.mode === 'nightmare') {
        setBackgroundState({
          imageUrl: horrorBackground,
          isLoading: false,
          source: 'horror',
        });
        return;
      }

      // Check for Unsplash API key
      const apiKey = StorageService.getUnsplashKey();

      if (apiKey) {
        // Attempt to fetch from Unsplash
        try {
          setBackgroundState((prev) => ({ ...prev, isLoading: true }));
          
          const response = await fetch(
            `https://api.unsplash.com/photos/random?orientation=landscape&query=nature`,
            {
              headers: {
                Authorization: `Client-ID ${apiKey}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
          }

          const data = await response.json();
          const imageUrl = data.urls.regular;

          setBackgroundState({
            imageUrl,
            isLoading: false,
            source: 'unsplash',
          });
        } catch (error) {
          console.error('Failed to fetch from Unsplash, falling back to local image:', error);
          // Fall back to local image
          setBackgroundState({
            imageUrl: getRandomLocalImage(),
            isLoading: false,
            source: 'local',
          });
        }
      } else {
        // No API key, use local fallback
        setBackgroundState({
          imageUrl: getRandomLocalImage(),
          isLoading: false,
          source: 'local',
        });
      }
    };

    fetchBackground();
  }, [theme.mode]); // Re-fetch when mode changes

  // Handle image load errors
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (backgroundState.imageUrl) {
      setImageError(false);
      
      // Test if image can be loaded
      const img = new Image();
      img.src = backgroundState.imageUrl;
      img.onerror = () => {
        console.error(`Failed to load background image: ${backgroundState.imageUrl}`);
        setImageError(true);
        
        // If current image fails and it's not already a local fallback, try another local image
        if (backgroundState.source !== 'local') {
          setBackgroundState({
            imageUrl: getRandomLocalImage(),
            isLoading: false,
            source: 'local',
          });
        }
      };
    }
  }, [backgroundState.imageUrl]);

  // Apply background filter from theme
  const filterStyle = {
    filter: theme.backgroundFilter,
  };

  // Use gradient fallback if image fails to load
  const backgroundStyle = imageError 
    ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    : { backgroundImage: backgroundState.imageUrl ? `url(${backgroundState.imageUrl})` : 'none' };

  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-1000"
      style={{
        ...backgroundStyle,
        backgroundColor: backgroundState.isLoading ? '#1a1a1a' : '#2d3748',
        ...filterStyle,
      }}
      role="img"
      aria-label="Dashboard background"
    >
      {backgroundState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Loading background...</div>
        </div>
      )}
    </div>
  );
}
