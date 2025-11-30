import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { OnboardingModal } from './OnboardingModal';
import { SettingsModal } from './SettingsModal';
import { Greeting } from './Greeting';
import { Clock } from './Clock';
import { TodoList } from './TodoList';
import { Weather } from './Weather';
import { BackgroundManager } from './BackgroundManager';
import { HorrorOverlay } from './HorrorOverlay';
import { DevModeToggle } from './DevModeToggle';
import { AudioManager } from './AudioManager';
import { AwsMonitoringPanel } from './aws/AwsMonitoringPanel';
import { StorageService } from '../services/StorageService';

export function Dashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backgroundRefreshKey, setBackgroundRefreshKey] = useState(0);
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0);

  // First-load detection: check if user name exists in storage
  useEffect(() => {
    const storedName = StorageService.getUserName();
    setUserName(storedName);
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
  };

  const handleApiKeySaved = () => {
    // Trigger background and weather refresh by updating the keys
    setBackgroundRefreshKey(prev => prev + 1);
    setWeatherRefreshKey(prev => prev + 1);
  };

  // Show loading state briefly while checking storage
  if (isLoading) {
    return null;
  }

  // Apply theme-based CSS classes
  const dashboardClasses = `
    min-h-screen 
    flex flex-col 
    relative 
    transition-all duration-500 ease-in-out
    ${theme.mode === 'nightmare' ? 'text-red-500' : ''}
    ${theme.mode === 'glitch' ? 'text-gray-300' : ''}
    ${theme.mode === 'peaceful' ? 'text-white' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <>
      {/* Background layer */}
      <BackgroundManager key={backgroundRefreshKey} />
      
      {/* Horror overlay - conditional rendering based on mode */}
      <HorrorOverlay />
      
      {/* Modals */}
      {!userName && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeySaved={handleApiKeySaved}
      />
      

      
      {/* Audio Manager - conditional rendering based on mode */}
      <AudioManager />
      
      {/* Main Dashboard Layout */}
      <div className={dashboardClasses}>
        {userName ? (
          <>
            {/* Three Column Layout */}
            <main className="flex min-h-screen gap-8 px-8 py-8">
              {/* Left Column - AWS Monitoring */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full">
                  <AwsMonitoringPanel />
                </div>
              </div>

              {/* Center Column - Clock and Greeting */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-6">
                  <Clock />
                </div>
                <div>
                  <Greeting />
                </div>
              </div>

              {/* Right Column - Dev Mode, Weather, Settings, and Todo List */}
              <div className="flex-1 flex flex-col">
                {/* Top Controls Row */}
                <div className="flex items-stretch justify-end gap-3 mb-8">
                  {/* Dev Mode Toggle */}
                  <DevModeToggle />
                  
                  {/* Weather - match dev mode height */}
                  <Weather key={weatherRefreshKey} />
                  
                  {/* Settings button - match dev mode height */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-[88px] w-[88px] bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 backdrop-blur-sm flex-shrink-0 flex items-center justify-center"
                    aria-label="Open settings"
                  >
                    <Settings size={32} className="text-white drop-shadow-lg" />
                  </button>
                </div>

                {/* Todo List */}
                <div className="flex-1">
                  <TodoList />
                </div>
              </div>
            </main>
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
