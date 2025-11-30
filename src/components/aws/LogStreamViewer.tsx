import { memo } from 'react';
import { FileText, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { LogSummary } from '../../types/aws';
import { useTheme } from '../../contexts/ThemeContext';
import { AWS_DISPLAY_CONFIG } from '../../config/awsConfig';

interface LogStreamViewerProps {
  summary: LogSummary | null;
  loading: boolean;
}

export const LogStreamViewer = memo(function LogStreamViewer({ summary, loading }: LogStreamViewerProps) {
  const { theme } = useTheme();

  const cardBgClass =
    theme.mode === 'nightmare'
      ? 'bg-red-900 bg-opacity-20 border-red-500'
      : theme.mode === 'glitch'
      ? 'bg-gray-800 bg-opacity-30 border-gray-500'
      : 'bg-white bg-opacity-20 border-white';

  const textColorClass =
    theme.mode === 'nightmare'
      ? 'text-red-400'
      : theme.mode === 'glitch'
      ? 'text-gray-200'
      : 'text-white';

  const glitchClass = theme.textGlitch ? 'animate-glitch' : '';

  const getLogIcon = (message: string) => {
    if (message.includes('[ERROR]')) {
      return <AlertCircle size={14} className="text-red-500 flex-shrink-0" />;
    }
    if (message.includes('[WARN]')) {
      return <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />;
    }
    return <Info size={14} className="text-blue-400 flex-shrink-0" />;
  };

  const getLogColor = (message: string) => {
    if (message.includes('[ERROR]')) return 'text-red-400';
    if (message.includes('[WARN]')) return 'text-yellow-400';
    return 'text-gray-300';
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateMessage = (message: string, maxLength: number = 80) => {
    // Remove log level prefix for display
    const cleanMessage = message.replace(/^\[(INFO|WARN|ERROR)\]\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
    
    if (cleanMessage.length <= maxLength) return cleanMessage;
    return cleanMessage.substring(0, maxLength) + '...';
  };

  const showLoading = loading || !summary;

  return (
    <div
      className={`p-4 rounded-xl backdrop-blur-md border-2 ${cardBgClass} ${textColorClass} shadow-lg transition-all duration-500 ${glitchClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} />
          <h3 className="text-lg font-semibold">Recent Logs</h3>
        </div>
        {!showLoading && (
          <div className="flex items-center gap-3 text-xs transition-opacity duration-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {summary!.errors}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {summary!.warnings}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {summary!.info}
            </span>
          </div>
        )}
      </div>

      {showLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
            {summary!.recentLogs.slice(0, AWS_DISPLAY_CONFIG.maxLogsToShow).map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className="flex items-start gap-2 p-2 rounded bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {getLogIcon(log.message)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs opacity-60 mb-0.5">
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <div className={`text-[14pt] font-mono ${getLogColor(log.message)}`}>
                    {truncateMessage(log.message)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {summary!.recentLogs.length === 0 && (
            <div className="text-center text-sm opacity-50 py-8">
              No recent logs available
            </div>
          )}
        </>
      )}
    </div>
  );
});
