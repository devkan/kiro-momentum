import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { StorageService } from '../services/StorageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySaved: () => void;
}

export function SettingsModal({ isOpen, onClose, onApiKeySaved }: SettingsModalProps) {
  const [unsplashKey, setUnsplashKey] = useState('');
  const [weatherKey, setWeatherKey] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing API keys from storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingUnsplashKey = StorageService.getUnsplashKey();
      const existingWeatherKey = StorageService.getWeatherKey();
      setUnsplashKey(existingUnsplashKey || '');
      setWeatherKey(existingWeatherKey || '');
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Trim both keys
    const trimmedUnsplashKey = unsplashKey.trim();
    const trimmedWeatherKey = weatherKey.trim();

    try {
      // Save Unsplash API key if provided
      if (trimmedUnsplashKey) {
        StorageService.setUnsplashKey(trimmedUnsplashKey);
      }
      
      // Save Weather API key if provided
      if (trimmedWeatherKey) {
        StorageService.setWeatherKey(trimmedWeatherKey);
      }
      
      // Show success message
      setSuccessMessage('Settings saved successfully!');
      setError('');
      
      // Trigger background refresh
      onApiKeySaved();
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setSuccessMessage('');
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
    onClose();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close settings"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Settings
        </h2>
        <p className="text-gray-600 mb-6">
          Configure your API keys for background images and weather data.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="unsplashKey" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Unsplash API Key
            </label>
            <input
              id="unsplashKey"
              type="text"
              value={unsplashKey}
              onChange={(e) => {
                setUnsplashKey(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter your Unsplash API key"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              Get your free API key at{' '}
              <a 
                href="https://unsplash.com/developers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                unsplash.com/developers
              </a>
            </p>
          </div>

          <div className="mb-4">
            <label 
              htmlFor="weatherKey" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              OpenWeatherMap API Key
            </label>
            <input
              id="weatherKey"
              type="text"
              value={weatherKey}
              onChange={(e) => {
                setWeatherKey(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter your OpenWeatherMap API key"
            />
            <p className="mt-2 text-xs text-gray-500">
              Get your free API key at{' '}
              <a 
                href="https://openweathermap.org/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openweathermap.org/api
              </a>
            </p>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          {successMessage && (
            <p className="mb-4 text-sm text-green-600">{successMessage}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
