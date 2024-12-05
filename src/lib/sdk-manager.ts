import { NEARProtocolRewardsSDK } from './mock-sdk';
import type { GitHubMetrics, NEARMetrics } from './types';

export class SDKManager {
  private sdk: NEARProtocolRewardsSDK;

  constructor() {
    this.sdk = new NEARProtocolRewardsSDK({
      projectId: localStorage.getItem('tracked_repository') || ''
    });
  }

  async getUserMetrics(githubUsername: string) {
    return this.sdk.getUserMetrics(githubUsername);
  }

  async calculateRewards(metrics: GitHubMetrics, _nearMetrics: NEARMetrics) {
    // For now, we're only using GitHub metrics
    // NEAR metrics will be zeros
    const emptyNearMetrics: NEARMetrics = {
      transactions: {
        count: 0,
        volume: 0,
        quality: 0,
        score: 0
      },
      contracts: {
        interactions: 0,
        uniqueCallers: 0,
        usagePatterns: 0,
        score: 0
      },
      users: {
        total: 0,
        retention: 0,
        growthRate: 0,
        score: 0
      }
    };

    // Transform metrics to match expected format
    const githubMetrics: GitHubMetrics = {
      commits: metrics.commits,
      pullRequests: metrics.pullRequests,
      issues: metrics.issues
      // Removed reviews as it's not in the type
    };

    return this.sdk.calculateRewards(githubMetrics, emptyNearMetrics);
  }
} 