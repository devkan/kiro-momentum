import { useTheme } from '../contexts/ThemeContext';

export function HorrorOverlay() {
  const { theme } = useTheme();

  // Don't render anything in peaceful mode
  if (theme.mode === 'peaceful') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
    >
      {/* Glitch Mode: Scanline effects and flicker */}
      {theme.mode === 'glitch' && (
        <>
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-20" />
          
          {/* Flicker effect */}
          <div className="absolute inset-0 flicker bg-black opacity-0" />
        </>
      )}

      {/* Nightmare Mode: Red vignette and pulsing effects */}
      {theme.mode === 'nightmare' && (
        <>
          {/* Red vignette overlay */}
          <div className="absolute inset-0 red-vignette" />
          
          {/* Pulsing red overlay */}
          <div className="absolute inset-0 pulse-red bg-red-900 opacity-0" />
          
          {/* Scanlines (more intense) */}
          <div className="absolute inset-0 scanlines opacity-30" />
        </>
      )}
    </div>
  );
}
