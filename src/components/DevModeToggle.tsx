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
    if (status >= 80) return 'STABLE';
    if (status >= 40) return 'DEGRADED';
    return 'CRITICAL';
  };

  const getModeColor = (status: number): string => {
    if (status >= 80) return 'text-green-400';
    if (status >= 40) return 'text-yellow-400';
    return 'text-red-500';
  };

  const currentMode = getModeName(healthStatus);
  const modeColor = getModeColor(healthStatus);
  
  // Calculate position percentages for threshold indicators
  const threshold80Position = (80 / 100) * 100;
  const threshold40Position = (40 / 100) * 100;

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-md rounded-2xl p-4 min-w-[500px] border-2 border-white border-opacity-20 shadow-2xl font-mono">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-white text-sm font-bold tracking-wider">SYSTEM STABILITY</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${modeColor} tracking-wider`}>
              {currentMode}
            </span>
            <span className="text-white text-sm font-bold">
              {healthStatus}%
            </span>
          </div>
        </div>
        
        {/* Slider */}
        <div className="flex items-center gap-3">
          <span className="text-white text-xs font-mono">0</span>
          
          <div className="relative flex-1">
            {/* Colored gauge background with segments */}
            <div className="absolute inset-0 h-3 rounded-lg overflow-hidden pointer-events-none border border-white border-opacity-30">
              <div className="absolute inset-0 flex">
                <div className="bg-red-600 opacity-40" style={{ width: '40%' }}></div>
                <div className="bg-yellow-500 opacity-40" style={{ width: '40%' }}></div>
                <div className="bg-green-500 opacity-40" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            {/* Progress fill */}
            <div 
              className="absolute inset-0 h-3 rounded-lg overflow-hidden pointer-events-none"
              style={{ width: `${healthStatus}%` }}
            >
              <div className={`h-full ${
                healthStatus >= 80 ? 'bg-green-500' : 
                healthStatus >= 40 ? 'bg-yellow-500' : 
                'bg-red-600'
              } opacity-80`}></div>
            </div>
            
            {/* Slider input - hidden but functional */}
            <input
              type="range"
              min="0"
              max="100"
              value={healthStatus}
              onChange={handleChange}
              className="w-full h-3 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10"
              style={{
                WebkitAppearance: 'none',
                background: 'transparent',
              }}
              aria-label="System stability slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={healthStatus}
              aria-valuetext={`${healthStatus}% - ${currentMode}`}
            />
            
            {/* Ghost emoji slider thumb */}
            <div 
              className="absolute pointer-events-none z-20 text-2xl transition-all duration-150"
              style={{ 
                left: `calc(${healthStatus}% - 12px)`,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              👻
            </div>
            
            {/* Threshold indicators */}
            <div 
              className="absolute top-[-6px] w-0.5 h-6 bg-yellow-300 pointer-events-none z-5 opacity-60"
              style={{ left: `${threshold80Position}%`, transform: 'translateX(-50%)' }}
              title="Stable/Degraded threshold (80)"
            />
            <div 
              className="absolute top-[-6px] w-0.5 h-6 bg-red-300 pointer-events-none z-5 opacity-60"
              style={{ left: `${threshold40Position}%`, transform: 'translateX(-50%)' }}
              title="Degraded/Critical threshold (40)"
            />
          </div>
          
          <span className="text-white text-xs font-mono">100</span>
        </div>

        {/* Status indicators */}
        <div className="flex justify-between text-[10px] text-white text-opacity-60 font-mono tracking-wide">
          <span>CRITICAL</span>
          <span>DEGRADED</span>
          <span>STABLE</span>
        </div>
      </div>
    </div>
  );
}
