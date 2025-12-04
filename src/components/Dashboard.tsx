import { useState, useEffect, lazy, Suspense } from 'react';
import { Settings, Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { OnboardingModal } from './OnboardingModal';
import { PomodoroModal } from './PomodoroModal';
import { Greeting } from './Greeting';
import { Clock } from './Clock';
import { TodoList } from './TodoList';
import { Weather } from './Weather';
import { BackgroundManager } from './BackgroundManager';
import { HorrorOverlay } from './HorrorOverlay';
import { DevModeToggle } from './DevModeToggle';
import { AudioManager } from './AudioManager';
import { AwsMonitoringPanel } from './aws/AwsMonitoringPanel';
import { HackerNewsPanel } from './hackernews/HackerNewsPanel';
import { StorageService } from '../services/StorageService';
import { usePomodoro } from '../hooks/usePomodoro';

// Lazy load SettingsModal
const SettingsModal = lazy(() => import('./SettingsModal').then(module => ({ default: module.SettingsModal })));

export function Dashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [backgroundRefreshKey, setBackgroundRefreshKey] = useState(0);
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0);
  const [dataSource, setDataSource] = useState<'aws' | 'hackernews'>('hackernews');
  
  // Pomodoro timer hook
  const pomodoro = usePomodoro();

  // First-load detection: check if user name exists in storage
  useEffect(() => {
    const storedName = StorageService.getUserName();
    const storedDataSource = StorageService.getDataSource();
    setUserName(storedName);
    setDataSource(storedDataSource);
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
  };

  const handleApiKeySaved = () => {
    // Trigger background and weather refresh by updating the keys
    setBackgroundRefreshKey(prev => prev + 1);
    setWeatherRefreshKey(prev => prev + 1);
    
    // Update data source preference
    const storedDataSource = StorageService.getDataSource();
    setDataSource(storedDataSource);
  };

  // Show loading state briefly while checking storage
  if (isLoading) {
    return null;
  }

  // Apply theme-based CSS classes
  const dashboardClasses = `
    h-screen 
    flex flex-col 
    relative 
    overflow-hidden
    transition-all duration-500 ease-in-out
    ${theme.mode === 'nightmare' ? 'text-red-500' : ''}
    ${theme.mode === 'glitch' ? 'text-gray-300' : ''}
    ${theme.mode === 'peaceful' ? 'text-white' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Background layer */}
      <BackgroundManager key={backgroundRefreshKey} />
      
      {/* Horror overlay - conditional rendering based on mode */}
      <HorrorOverlay />
      
      {/* CRT Scanline overlay - show in Glitch and Nightmare modes */}
      {(theme.mode === 'glitch' || theme.mode === 'nightmare') && (
        <div className="crt-scanlines" />
      )}
      
      {/* Modals */}
      {!userName && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      <Suspense fallback={null}>
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onApiKeySaved={handleApiKeySaved}
        />
      </Suspense>
      
      <PomodoroModal
        isOpen={isPomodoroModalOpen}
        onClose={() => setIsPomodoroModalOpen(false)}
        onStart={(config) => pomodoro.start(config)}
      />
      
      {/* Audio Manager - conditional rendering based on mode */}
      <AudioManager />
      
      {/* Main Dashboard Layout */}
      <div className={dashboardClasses}>
        {userName ? (
          <>
            {/* Three Column Layout */}
            <main id="main-content" className="flex h-full gap-8 px-8 py-8 overflow-hidden">
              {/* Left Column - Data Source Panel */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full">
                  {dataSource === 'aws' ? (
                    <AwsMonitoringPanel key="aws-panel" />
                  ) : (
                    <HackerNewsPanel key="hn-panel" />
                  )}
                </div>
              </div>

              {/* Center Column - Clock and Greeting */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-6">
                  <Clock pomodoroState={pomodoro.state} />
                </div>
                <div>
                  <Greeting />
                </div>
              </div>

              {/* Right Column - Weather, Settings, and Todo List */}
              <div className="flex-1 flex flex-col">
                {/* Top Controls Row */}
                <div className="flex items-stretch justify-end gap-3 mb-8">
                  {/* Weather - match settings height */}
                  <Weather key={weatherRefreshKey} />
                  
                  {/* Pomodoro Timer button */}
                  {!pomodoro.state.isActive ? (
                    <button
                      onClick={() => setIsPomodoroModalOpen(true)}
                      className={`h-[88px] w-[88px] transition-all duration-300 flex-shrink-0 flex items-center justify-center hover:opacity-80 ${theme.textGlitch ? 'glitch' : ''}`}
                      aria-label="Start Pomodoro Timer"
                    >
                      <Timer size={64} className="text-white drop-shadow-lg" />
                    </button>
                  ) : (
                    <div className={`h-[88px] w-[88px] flex-shrink-0 flex flex-col items-center justify-center gap-2 ${theme.textGlitch ? 'glitch' : ''}`}>
                      <div className="flex gap-2">
                        <button
                          onClick={pomodoro.state.isPaused ? pomodoro.resume : pomodoro.pause}
                          className="p-2 transition-all hover:opacity-80"
                          aria-label={pomodoro.state.isPaused ? 'Resume timer' : 'Pause timer'}
                        >
                          {pomodoro.state.isPaused ? (
                            <Play size={20} className="text-white" />
                          ) : (
                            <Pause size={20} className="text-white" />
                          )}
                        </button>
                        <button
                          onClick={pomodoro.reset}
                          className="p-2 transition-all hover:opacity-80"
                          aria-label="Reset timer"
                        >
                          <RotateCcw size={20} className="text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Settings button */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`h-[88px] w-[88px] transition-all duration-300 flex-shrink-0 flex items-center justify-center hover:opacity-80 ${theme.textGlitch ? 'glitch' : ''}`}
                    aria-label="Open settings"
                  >
                    <Settings size={64} className="text-white drop-shadow-lg" />
                  </button>
                </div>

                {/* Todo List */}
                <div className="flex-1">
                  <TodoList />
                </div>
              </div>
            </main>

            {/* System Stability Bar - Fixed at bottom center - Only show for AWS */}
            {dataSource === 'aws' && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <DevModeToggle />
              </div>
            )}

            {/* Footer Credits - Fixed at bottom right */}
            <div className="fixed bottom-4 right-4 z-40">
              <p className="text-white text-opacity-60 text-xs font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Made by{' '}
                <a
                  href="https://www.kanapp.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-opacity-80 hover:text-opacity-100 underline transition-opacity"
                >
                  kanapp.net
                </a>
                {' '}·{' '}
                built with{' '}
                <a
                  href="https://kiro.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-opacity-80 hover:text-opacity-100 underline transition-opacity"
                >
                  KIRO
                </a>
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl transition-all duration-500">
              DevOps Nightmare Dashboard
            </h1>
          </div>
        )}
      </div>
    </>
  );
}
