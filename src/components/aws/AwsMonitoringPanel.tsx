import { useState, useEffect, useCallback, memo } from 'react';
import { useAwsMonitoring } from '../../hooks/useAwsData';
import { useTheme } from '../../contexts/ThemeContext';
import { ServerStatusCard } from './ServerStatusCard';
import { CpuMetricsCard } from './CpuMetricsCard';
import { CostSummaryCard } from './CostSummaryCard';
import { LogStreamViewer } from './LogStreamViewer';
import { Cloud, RefreshCw } from 'lucide-react';
import { USE_MOCK_DATA } from '../../config/awsConfig';

export const AwsMonitoringPanel = memo(function AwsMonitoringPanel() {
  const { setHealthStatus } = useTheme();
  const [costsPaused, setCostsPaused] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Fetch all AWS data with custom hooks
  const {
    costs,
    logs,
    metrics,
    servers,
    healthScore,
    isLoading,
  } = useAwsMonitoring(!costsPaused);

  // Track when we have initial data
  useEffect(() => {
    if (!hasInitialData && (costs.summary || logs.summary || metrics.summary || servers.summary)) {
      setHasInitialData(true);
    }
  }, [costs.summary, logs.summary, metrics.summary, servers.summary, hasInitialData]);

  // Update theme health status based on AWS metrics
  useEffect(() => {
    if (healthScore !== undefined) {
      setHealthStatus(healthScore);
    }
  }, [healthScore, setHealthStatus]);

  const handleRefreshAll = useCallback(() => {
    costs.refetch();
    logs.refetch();
    metrics.refetch();
    servers.refetch();
  }, [costs.refetch, logs.refetch, metrics.refetch, servers.refetch]);

  const handleTogglePause = useCallback(() => {
    setCostsPaused(prev => !prev);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-8 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cloud size={24} className="text-white" />
          <h2 className="text-2xl font-bold text-white tracking-wider">
            AWS MONITORING
          </h2>
          {USE_MOCK_DATA && (
            <span className="text-xs bg-blue-500 bg-opacity-30 text-blue-200 px-2 py-1 rounded">
              Mock Data
            </span>
          )}
        </div>
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-all"
          disabled={isLoading}
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          <span className="text-base font-semibold">Refresh All</span>
        </button>
      </div>

      {/* Health Score Indicator */}
      <div className="mb-6 p-5 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border-2 border-white border-opacity-20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-white text-lg font-bold tracking-wider">SYSTEM HEALTH SCORE</span>
          <div className="flex items-center gap-4">
            <div className="w-64 h-3 bg-black bg-opacity-30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  healthScore >= 80
                    ? 'bg-green-500'
                    : healthScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <span className="text-white text-2xl font-bold w-16 text-right transition-all duration-300">
              {healthScore}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ServerStatusCard summary={servers.summary} loading={!hasInitialData && servers.loading} />
        <CpuMetricsCard summary={metrics.summary} loading={!hasInitialData && metrics.loading} />
        <CostSummaryCard
          summary={costs.summary}
          loading={!hasInitialData && costs.loading}
          paused={costsPaused}
          onTogglePause={handleTogglePause}
          lastUpdated={costs.lastUpdated}
        />
      </div>

      {/* Logs Viewer */}
      <div className="w-full">
        <LogStreamViewer summary={logs.summary} loading={!hasInitialData && logs.loading} />
      </div>
    </div>
  );
});
