import { NEARProtocolRewardsSDK } from './real-sdk';
import type { GitHubMetrics, NEARMetrics, RewardCalculation } from './types';

type TokenProvider = () => Promise<string>;

export class SDKManager {
  private sdk: NEARProtocolRewardsSDK | null = null;
  private token: string | null = null;
  private projectId: string | null = null;
  private tokenProvider: TokenProvider | null = null;
  private initialized = false;

  constructor() {
    // Initialize with null values, will be set during initialize()
  }

  async initialize(tokenOrProvider: string | TokenProvider, projectId?: string | null): Promise<void> {
    try {
      let newToken: string;

      if (typeof tokenOrProvider === 'string') {
        newToken = tokenOrProvider;
      } else {
        this.tokenProvider = tokenOrProvider;
        newToken = await tokenOrProvider();
      }

      if (!this.initialized || newToken !== this.token || projectId !== this.projectId) {
        this.token = newToken;
        this.projectId = projectId || 'default';
        this.sdk = new NEARProtocolRewardsSDK({
          projectId: this.projectId,
          token: this.token
        });
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize SDK:', error);
      throw new Error('Failed to initialize SDK with GitHub token');
    }
  }

  async getUserMetrics(projectId?: string | null): Promise<GitHubMetrics> {
    if (!this.initialized || !this.sdk) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    // Refresh token if we have a provider
    if (this.tokenProvider) {
      try {
        const newToken = await this.tokenProvider();
        if (newToken !== this.token) {
          await this.initialize(this.tokenProvider, this.projectId);
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw new Error('Failed to refresh GitHub token');
      }
    }

    const metrics = await this.sdk.getMetrics(projectId || this.projectId || 'default');
    return {
      commits: metrics.commits,
      pullRequests: metrics.pullRequests,
      issues: metrics.issues
    };
  }

  async calculateRewards(metrics: GitHubMetrics): Promise<RewardCalculation> {
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