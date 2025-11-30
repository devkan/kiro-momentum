import { memo } from 'react';
import { Activity } from 'lucide-react';
import { MetricsSummary } from '../../types/aws';
import { useTheme } from '../../contexts/ThemeContext';

interface CpuMetricsCardProps {
  summary: MetricsSummary | null;
  loading: boolean;
}

export const CpuMetricsCard = memo(function CpuMetricsCard({ summary, loading }: CpuMetricsCardProps) {
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

  // Determine color based on CPU usage
  const getCpuColor = (value: number) => {
    if (value >= 90) return 'text-red-500';
    if (value >= 75) return 'text-yellow-500';
    return 'text-green-400';
  };

  // Simple sparkline visualization
  const renderSparkline = () => {
    if (!summary) return null;
    const recentValues = summary.dataPoints.slice(-20).map((dp) => dp.value);
    const max = Math.max(...recentValues);
    const min = Math.min(...recentValues);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-0.5 h-8">
        {recentValues.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-current opacity-70 rounded-t transition-all duration-300"
              style={{ height: `${height}%`, minHeight: '2px' }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`p-4 rounded-xl backdrop-blur-md border-2 ${cardBgClass} ${textColorClass} shadow-lg transition-all duration-500 ${glitchClass}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity size={20} />
        <h3 className="text-lg font-semibold">CPU Usage</h3>
      </div>

      {showLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-white bg-opacity-20 rounded"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-4xl font-bold transition-all duration-500 ${getCpuColor(summary!.current)}`}>
              {summary!.current}%
            </div>
            <div className="text-xs opacity-70 mt-1">Current</div>
          </div>

          <div className={`transition-colors duration-500 ${getCpuColor(summary!.current)}`}>{renderSparkline()}</div>

          <div className="grid grid-cols-3 gap-2 text-xs opacity-70">
            <div className="text-center">
              <div className="font-semibold transition-all duration-300">{summary!.average}%</div>
              <div>Avg</div>
            </div>
            <div className="text-center">
              <div className="font-semibold transition-all duration-300">{summary!.max}%</div>
              <div>Max</div>
            </div>
            <div className="text-center">
              <div className="font-semibold transition-all duration-300">{summary!.min}%</div>
              <div>Min</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
