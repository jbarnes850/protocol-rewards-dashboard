import { GitHubRewardsSDK, SDKConfig, SDKEvents, ProcessedMetrics, RewardCalculation } from '../types/sdk';
import { BaseError, ErrorCode } from '../types/errors';

const MOCK_UPDATE_INTERVAL = parseInt(import.meta.env.VITE_MOCK_UPDATE_INTERVAL || '30000', 10);
const CONTRIBUTOR_NAMES = ['alice', 'bob', 'charlie', 'dave', 'eve'];

export class MockGitHubRewardsSDK implements GitHubRewardsSDK {
  private eventListeners: Partial<{ [K in keyof SDKEvents]: Set<SDKEvents[K]> }> = {};
  private isTracking = false;
  private trackingInterval: NodeJS.Timeout | null = null;
  private config: SDKConfig;
  private mockData: {
    contributors: { [key: string]: number };
    totalStars: number;
    lastUpdate: number;
  };

  constructor(config: SDKConfig) {
    this.config = config;
    this.mockData = {
      contributors: CONTRIBUTOR_NAMES.reduce((acc, name) => ({ 
        ...acc, 
        [name]: Math.floor(Math.random() * 100) 
      }), {}),
      totalStars: Math.floor(Math.random() * 1000),
      lastUpdate: Date.now()
    };
  }

  on<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = new Set();
    }
    (this.eventListeners[event] as Set<SDKEvents[K]>).add(listener);
  }

  off<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): void {
    if (this.eventListeners[event]) {
      (this.eventListeners[event] as Set<SDKEvents[K]>).delete(listener);
    }
  }

  private emit<K extends keyof SDKEvents>(event: K, ...args: Parameters<SDKEvents[K]>): void {
    if (this.eventListeners[event]) {
      (this.eventListeners[event] as Set<SDKEvents[K]>).forEach(listener => {
        listener(...args);
      });
    }
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    try {
      if (!this.config.githubToken) {
        throw new BaseError(ErrorCode.CONFIGURATION_ERROR, 'GitHub token is required');
      }

      this.isTracking = true;
      this.emit('tracking:started');

      // Simulate periodic metrics collection
      this.trackingInterval = setInterval(() => {
        this.updateMockData();
        const metrics = this.generateMockMetrics();
        this.emit('metrics:collected', metrics);

        // Simulate reward calculation
        const reward = this.generateMockReward(metrics);
        this.emit('reward:calculated', reward);
      }, MOCK_UPDATE_INTERVAL);

    } catch (error) {
      this.emit('error', error instanceof BaseError ? error : new BaseError(
        ErrorCode.SDK_ERROR,
        'Failed to start tracking',
        error instanceof Error ? error.message : undefined
      ));
      throw error;
    }
  }

  private updateMockData(): void {
    // Update contributor activity
    Object.keys(this.mockData.contributors).forEach(contributor => {
      const change = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
      this.mockData.contributors[contributor] += change;
    });

    // Occasionally add stars
    if (Math.random() > 0.8) {
      this.mockData.totalStars += Math.floor(Math.random() * 3);
    }

    this.mockData.lastUpdate = Date.now();
  }

  async stopTracking(): Promise<void> {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.isTracking = false;
    this.emit('tracking:stopped');
  }

  async getMetrics(): Promise<ProcessedMetrics | null> {
    return this.generateMockMetrics();
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private generateMockMetrics(): ProcessedMetrics {
    const contributors = Object.entries(this.mockData.contributors).map(([name, activity]) => ({
      contributorId: name,
      commits: Math.floor(activity * 0.3),
      additions: Math.floor(activity * 20),
      deletions: Math.floor(activity * 10),
      pullRequests: {
        opened: Math.floor(activity * 0.1),
        reviewed: Math.floor(activity * 0.2),
        merged: Math.floor(activity * 0.1)
      },
      issues: {
        opened: Math.floor(activity * 0.1),
        closed: Math.floor(activity * 0.1),
        commented: Math.floor(activity * 0.3)
      },
      timestamp: Date.now()
    }));

    const totalContributions = contributors.reduce((acc, curr) => ({
      commits: acc.commits + curr.commits,
      pullRequests: acc.pullRequests + curr.pullRequests.opened,
      issues: acc.issues + curr.issues.opened,
      reviews: acc.reviews + curr.pullRequests.reviewed
    }), { commits: 0, pullRequests: 0, issues: 0, reviews: 0 });

    return {
      repositoryId: this.config.repoFullName,
      timeframe: this.config.timeframe || 'week',
      contributors,
      totalContributions,
      validation: {
        isValid: true,
        errors: []
      },
      timestamp: Date.now()
    };
  }

  private generateMockReward(metrics: ProcessedMetrics): RewardCalculation {
    const contributor = metrics.contributors[
      Math.floor(Math.random() * metrics.contributors.length)
    ];

    return {
      contributorId: contributor.contributorId,
      rewardAmount: Math.floor(
        (contributor.commits * 10 + 
         contributor.pullRequests.merged * 20 + 
         contributor.pullRequests.reviewed * 15) * 
        (Math.random() * 0.2 + 0.9) // Random factor between 0.9 and 1.1
      ),
      metrics,
      timestamp: Date.now()
    };
  }
} 