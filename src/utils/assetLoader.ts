/**
 * Utility for lazy loading horror assets
 * This helps with code splitting and reduces initial bundle size
 */

// Lazy load horror background image
export const loadHorrorBackground = async (): Promise<string> => {
  const module = await import('../assets/horror-background.jpg');
  return module.default;
};

// Lazy load horror fonts (loaded via CSS, but we can preload them conditionally)
export const preloadHorrorFonts = (): void => {
  // Check if we're in a browser environment with font API support
  if (typeof document === 'undefined' || !document.fonts) {
    return;
  }

  // Only preload if not already loaded
  try {
    if (document.fonts.check('1em Creepster') && document.fonts.check('1em Nosifer')) {
      return;
    }
  } catch (e) {
    // Font check might fail in some environments, continue with loading
  }

  // Create link elements for Google Fonts
  const creepsterLink = document.createElement('link');
  creepsterLink.href = 'https://fonts.googleapis.com/css2?family=Creepster&display=swap';
  creepsterLink.rel = 'stylesheet';
  
  const nosiferLink = document.createElement('link');
  nosiferLink.href = 'https://fonts.googleapis.com/css2?family=Nosifer&display=swap';
  nosiferLink.rel = 'stylesheet';
  
  document.head.appendChild(creepsterLink);
  document.head.appendChild(nosiferLink);
};

// Preload audio files conditionally
export const preloadAudio = (audioFiles: string[]): void => {
  audioFiles.forEach(src => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
    audio.load();
  });
};
