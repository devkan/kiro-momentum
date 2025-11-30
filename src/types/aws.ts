// AWS Data Types

export interface AwsCostData {
  ResultsByTime: Array<{
    TimePeriod: {
      Start: string;
      End: string;
    };
    Groups: Array<{
      Keys: string[];
      Metrics: {
        UnblendedCost: {
          Amount: string;
          Unit: string;
        };
      };
    }>;
    Estimated: boolean;
  }>;
}

export interface AwsLogEvent {
  timestamp: number;
  message: string;
  ingestionTime: number;
}

export interface AwsLogsData {
  events: AwsLogEvent[];
}

export interface AwsMetricDataPoint {
  timestamp: string;
  value: number;
}

export interface AwsMetricsData {
  MetricDataResults: Array<{
    Id: string;
    Label: string;
    Timestamps: string[];
    Values: number[];
    StatusCode: string;
  }>;
}

export interface AwsInstanceStatus {
  InstanceId: string;
  InstanceState: {
    Code: number;
    Name: 'running' | 'stopped' | 'pending' | 'stopping' | 'terminated';
  };
  InstanceStatus: {
    Status: 'ok' | 'impaired' | 'insufficient-data' | 'not-applicable';
    Details: any[];
  };
  SystemStatus: {
    Status: 'ok' | 'impaired' | 'insufficient-data' | 'not-applicable';
    Details: any[];
  };
}

export interface AwsServerStatusData {
  InstanceStatuses: AwsInstanceStatus[];
}

// Processed/Summary types for UI
export interface ServerStatusSummary {
  total: number;
  running: number;
  stopped: number;
  impaired: number;
  healthy: number;
}

export interface CostSummary {
  today: number;
  ec2: number;
  rds: number;
  currency: string;
}

export interface LogSummary {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  recentLogs: AwsLogEvent[];
}

export interface MetricsSummary {
  current: number;
  average: number;
  max: number;
  min: number;
  dataPoints: Array<{ timestamp: string; value: number }>;
}
