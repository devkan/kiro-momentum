import { memo } from 'react';
import { DollarSign, Pause, Play } from 'lucide-react';
import { CostSummary } from '../../types/aws';
import { useTheme } from '../../contexts/ThemeContext';
import { AWS_FEATURES } from '../../config/awsConfig';

interface CostSummaryCardProps {
  summary: CostSummary | null;
  loading: boolean;
  paused?: boolean;
  onTogglePause?: () => void;
  lastUpdated?: Date | null;
}

export const CostSummaryCard = memo(function CostSummaryCard({
  summary,
  loading,
  paused = false,
  onTogglePause,
  lastUpdated,
}: CostSummaryCardProps) {
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

  const formatCost = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const showLoading = loading || !summary;

  return (
    <div
      className={`p-4 rounded-xl backdrop-blur-md border-2 ${cardBgClass} ${textColorClass} shadow-lg transition-all duration-500 ${glitchClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign size={20} />
          <h3 className="text-lg font-semibold">Today's Cost</h3>
        </div>
        {AWS_FEATURES.allowPauseCostQueries && onTogglePause && (
          <button
            onClick={onTogglePause}
            className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            title={paused ? 'Resume updates' : 'Pause updates (saves API costs)'}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>

      {showLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-white bg-opacity-20 rounded"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-4xl font-bold transition-all duration-500">
              ${formatCost(summary!.today)}
            </div>
            <div className="text-xs opacity-70 mt-1">{summary!.currency}</div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-70">EC2</span>
              <span className="font-semibold transition-all duration-300">${formatCost(summary!.ec2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-70">RDS</span>
              <span className="font-semibold transition-all duration-300">${formatCost(summary!.rds)}</span>
            </div>
          </div>

          {lastUpdated && (
            <div className="pt-2 mt-2 border-t border-white border-opacity-20 text-xs opacity-50 text-center transition-opacity duration-300">
              Updated {formatLastUpdated(lastUpdated)}
            </div>
          )}

          {paused && (
            <div className="text-xs text-center text-yellow-400 opacity-80">
              ⏸ Updates paused
            </div>
          )}
        </div>
      )}
    </div>
  );
});
