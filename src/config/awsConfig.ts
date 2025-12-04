// AWS Configuration

// Determine if we're in production mode
const isProduction = import.meta.env.PROD;

// Helper to check localStorage credentials
const getStoredAwsCredentials = () => {
  try {
    const accessKey = localStorage.getItem('devops_dashboard_aws_access_key');
    const secretKey = localStorage.getItem('devops_dashboard_aws_secret_key');
    return Boolean(accessKey && secretKey);
  } catch {
    return false;
  }
};

// Check if real AWS credentials are configured (either env vars or localStorage)
const hasAwsCredentials = Boolean(
  (import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) ||
  getStoredAwsCredentials()
);

/**
 * Refresh intervals for AWS data polling
 * 
 * IMPORTANT: Billing/Cost data is expensive to query!
 * - Test: 10 seconds for rapid testing
 * - Production: 1 hour to minimize AWS Cost Explorer API charges
 */
export const AWS_REFRESH_INTERVALS = {
  // Cost data - VERY EXPENSIVE, query sparingly
  costs: isProduction ? 3600000 : 10000,        // 1 hour : 10 seconds
  
  // Metrics data - moderate cost
  metrics: isProduction ? 60000 : 10000,        // 1 minute : 10 seconds
  
  // Logs data - needs frequent updates
  logs: isProduction ? 30000 : 10000,           // 30 seconds : 10 seconds
  
  // Server status - moderate frequency
  servers: isProduction ? 120000 : 10000,       // 2 minutes : 10 seconds
} as const;

/**
 * Use mock data if no AWS credentials are configured
 */
export const USE_MOCK_DATA = !hasAwsCredentials;

/**
 * Get AWS credentials from environment variables or localStorage
 */
export const getAwsCredentials = () => {
  // Try environment variables first
  if (import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    };
  }

  // Try localStorage
  try {
    const accessKeyId = localStorage.getItem('devops_dashboard_aws_access_key');
    const secretAccessKey = localStorage.getItem('devops_dashboard_aws_secret_key');
    const region = localStorage.getItem('devops_dashboard_aws_region') || 'us-east-1';

    if (accessKeyId && secretAccessKey) {
      return { accessKeyId, secretAccessKey, region };
    }
  } catch {
    // localStorage not available
  }

  return null;
};

/**
 * AWS Region configuration
 */
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

/**
 * Feature flags
 */
export const AWS_FEATURES = {
  enableCostMonitoring: true,
  enableMetricsMonitoring: true,
  enableLogsMonitoring: true,
  enableServerMonitoring: true,
  
  // Allow users to pause expensive queries
  allowPauseCostQueries: true,
} as const;

/**
 * Display configuration
 */
export const AWS_DISPLAY_CONFIG = {
  maxLogsToShow: 10,
  maxMetricDataPoints: 50,
  costDecimalPlaces: 2,
  metricDecimalPlaces: 1,
} as const;
