import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PomodoroConfig } from '../types';
import { StorageService } from '../services/StorageService';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: PomodoroConfig) => void;
}

export function PomodoroModal({ isOpen, onClose, onStart }: PomodoroModalProps) {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [errors, setErrors] = useState<{ work?: string; break?: string }>({});

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = StorageService.getPomodoroConfig();
    if (savedConfig) {
      setWorkDuration(savedConfig.workDuration);
      setBreakDuration(savedConfig.breakDuration);
      setAutoRepeat(savedConfig.autoRepeat);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: { work?: string; break?: string } = {};

    if (workDuration < 1 || workDuration > 60) {
      newErrors.work = 'Work duration must be between 1 and 60 minutes';
    }

    if (breakDuration < 1 || breakDuration > 30) {
      newErrors.break = 'Break duration must be between 1 and 30 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (!validate()) return;

    const config: PomodoroConfig = {
      workDuration,
      breakDuration,
      autoRepeat,
    };

    onStart(config);
    onClose();
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-title"
    >
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border-2 border-white border-opacity-20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <h2 id="pomodoro-title" className="text-2xl font-bold text-white">Pomodoro Timer</h2>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Work Duration */}
          <div>
            <label htmlFor="work-duration" className="block text-white text-sm font-medium mb-2">
              Work Duration (minutes)
            </label>
            <input
              id="work-duration"
              type="number"
              min="1"
              max="60"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border-2 border-white border-opacity-20 rounded-lg text-white text-lg focus:outline-none focus:border-opacity-40 transition-all"
            />
            {errors.work && (
              <p className="text-red-400 text-sm mt-1">{errors.work}</p>
            )}
          </div>

          {/* Break Duration */}
          <div>
            <label htmlFor="break-duration" className="block text-white text-sm font-medium mb-2">
              Break Duration (minutes)
            </label>
            <input
              id="break-duration"
              type="number"
              min="1"
              max="30"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border-2 border-white border-opacity-20 rounded-lg text-white text-lg focus:outline-none focus:border-opacity-40 transition-all"
            />
            {errors.break && (
              <p className="text-red-400 text-sm mt-1">{errors.break}</p>
            )}
          </div>

          {/* Auto-repeat */}
          <div className="flex items-center gap-3">
            <input
              id="auto-repeat"
              type="checkbox"
              checked={autoRepeat}
              onChange={(e) => setAutoRepeat(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white border-opacity-40 bg-white bg-opacity-10 checked:bg-white checked:bg-opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40"
            />
            <label htmlFor="auto-repeat" className="text-white text-sm font-medium cursor-pointer">
              Auto-repeat (automatically start next phase)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white border-opacity-10">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all"
          >
            Start Timer
          </button>
        </div>
      </div>
    </div>
  );
}
