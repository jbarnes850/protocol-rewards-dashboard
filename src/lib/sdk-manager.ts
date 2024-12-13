import { NEARProtocolRewardsSDK } from './real-sdk';
import type { GitHubMetrics, NEARMetrics, RewardCalculation } from './types';

export class SDKManager {
  private sdk: NEARProtocolRewardsSDK | null = null;
  private token: string | null = null;
  private projectId: string | null = null;
  private initialized = false;

  constructor() {
    // Initialize with null values, will be set during initialize()
  }

  async initialize(token: string, projectId?: string | null): Promise<void> {
    if (!this.initialized || token !== this.token || projectId !== this.projectId) {
      this.token = token;
      this.projectId = projectId || 'default';
      this.sdk = new NEARProtocolRewardsSDK({
        projectId: this.projectId,
        token: this.token
      });
      this.initialized = true;
    }
  }

  async getUserMetrics(projectId?: string | null): Promise<GitHubMetrics> {
    if (!this.initialized || !this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    const metrics = await this.sdk.getMetrics(projectId || this.projectId || 'default');
    return {
      commits: metrics.commits,
      pullRequests: metrics.pullRequests,
      issues: metrics.issues
    };
  }

  async calculateRewards(metrics: GitHubMetrics, projectId?: string | null): Promise<RewardCalculation> {
    if (!this.initialized || !this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    const emptyNearMetrics: NEARMetrics = {
      transactions: { count: 0, volume: 0, quality: 0, score: 0 },
      contracts: { interactions: 0, uniqueCallers: 0, usagePatterns: 0, score: 0 },
      users: { total: 0, retention: 0, growthRate: 0, score: 0 }
    };

    return this.sdk.calculateRewards(metrics, emptyNearMetrics);
  }
} 