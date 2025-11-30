// AWS Configuration

// Determine if we're in production mode
const isProduction = import.meta.env.PROD;

// Check if real AWS credentials are configured
const hasAwsCredentials = Boolean(
  import.meta.env.VITE_AWS_ACCESS_KEY_ID &&
  import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
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
