import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PomodoroState } from '../types';

interface PomodoroAudioManagerProps {
  pomodoroState: PomodoroState;
}

export function PomodoroAudioManager({ pomodoroState }: PomodoroAudioManagerProps) {
  const { theme, soundEnabled } = useTheme();
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const fastTickAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<string>(pomodoroState.phase);
  const previousRemainingRef = useRef<number>(pomodoroState.remainingSeconds);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fade audio smoothly
  const fadeAudio = (audio: HTMLAudioElement, fadeIn: boolean, targetVolume: number, duration: number = 500) => {
    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const endVolume = fadeIn ? targetVolume : 0;
    const volumeStep = (endVolume - startVolume) / steps;
    
    let currentStep = 0;
    
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      audio.volume = Math.max(0, Math.min(targetVolume, newVolume));
      
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        if (!fadeIn) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    }, stepDuration);
  };

  // Initialize audio elements
  useEffect(() => {
    // Tick sound (normal speed)
    const tickAudio = new Audio('/audio/tick.mp3');
    tickAudio.loop = true;
    tickAudio.volume = 0.2;
    tickAudioRef.current = tickAudio;

    // Fast tick sound
    const fastTickAudio = new Audio('/audio/fast_tick.mp3');
    fastTickAudio.loop = true;
    fastTickAudio.volume = 0.3;
    fastTickAudioRef.current = fastTickAudio;

    return () => {
      tickAudio.pause();
      fastTickAudio.pause();
    };
  }, []);

  // Handle ticking sound in Nightmare Mode
  useEffect(() => {
    const tickAudio = tickAudioRef.current;
    const fastTickAudio = fastTickAudioRef.current;
    
    if (!tickAudio || !fastTickAudio || !soundEnabled) return;

    const isNightmare = theme.mode === 'nightmare';
    const isActive = pomodoroState.isActive && !pomodoroState.isPaused;
    const isLastMinute = pomodoroState.remainingSeconds <= 60;

    if (isNightmare && isActive) {
      if (isLastMinute) {
        // Switch to fast tick in last 60 seconds
        if (!tickAudio.paused) {
          fadeAudio(tickAudio, false, 0.2, 300);
        }
        if (fastTickAudio.paused) {
          fastTickAudio.volume = 0;
          fastTickAudio.play().then(() => {
            fadeAudio(fastTickAudio, true, 0.3, 300);
          }).catch(() => {
            // Autoplay blocked, ignore
          });
        }
      } else {
        // Normal tick
        if (!fastTickAudio.paused) {
          fadeAudio(fastTickAudio, false, 0.3, 300);
        }
        if (tickAudio.paused) {
          tickAudio.volume = 0;
          tickAudio.play().then(() => {
            fadeAudio(tickAudio, true, 0.2, 300);
          }).catch(() => {
            // Autoplay blocked, ignore
          });
        }
      }
    } else {
      // Fade out and stop all ticking
      if (!tickAudio.paused) {
        fadeAudio(tickAudio, false, 0.2, 500);
      }
      if (!fastTickAudio.paused) {
        fadeAudio(fastTickAudio, false, 0.3, 500);
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [theme.mode, pomodoroState.isActive, pomodoroState.isPaused, pomodoroState.remainingSeconds, soundEnabled]);

  // Handle phase completion alarm
  useEffect(() => {
    // Detect phase change (completion)
    const phaseChanged = previousPhaseRef.current !== pomodoroState.phase;
    const timerWasActive = previousRemainingRef.current > 0;
    const timerCompleted = pomodoroState.remainingSeconds === 0 || 
                          (phaseChanged && timerWasActive && pomodoroState.isActive);

    if (timerCompleted && soundEnabled) {
      // Play alarm based on mode
      const alarmFile = theme.mode === 'nightmare' 
        ? '/audio/alarm_nightmare.mp3'
        : '/audio/alarm_peaceful.mp3';

      const alarm = new Audio(alarmFile);
      alarm.volume = 0.5;
      alarm.play().catch(() => {
        // Autoplay blocked, ignore
      });

      alarmAudioRef.current = alarm;
    }

    // Update refs
    previousPhaseRef.current = pomodoroState.phase;
    previousRemainingRef.current = pomodoroState.remainingSeconds;
  }, [pomodoroState.phase, pomodoroState.remainingSeconds, pomodoroState.isActive, theme.mode, soundEnabled]);

  // This component doesn't render anything
  return null;
}
