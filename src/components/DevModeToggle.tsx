import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function DevModeToggle() {
  const { healthStatus, setHealthStatus } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setHealthStatus(value);
  };

  // Determine current mode for display
  const getModeName = (status: number): string => {
    if (status >= 80) return 'Peaceful';
    if (status >= 40) return 'Glitch';
    return 'Nightmare';
  };

  const currentMode = getModeName(healthStatus);
  
  // Calculate position percentages for threshold indicators
  const threshold80Position = (80 / 100) * 100;
  const threshold40Position = (40 / 100) * 100;

  return (
    <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-xl p-3 min-w-[240px] h-[88px] flex flex-col justify-center">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white text-xs font-semibold">Health: {healthStatus}</span>
          <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">
            {currentMode}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white text-xs">0</span>
          
          <div className="relative flex-1">
            {/* Colored gauge background */}
            <div className="absolute inset-0 h-2 rounded-lg overflow-hidden pointer-events-none">
              <div className="absolute inset-0 flex">
                <div className="bg-red-500 opacity-30" style={{ width: '40%' }}></div>
                <div className="bg-yellow-500 opacity-30" style={{ width: '40%' }}></div>
                <div className="bg-green-500 opacity-30" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            {/* Slider input - hidden but functional */}
            <input
              type="range"
              min="0"
              max="100"
              value={healthStatus}
              onChange={handleChange}
              className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10"
              style={{
                WebkitAppearance: 'none',
                background: 'transparent',
              }}
              aria-label="Health status slider"
            />
            
            {/* Ghost emoji slider thumb - moved up 10px */}
            <div 
              className="absolute pointer-events-none z-20 text-2xl transition-all duration-150"
              style={{ 
                left: `calc(${healthStatus}% - 12px)`,
                top: 'calc(50% - 10px)',
                transform: 'translateY(-50%)',
              }}
            >
              👻
            </div>
            
            {/* Threshold indicators */}
            <div 
              className="absolute top-[-8px] w-0.5 h-6 bg-yellow-400 pointer-events-none z-5"
              style={{ left: `${threshold80Position}%`, transform: 'translateX(-50%)' }}
              title="Peaceful/Glitch threshold (80)"
            />
            <div 
              className="absolute top-[-8px] w-0.5 h-6 bg-red-400 pointer-events-none z-5"
              style={{ left: `${threshold40Position}%`, transform: 'translateX(-50%)' }}
              title="Glitch/Nightmare threshold (40)"
            />
          </div>
          
          <span className="text-white text-xs">100</span>
        </div>
      </div>
    </div>
  );
}
