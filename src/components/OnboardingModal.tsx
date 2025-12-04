import { useState, FormEvent, useEffect } from 'react';
import { StorageService } from '../services/StorageService';
import { sanitizeInput } from '../utils/security';

interface OnboardingModalProps {
  onComplete: (name: string) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Handle Escape key (though we don't allow closing this modal)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Prevent closing - user must provide name
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Sanitize and validate name
    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName) {
      setError('Please enter your name');
      return;
    }

    try {
      // Save name to LocalStorage (already sanitized in StorageService)
      StorageService.setUserName(sanitizedName);
      
      // Call completion callback with sanitized name
      onComplete(sanitizedName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save name');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 id="onboarding-title" className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to DevOps Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Let's get started by personalizing your experience.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What's your name?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error when user types
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter your name"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
