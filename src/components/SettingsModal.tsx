import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySaved: () => void;
}

type SettingsTab = 'general' | 'datasource';

export function SettingsModal({ isOpen, onClose, onApiKeySaved }: SettingsModalProps) {
  const { soundEnabled, setSoundEnabled, reducedMotion, setReducedMotion } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [unsplashKey, setUnsplashKey] = useState('');
  const [weatherKey, setWeatherKey] = useState('');
  const [dataSource, setDataSource] = useState<'aws' | 'hackernews'>('hackernews');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [localReducedMotion, setLocalReducedMotion] = useState(reducedMotion);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing API keys and preferences from storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingUnsplashKey = StorageService.getUnsplashKey();
      const existingWeatherKey = StorageService.getWeatherKey();
      const existingDataSource = StorageService.getDataSource();
      const existingAwsAccessKey = StorageService.getAwsAccessKey();
      const existingAwsSecretKey = StorageService.getAwsSecretKey();
      const existingAwsRegion = StorageService.getAwsRegion();
      
      setUnsplashKey(existingUnsplashKey || '');
      setWeatherKey(existingWeatherKey || '');
      setDataSource(existingDataSource);
      setAwsAccessKey(existingAwsAccessKey || '');
      setAwsSecretKey(existingAwsSecretKey || '');
      setAwsRegion(existingAwsRegion || 'us-east-1');
      setLocalSoundEnabled(soundEnabled);
      setLocalReducedMotion(reducedMotion);
      setActiveTab('general');
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen, soundEnabled, reducedMotion]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Trim all keys
    const trimmedUnsplashKey = unsplashKey.trim();
    const trimmedWeatherKey = weatherKey.trim();
    const trimmedAwsAccessKey = awsAccessKey.trim();
    const trimmedAwsSecretKey = awsSecretKey.trim();
    const trimmedAwsRegion = awsRegion.trim();

    try {
      // Save Unsplash API key if provided
      if (trimmedUnsplashKey) {
        StorageService.setUnsplashKey(trimmedUnsplashKey);
      }
      
      // Save Weather API key if provided
      if (trimmedWeatherKey) {
        StorageService.setWeatherKey(trimmedWeatherKey);
      }
      
      // Save data source preference
      StorageService.setDataSource(dataSource);
      
      // Save AWS credentials if provided and AWS is selected
      if (dataSource === 'aws') {
        if (trimmedAwsAccessKey) {
          StorageService.setAwsAccessKey(trimmedAwsAccessKey);
        }
        if (trimmedAwsSecretKey) {
          StorageService.setAwsSecretKey(trimmedAwsSecretKey);
        }
        if (trimmedAwsRegion) {
          StorageService.setAwsRegion(trimmedAwsRegion);
        }
      }
      
      // Save accessibility preferences
      setSoundEnabled(localSoundEnabled);
      setReducedMotion(localReducedMotion);
      
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="p-8 pb-4 flex-shrink-0">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>

          <h2 id="settings-title" className="text-2xl font-bold text-gray-900 mb-4">
            Settings
          </h2>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('datasource')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'datasource'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Data Source
          </button>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8">
          <form id="settings-form" onSubmit={handleSubmit} className="py-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
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

              <div>
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
            </div>
          )}

          {/* Data Source Tab */}
          {activeTab === 'datasource' && (
            <div className="space-y-4">
                  {/* Data Source Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Data Source</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Select what to display on the left panel
                </p>
                
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="dataSource"
                      value="hackernews"
                      checked={dataSource === 'hackernews'}
                      onChange={(e) => setDataSource(e.target.value as 'hackernews')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Hacker News</span>
                      <p className="text-xs text-gray-500">Display top stories from Hacker News (no API key needed)</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="dataSource"
                      value="aws"
                      checked={dataSource === 'aws'}
                      onChange={(e) => setDataSource(e.target.value as 'aws')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">AWS Monitoring</span>
                      <p className="text-xs text-gray-500">Display AWS metrics (requires AWS credentials or uses mock data)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* AWS Credentials - Only show if AWS is selected */}
              {dataSource === 'aws' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">AWS Credentials (Optional)</h4>
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-1">⚠️ Real AWS Connection Not Yet Implemented</p>
                    <p className="text-xs text-yellow-700">
                      Currently using mock data. To connect to real AWS, the AWS SDK needs to be installed and API calls implemented. 
                      See <code className="bg-yellow-100 px-1 rounded">src/services/AwsDataService.ts</code> for TODO items.
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    You can enter credentials now (they'll be saved), but mock data will be used until real AWS integration is complete.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="awsAccessKey" className="block text-xs font-medium text-gray-700 mb-1">
                        AWS Access Key ID
                      </label>
                      <input
                        id="awsAccessKey"
                        type="text"
                        value={awsAccessKey}
                        onChange={(e) => {
                          setAwsAccessKey(e.target.value);
                          setError('');
                          setSuccessMessage('');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="awsSecretKey" className="block text-xs font-medium text-gray-700 mb-1">
                        AWS Secret Access Key
                      </label>
                      <input
                        id="awsSecretKey"
                        type="password"
                        value={awsSecretKey}
                        onChange={(e) => {
                          setAwsSecretKey(e.target.value);
                          setError('');
                          setSuccessMessage('');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="awsRegion" className="block text-xs font-medium text-gray-700 mb-1">
                        AWS Region
                      </label>
                      <select
                        id="awsRegion"
                        value={awsRegion}
                        onChange={(e) => {
                          setAwsRegion(e.target.value);
                          setError('');
                          setSuccessMessage('');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-east-2">US East (Ohio)</option>
                        <option value="us-west-1">US West (N. California)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">EU (Ireland)</option>
                        <option value="eu-central-1">EU (Frankfurt)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                      </select>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-xs text-gray-500">
                    ⚠️ Note: AWS credentials are stored in browser localStorage. For production use, consider using environment variables or AWS IAM roles.
                  </p>
                </div>
              )}

              {/* Accessibility Settings - Only show for AWS */}
              {dataSource === 'aws' && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Control horror effects for AWS monitoring
                  </p>
                  
                  {/* Sound Effects Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="soundEnabled" className="text-sm font-medium text-gray-700">
                      Enable Sound Effects
                    </label>
                    <input
                      id="soundEnabled"
                      type="checkbox"
                      checked={localSoundEnabled}
                      onChange={(e) => setLocalSoundEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-describedby="soundEnabled-description"
                    />
                  </div>
                  <p id="soundEnabled-description" className="text-xs text-gray-500 mb-4">
                    Play horror sound effects in Nightmare Mode
                  </p>

                  {/* Reduced Motion Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="reducedMotion" className="text-sm font-medium text-gray-700">
                      Reduce Motion
                    </label>
                    <input
                      id="reducedMotion"
                      type="checkbox"
                      checked={localReducedMotion}
                      onChange={(e) => setLocalReducedMotion(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-describedby="reducedMotion-description"
                    />
                  </div>
                  <p id="reducedMotion-description" className="text-xs text-gray-500">
                    Disable glitch animations and visual effects
                  </p>
                </div>
              )}
            </div>
          )}

          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-8 pt-4 flex-shrink-0 border-t border-gray-200">
          {error && (
            <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>
          )}
          {successMessage && (
            <p className="mb-4 text-sm text-green-600" role="status">{successMessage}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              form="settings-form"
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
        </div>
      </div>
    </div>
  );
}
