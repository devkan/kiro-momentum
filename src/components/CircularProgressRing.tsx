import { useMemo } from 'react';
import { ThemeModeType } from '../types';

interface CircularProgressRingProps {
  progress: number;      // 0-1
  size: number;          // diameter in pixels
  strokeWidth: number;
  mode: ThemeModeType;
}

export function CircularProgressRing({ progress, size, strokeWidth, mode }: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  // Calculate colors based on mode
  const { strokeColor, glowColor, drip } = useMemo(() => {
    switch (mode) {
      case 'nightmare':
        return {
          strokeColor: '#ef4444', // red-500
          glowColor: 'rgba(239, 68, 68, 0.5)',
          drip: true,
        };
      case 'glitch':
        return {
          strokeColor: '#eab308', // yellow-500
          glowColor: 'rgba(234, 179, 8, 0.5)',
          drip: false,
        };
      case 'peaceful':
      default:
        return {
          strokeColor: '#22c55e', // green-500
          glowColor: 'rgba(34, 197, 94, 0.5)',
          drip: false,
        };
    }
  }, [mode]);

  const glitchClass = mode === 'glitch' ? 'animate-glitch' : '';

  return (
    <svg
      width={size}
      height={size}
      className={glitchClass}
      style={{ 
        filter: `drop-shadow(0 0 8px ${glowColor})`,
        overflow: 'visible'
      }}
    >
      {/* Dripping effect filter for nightmare mode */}
      {drip && (
        <defs>
          <filter id="drip-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.3"
              numOctaves="3"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                values="0.01 0.3;0.01 0.35;0.01 0.3"
                dur="3s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      )}

      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />

      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: 'stroke-dashoffset 0.3s ease',
          filter: drip ? 'url(#drip-effect)' : 'none',
        }}
      />

      {/* Pulsing effect for nightmare mode */}
      {mode === 'nightmare' && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth / 2}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity="0.5"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="animate-pulse-red"
        />
      )}
    </svg>
  );
}
