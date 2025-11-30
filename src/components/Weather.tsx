import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../services/StorageService';

interface WeatherData {
  temperature: number;
  icon: string;
  description: string;
}

interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export function Weather() {
  const { theme } = useTheme();
  const [weatherState, setWeatherState] = useState<WeatherState>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for storage changes to refresh weather when API key is updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devops_dashboard_weather_key') {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Request geolocation on mount
    if (!navigator.geolocation) {
      setWeatherState({
        data: null,
        isLoading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get API key from storage or environment variable
        const apiKey = StorageService.getWeatherKey() || import.meta.env.VITE_OPENWEATHER_API_KEY || '';
        
        if (!apiKey) {
          setWeatherState({
            data: null,
            isLoading: false,
            error: 'API key required - configure in settings',
          });
          return;
        }
        
        try {
          // Fetch weather data from OpenWeatherMap API
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
          );

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Invalid API key');
            }
            throw new Error('Weather API request failed');
          }

          const data = await response.json();
          
          setWeatherState({
            data: {
              temperature: Math.round(data.main.temp),
              icon: data.weather[0].icon,
              description: data.weather[0].description,
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Handle API failures gracefully
          console.error('Weather API error:', error);
          setWeatherState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unable to fetch weather',
          });
        }
      },
      // Error callback - handle geolocation denial
      (error) => {
        console.error('Geolocation error:', error);
        setWeatherState({
          data: null,
          isLoading: false,
          error: 'Location access denied',
        });
      }
    );
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Get appropriate weather icon based on OpenWeatherMap icon code
  const getWeatherIcon = (iconCode: string) => {
    const code = iconCode.substring(0, 2);
    
    switch (code) {
      case '01': // clear sky
        return <Sun className="w-10 h-10" />;
      case '02': // few clouds
      case '03': // scattered clouds
      case '04': // broken clouds
        return <Cloud className="w-10 h-10" />;
      case '09': // shower rain
      case '10': // rain
        return <CloudRain className="w-10 h-10" />;
      case '13': // snow
        return <CloudSnow className="w-10 h-10" />;
      case '50': // mist
        return <Wind className="w-10 h-10" />;
      default:
        return <Cloud className="w-10 h-10" />;
    }
  };

  // Apply theme-based styling
  const cardBgClass = theme.mode === 'nightmare' 
    ? 'bg-red-900 bg-opacity-20 border-red-500' 
    : theme.mode === 'glitch' 
    ? 'bg-gray-800 bg-opacity-30 border-gray-500' 
    : 'bg-white bg-opacity-20 border-white';
  
  const textColorClass = theme.mode === 'nightmare' ? 'text-red-400' : 
                         theme.mode === 'glitch' ? 'text-gray-200' : 'text-white';
  
  const glitchClass = theme.textGlitch ? 'animate-glitch' : '';

  // Loading state
  if (weatherState.isLoading) {
    return (
      <div className={`p-3 rounded-xl backdrop-blur-md bg-white bg-opacity-10 ${textColorClass} shadow-lg transition-all duration-500 h-[88px] flex items-center`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 animate-pulse bg-gray-300 bg-opacity-30 rounded-full"></div>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Error or geolocation denied state
  if (weatherState.error || !weatherState.data) {
    return (
      <div className={`p-3 rounded-xl backdrop-blur-md bg-white bg-opacity-10 ${textColorClass} shadow-lg transition-all duration-500 h-[88px] flex items-center`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 opacity-70" />
          <span className="text-sm font-medium">Weather N/A</span>
        </div>
      </div>
    );
  }

  // Display weather data - compact horizontal layout matching dev mode height
  return (
    <div className={`p-3 px-4 rounded-xl backdrop-blur-md bg-white bg-opacity-10 ${textColorClass} shadow-lg transition-all duration-500 ${glitchClass} h-[88px] flex items-center`}>
      <div className="flex items-center gap-3">
        <div className="opacity-90 scale-75">
          {getWeatherIcon(weatherState.data.icon)}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight drop-shadow-lg">
            {weatherState.data.temperature}°
          </span>
          <span className="text-xs capitalize font-medium opacity-80">
            {weatherState.data.description}
          </span>
        </div>
      </div>
    </div>
  );
}
