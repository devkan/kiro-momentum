# AWS Integration Setup Guide

## Overview

The DevOps Nightmare Dashboard supports two data sources:
1. **Hacker News** (default) - No configuration needed
2. **AWS Monitoring** - Displays real AWS metrics or mock data

## Data Source Selection

You can switch between data sources in the Settings modal:
- Click the Settings icon (⚙️) in the top right
- Under "Data Source", select either:
  - **Hacker News**: Displays top stories from Hacker News
  - **AWS Monitoring**: Displays AWS infrastructure metrics

## AWS Monitoring Modes

### Mock Data Mode (Default - Currently Only Mode)

⚠️ **IMPORTANT**: Currently, the dashboard **only supports mock data**. Real AWS API integration is not yet implemented.

The mock data simulates:
- EC2 instance statuses
- CloudWatch CPU metrics
- CloudWatch logs
- Cost Explorer data

This is perfect for:
- Testing the dashboard
- Demonstrations
- Development
- Users without AWS accounts

### Real AWS Mode (Coming Soon)

To connect to real AWS services, the following needs to be implemented:

1. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-ce @aws-sdk/client-cloudwatch @aws-sdk/client-cloudwatch-logs @aws-sdk/client-ec2
   ```

2. **Implement API calls** in `src/services/AwsDataService.ts` (see TODO comments)

3. **Provide AWS credentials** (Access Key ID, Secret Access Key, Region)

## AWS Credentials Setup

### Option 1: Settings Modal (Recommended for Testing)

1. Open Settings (⚙️ icon)
2. Select "AWS Monitoring" as your data source
3. Enter your AWS credentials:
   - **AWS Access Key ID**: Your AWS access key (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **AWS Secret Access Key**: Your AWS secret key
   - **AWS Region**: Select your AWS region (e.g., `us-east-1`)
4. Click "Save"

**⚠️ Security Note**: Credentials are stored in browser localStorage. This is suitable for testing but not recommended for production use.

### Option 2: Environment Variables (Recommended for Production)

Create a `.env` file in the project root:

```env
# AWS Credentials
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
VITE_AWS_REGION=us-east-1
```

The application will automatically detect these credentials and use real AWS APIs instead of mock data.

## Required AWS Permissions

Your AWS IAM user/role needs the following permissions:

### Cost Explorer
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

### CloudWatch Metrics
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

### CloudWatch Logs
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:FilterLogEvents",
        "logs:GetLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### EC2 Instance Status
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

### Combined Policy (All Permissions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "logs:FilterLogEvents",
        "logs:GetLogEvents",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

## Creating an IAM User for the Dashboard

1. Go to AWS IAM Console
2. Click "Users" → "Add users"
3. Enter a username (e.g., `devops-dashboard`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Create a custom policy with the permissions above
8. Complete the user creation
9. **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

## Cost Considerations

### AWS Cost Explorer API

⚠️ **IMPORTANT**: The Cost Explorer API is **expensive**!

- **Cost**: $0.01 per API request
- **Default Refresh**: 1 hour in production, 10 seconds in development
- **Recommendation**: Use mock data for testing, real data only when needed

To minimize costs:
1. Use mock data mode (default)
2. Pause cost queries using the "Pause" button in the dashboard
3. Adjust refresh intervals in `src/config/awsConfig.ts`

### Other AWS APIs

- CloudWatch Metrics: Free tier available
- CloudWatch Logs: Free tier available
- EC2 DescribeInstanceStatus: Free

## Refresh Intervals

Default refresh intervals (configured in `src/config/awsConfig.ts`):

| Data Type | Production | Development |
|-----------|-----------|-------------|
| Costs | 1 hour | 10 seconds |
| Metrics | 1 minute | 10 seconds |
| Logs | 30 seconds | 10 seconds |
| Servers | 2 minutes | 10 seconds |

## Troubleshooting

### "Real AWS API not implemented yet" Error

The AWS API integration is currently using mock data. To implement real AWS calls:

1. Install AWS SDK: `npm install @aws-sdk/client-ce @aws-sdk/client-cloudwatch @aws-sdk/client-cloudwatch-logs @aws-sdk/client-ec2`
2. Update `src/services/AwsDataService.ts` to use the AWS SDK
3. Implement the TODO sections for each API call

### Credentials Not Working

1. Verify your AWS Access Key and Secret Key are correct
2. Check that your IAM user has the required permissions
3. Ensure the AWS region is correct
4. Check browser console for error messages

### Mock Data Not Updating

Mock data includes random variations to simulate live updates. If you're not seeing changes:
1. Click the "Refresh All" button
2. Check that the refresh intervals haven't been paused
3. Verify the browser console for errors

## Hacker News Integration

The Hacker News data source requires no configuration:
- Uses the official Hacker News API
- No API key needed
- Updates every 5 minutes
- Displays top, new, or best stories

The "health score" for Hacker News is calculated based on story activity:
- High scores and comment counts = more activity = lower health (more horror)
- This creates an interesting dynamic where popular/controversial stories trigger the horror theme

## Security Best Practices

1. **Never commit credentials** to version control
2. Use environment variables for production
3. Consider using AWS IAM roles instead of access keys
4. Rotate credentials regularly
5. Use least-privilege IAM policies
6. Monitor AWS CloudTrail for API usage

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify AWS credentials and permissions
3. Try mock data mode first to isolate AWS-specific issues
4. Review the AWS CloudTrail logs for API call failures
