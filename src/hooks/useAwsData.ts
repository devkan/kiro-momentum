import { useMemo } from 'react';
import { usePolling, UsePollingResult } from './usePolling';
import { AwsDataService } from '../services/AwsDataService';
import { AWS_REFRESH_INTERVALS } from '../config/awsConfig';
import {
  AwsCostData,
  AwsLogsData,
  AwsMetricsData,
  AwsServerStatusData,
  CostSummary,
  LogSummary,
  MetricsSummary,
  ServerStatusSummary,
} from '../types/aws';

/**
 * Hook for fetching and processing AWS cost data
 */
export function useAwsCosts(enabled: boolean = true) {
  const { data, loading, error, refetch, lastUpdated } = usePolling<AwsCostData>(
    () => AwsDataService.fetchCosts(),
    AWS_REFRESH_INTERVALS.costs,
    { enabled, immediate: true }
  );

  const summary = useMemo<CostSummary | null>(() => {
    if (!data) return null;
    return AwsDataService.processCostData(data);
  }, [data]);

  return {
    data,
    summary,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}

/**
 * Hook for fetching and processing AWS CloudWatch logs
 */
export function useAwsLogs(enabled: boolean = true) {
  const { data, loading, error, refetch, lastUpdated } = usePolling<AwsLogsData>(
    () => AwsDataService.fetchLogs(),
    AWS_REFRESH_INTERVALS.logs,
    { enabled, immediate: true }
  );

  const summary = useMemo<LogSummary | null>(() => {
    if (!data) return null;
    return AwsDataService.processLogs(data);
  }, [data]);

  return {
    data,
    summary,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}

/**
 * Hook for fetching and processing AWS CloudWatch metrics
 */
export function useAwsMetrics(enabled: boolean = true) {
  const { data, loading, error, refetch, lastUpdated } = usePolling<AwsMetricsData>(
    () => AwsDataService.fetchMetrics(),
    AWS_REFRESH_INTERVALS.metrics,
    { enabled, immediate: true }
  );

  const summary = useMemo<MetricsSummary | null>(() => {
    if (!data) return null;
    return AwsDataService.processMetrics(data);
  }, [data]);

  return {
    data,
    summary,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}

/**
 * Hook for fetching and processing AWS EC2 server status
 */
export function useAwsServerStatus(enabled: boolean = true) {
  const { data, loading, error, refetch, lastUpdated } = usePolling<AwsServerStatusData>(
    () => AwsDataService.fetchServerStatus(),
    AWS_REFRESH_INTERVALS.servers,
    { enabled, immediate: true }
  );

  const summary = useMemo<ServerStatusSummary | null>(() => {
    if (!data) return null;
    return AwsDataService.processServerStatus(data);
  }, [data]);

  return {
    data,
    summary,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}

/**
 * Combined hook that fetches all AWS data and calculates health score
 */
export function useAwsMonitoring(enabled: boolean = true) {
  const costs = useAwsCosts(enabled);
  const logs = useAwsLogs(enabled);
  const metrics = useAwsMetrics(enabled);
  const servers = useAwsServerStatus(enabled);

  // Calculate overall health score
  const healthScore = useMemo(() => {
    if (!servers.summary || !logs.summary || !metrics.summary) {
      return 100; // Default to healthy if no data
    }

    return AwsDataService.calculateHealthScore(
      servers.summary,
      logs.summary,
      metrics.summary
    );
  }, [servers.summary, logs.summary, metrics.summary]);

  const isLoading = costs.loading || logs.loading || metrics.loading || servers.loading;
  const hasError = Boolean(costs.error || logs.error || metrics.error || servers.error);

  return {
    costs,
    logs,
    metrics,
    servers,
    healthScore,
    isLoading,
    hasError,
  };
}
