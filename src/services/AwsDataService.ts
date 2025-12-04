import {
  AwsCostData,
  AwsLogsData,
  AwsMetricsData,
  AwsServerStatusData,
  ServerStatusSummary,
  CostSummary,
  LogSummary,
  MetricsSummary,
} from '../types/aws';
import { USE_MOCK_DATA } from '../config/awsConfig';

// Import mock data
import mockCosts from '../data/aws_costs.json';
import mockLogs from '../data/aws_logs.json';
import mockMetrics from '../data/aws_metrics.json';
import mockServers from '../data/aws_server_status.json';

/**
 * AWS Data Service
 * 
 * Handles fetching AWS data from either:
 * - Mock JSON files (for development/testing)
 * - Real AWS APIs (when credentials are configured)
 */
export class AwsDataService {
  /**
   * Fetch AWS cost data
   */
  static async fetchCosts(): Promise<AwsCostData> {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await this.simulateDelay(300);
      
      // Add small variation to costs to demonstrate live updates
      const data = JSON.parse(JSON.stringify(mockCosts)) as AwsCostData;
      const variation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
      
      data.ResultsByTime.forEach(result => {
        result.Groups.forEach(group => {
          const currentAmount = parseFloat(group.Metrics.UnblendedCost.Amount);
          group.Metrics.UnblendedCost.Amount = (currentAmount * variation).toFixed(2);
        });
      });
      
      return data;
    }

    // TODO: Implement real AWS Cost Explorer API call
    // const response = await fetch('/api/aws/costs');
    // return response.json();
    throw new Error('Real AWS API not implemented yet');
  }

  /**
   * Fetch AWS CloudWatch logs
   */
  static async fetchLogs(): Promise<AwsLogsData> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(200);
      
      // Add a new log entry occasionally (20% chance) to demonstrate live updates
      const data = JSON.parse(JSON.stringify(mockLogs)) as AwsLogsData;
      
      if (Math.random() < 0.2) {
        const logLevels = ['[INFO]', '[WARN]', '[ERROR]'];
        const messages = [
          'Database connection pool size adjusted',
          'Cache hit ratio: 94%',
          'API response time: 145ms',
          'Memory usage: 78%',
          'Request queue length: 12',
        ];
        
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        
        data.events.push({
          timestamp: Date.now(),
          ingestionTime: Date.now(),
          message: `${level} ${timestamp} ${message}`,
        });
        
        // Keep only last 20 logs
        if (data.events.length > 20) {
          data.events = data.events.slice(-20);
        }
      }
      
      return data;
    }

    // TODO: Implement real AWS CloudWatch Logs API call
    throw new Error('Real AWS API not implemented yet');
  }

  /**
   * Fetch AWS CloudWatch metrics
   */
  static async fetchMetrics(): Promise<AwsMetricsData> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(250);
      
      // Add some variation to demonstrate live updates
      const data = JSON.parse(JSON.stringify(mockMetrics)) as AwsMetricsData;
      const variation = (Math.random() - 0.5) * 10; // ±5% variation
      
      data.MetricDataResults[0].Values = data.MetricDataResults[0].Values.map(
        val => Math.max(0, Math.min(100, val + variation))
      );
      
      return data;
    }

    // TODO: Implement real AWS CloudWatch Metrics API call
    throw new Error('Real AWS API not implemented yet');
  }

  /**
   * Fetch AWS EC2 instance statuses
   */
  static async fetchServerStatus(): Promise<AwsServerStatusData> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(300);
      
      // Add some variation to demonstrate live updates
      const data = JSON.parse(JSON.stringify(mockServers)) as AwsServerStatusData;
      
      // Randomly change one server's state occasionally (10% chance)
      if (Math.random() < 0.1 && data.InstanceStatuses.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.InstanceStatuses.length);
        const states: Array<'running' | 'stopped'> = ['running', 'stopped'];
        data.InstanceStatuses[randomIndex].InstanceState.Name = 
          states[Math.floor(Math.random() * states.length)];
      }
      
      return data;
    }

    // TODO: Implement real AWS EC2 DescribeInstanceStatus API call
    throw new Error('Real AWS API not implemented yet');
  }

  /**
   * Process cost data into summary
   */
  static processCostData(data: AwsCostData): CostSummary {
    // Get the most recent day's data
    const latestDay = data.ResultsByTime[data.ResultsByTime.length - 1];
    
    if (!latestDay) {
      return { today: 0, ec2: 0, rds: 0, currency: 'USD' };
    }

    let ec2Cost = 0;
    let rdsCost = 0;

    latestDay.Groups.forEach((group) => {
      const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
      const serviceName = group.Keys[0];

      if (serviceName.includes('Elastic Compute Cloud')) {
        ec2Cost += amount;
      } else if (serviceName.includes('Relational Database')) {
        rdsCost += amount;
      }
    });

    return {
      today: ec2Cost + rdsCost,
      ec2: ec2Cost,
      rds: rdsCost,
      currency: latestDay.Groups[0]?.Metrics.UnblendedCost.Unit || 'USD',
    };
  }

  /**
   * Process server status data into summary
   */
  static processServerStatus(data: AwsServerStatusData): ServerStatusSummary {
    const summary: ServerStatusSummary = {
      total: data.InstanceStatuses.length,
      running: 0,
      stopped: 0,
      impaired: 0,
      healthy: 0,
    };

    data.InstanceStatuses.forEach((instance) => {
      // Count by state
      if (instance.InstanceState.Name === 'running') {
        summary.running++;
      } else if (instance.InstanceState.Name === 'stopped') {
        summary.stopped++;
      }

      // Count impaired instances
      if (
        instance.InstanceStatus.Status === 'impaired' ||
        instance.SystemStatus.Status === 'impaired'
      ) {
        summary.impaired++;
      }

      // Count healthy running instances
      if (
        instance.InstanceState.Name === 'running' &&
        instance.InstanceStatus.Status === 'ok' &&
        instance.SystemStatus.Status === 'ok'
      ) {
        summary.healthy++;
      }
    });

    return summary;
  }

  /**
   * Process logs data into summary
   */
  static processLogs(data: AwsLogsData): LogSummary {
    const summary: LogSummary = {
      total: data.events.length,
      errors: 0,
      warnings: 0,
      info: 0,
      recentLogs: [],
    };

    data.events.forEach((event) => {
      if (event.message.includes('[ERROR]')) {
        summary.errors++;
      } else if (event.message.includes('[WARN]')) {
        summary.warnings++;
      } else if (event.message.includes('[INFO]')) {
        summary.info++;
      }
    });

    // Get most recent 10 logs (already sorted by timestamp in mock data)
    summary.recentLogs = data.events.slice(-10).reverse();

    return summary;
  }

  /**
   * Process metrics data into summary
   */
  static processMetrics(data: AwsMetricsData): MetricsSummary {
    const cpuData = data.MetricDataResults[0];
    
    if (!cpuData || cpuData.Values.length === 0) {
      return {
        current: 0,
        average: 0,
        max: 0,
        min: 0,
        dataPoints: [],
      };
    }

    const values = cpuData.Values;
    const current = values[values.length - 1];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Create data points for charting (last 50 points)
    const dataPoints = cpuData.Timestamps.slice(-50).map((timestamp, index) => ({
      timestamp,
      value: cpuData.Values.slice(-50)[index],
    }));

    return {
      current: Math.round(current * 10) / 10,
      average: Math.round(average * 10) / 10,
      max: Math.round(max * 10) / 10,
      min: Math.round(min * 10) / 10,
      dataPoints,
    };
  }

  /**
   * Calculate overall health score (0-100)
   * Used to drive the horror theme
   */
  static calculateHealthScore(
    servers: ServerStatusSummary,
    logs: LogSummary,
    metrics: MetricsSummary
  ): number {
    let score = 100;

    // Deduct for impaired servers (up to -30 points)
    if (servers.total > 0) {
      const impairedRatio = servers.impaired / servers.total;
      score -= impairedRatio * 30;
    }

    // Deduct for error logs (up to -30 points)
    if (logs.total > 0) {
      const errorRatio = logs.errors / logs.total;
      score -= errorRatio * 30;
    }

    // Deduct for high CPU usage (up to -40 points)
    if (metrics.current > 80) {
      score -= (metrics.current - 80) * 2; // 2 points per % over 80
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Simulate network delay for mock data
   */
  private static simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
