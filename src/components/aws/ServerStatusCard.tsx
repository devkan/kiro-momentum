import { memo } from 'react';
import { Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ServerStatusSummary } from '../../types/aws';
import { useTheme } from '../../contexts/ThemeContext';

interface ServerStatusCardProps {
  summary: ServerStatusSummary | null;
  loading: boolean;
}

export const ServerStatusCard = memo(function ServerStatusCard({ summary, loading }: ServerStatusCardProps) {
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

  const showLoading = loading || !summary;

  return (
    <div
      className={`p-4 rounded-xl backdrop-blur-md border-2 ${cardBgClass} ${textColorClass} shadow-lg transition-all duration-500 ${glitchClass}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Server size={20} />
        <h3 className="text-lg font-semibold">Server Status</h3>
      </div>

      {showLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-white bg-opacity-20 rounded"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded"></div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm">Healthy</span>
            </div>
            <span className="text-xl font-bold transition-all duration-300">{summary!.healthy}</span>
          </div>

          {summary!.impaired > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                <span className="text-sm">Impaired</span>
              </div>
              <span className="text-xl font-bold text-yellow-400 transition-all duration-300">{summary!.impaired}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-gray-400" />
              <span className="text-sm">Stopped</span>
            </div>
            <span className="text-xl font-bold transition-all duration-300">{summary!.stopped}</span>
          </div>

          <div className="pt-2 mt-2 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>Total Instances</span>
              <span className="transition-all duration-300">{summary!.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
