# NEAR Protocol Rewards SDK Integration Rules

## Core Implementation Requirements

### 1. SDK Configuration

Reference the core configuration interface from:

```typescript:implementation.md
startLine: 12
endLine: 19
```

### 2. Event System Integration

The dashboard must implement these event listeners as defined in:

```typescript:docs/integration-guide.md
startLine: 76
endLine: 83
```

### 3. Metrics Processing

Dashboard components should expect metrics in this format:

```typescript
interface ProcessedMetrics {
  repositoryId: string;
  timeframe: 'day' | 'week' | 'month';
  contributors: {
    contributorId: string;
    metrics: {
      commits: number;
      pullRequests: {
        opened: number;
        merged: number;
        reviewed: number;
      };
      issues: {
        opened: number;
        closed: number;
      };
    };
  }[];
  validation: {
    isValid: boolean;
    errors: string[];
  };
  timestamp: number;
}
```

### 4. Error Handling Requirements

1. Implement error handling for all SDK error types:

```typescript:docs/integration-guide.md
startLine: 88
endLine: 98
```

2. Dashboard error recovery flow:

```typescript
try {
  await sdk.startTracking();
} catch (error) {
  if (error.code === 'RATE_LIMIT_ERROR') {
    // Implement exponential backoff
    await delay(calculateBackoff());
    await sdk.startTracking();
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors in UI
    displayValidationError(error.details);
  } else {
    // General error handling
    notifyError(error);
  }
}
```

## Dashboard Integration Points

### 1. Real-time Updates

- Implement WebSocket or polling mechanism
- Update frequency: 30 seconds (configurable)
- Handle rate limiting with exponential backoff

### 2. Component Requirements

#### NetworkStats Component

```typescript
interface NetworkStatsProps {
  metrics: ProcessedMetrics;
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (timeframe: string) => void;
}
```

#### DeveloperMetrics Component

```typescript
interface DeveloperMetricsProps {
  contributorId: string;
  metrics: ContributorMetrics[];
  onDateRangeChange: (range: DateRange) => void;
}
```

#### RewardsCalculator Component

```typescript
interface RewardsCalculatorProps {
  metrics: ProcessedMetrics;
  weights: {
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
  };
  onWeightChange: (newWeights: Weights) => void;
}
```

### 3. Data Flow Requirements

1. Initialization:

```typescript
const sdk = new GitHubRewardsSDK({
  githubToken: process.env.GITHUB_TOKEN,
  githubRepo: process.env.GITHUB_REPO,
  timeframe: 'week',
  maxRequestsPerSecond: 5
});
```

2. Event Handling:

```typescript
// Real-time metrics updates
sdk.on('metrics:collected', (metrics) => {
  updateDashboardMetrics(metrics);
  updateNetworkStats(metrics);
  updateLeaderboard(metrics);
});

// Reward calculations
sdk.on('reward:calculated', (reward) => {
  updateRewardsDisplay(reward);
  notifyContributor(reward);
});

// Error handling
sdk.on('error', (error) => {
  handleDashboardError(error);
  updateErrorState(error);
});
```

## Performance Guidelines

1. Data Caching:

- Cache metrics data locally
- Implement stale-while-revalidate pattern
- Clear cache on session end

2. Rate Limiting:

- Respect GitHub API limits (5000 requests/hour)
- Implement token bucket algorithm
- Cache frequently accessed data

3. Memory Management:

- Implement pagination for large datasets
- Cleanup unused event listeners
- Monitor memory usage

## Security Requirements

1. Token Management:

- Store GitHub tokens securely
- Implement token rotation
- Handle token expiration

2. Data Validation:

- Validate all API responses
- Sanitize metrics data
- Implement request signing

## Testing Requirements

Reference the testing structure from:

```typescript:tests/integration/sdk.test.ts
startLine: 1
endLine: 25
```

## Monitoring Integration

1. Health Checks:

```typescript
// Implement regular health checks
setInterval(async () => {
  const isHealthy = await sdk.healthCheck();
  updateDashboardStatus(isHealthy);
}, 60000);
```

2. Metrics Monitoring:

- Track API response times
- Monitor error rates
- Track event processing times

## Documentation Requirements

1. API Documentation:

- Document all event types
- Include error codes and handling
- Provide integration examples

2. Component Documentation:

- Document props and state management
- Include performance considerations
- Document error boundaries

This rules file ensures proper integration between the SDK and dashboard while maintaining performance, security, and reliability standards.
