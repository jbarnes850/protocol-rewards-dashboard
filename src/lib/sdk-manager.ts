import { ProcessedMetrics } from '../types/metrics';
import { BaseError } from '../types/errors';
import { SDKConfig, RewardCalculation, GitHubRewardsSDK } from '../types/sdk';
import { MockGitHubRewardsSDK } from './mock-sdk';

/**
 * SDK Manager - Currently using mock implementation for development/demo
 * Will be updated to use real SDK implementation in production
 */
export class SDKManager {
  private static instance: SDKManager;
  private sdk: GitHubRewardsSDK | null = null;
  private metricsListeners: Set<(metrics: ProcessedMetrics) => void> = new Set();
  private rewardListeners: Set<(reward: RewardCalculation) => void> = new Set();
  private errorListeners: Set<(error: BaseError) => void> = new Set();
  private trackingStatusListeners: Set<(isTracking: boolean) => void> = new Set();

  private constructor() {}

  static getInstance(): SDKManager {
    if (!SDKManager.instance) {
      SDKManager.instance = new SDKManager();
    }
    return SDKManager.instance;
  }

  initialize(githubToken: string, repoFullName: string, config: Partial<SDKConfig> = {}) {
    if (this.sdk) {
      this.sdk.stopTracking();
    }

    const sdkConfig = {
      githubToken,
      repoFullName,
      timeframe: config.timeframe || 'week',
      maxRequestsPerSecond: config.maxRequestsPerSecond || 5,
      logger: config.logger
    };

    // Always use mock SDK for development/demo
    this.sdk = new MockGitHubRewardsSDK(sdkConfig);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.sdk) return;

    this.sdk.on('metrics:collected', (metrics: ProcessedMetrics) => {
      this.metricsListeners.forEach(listener => listener(metrics));
    });

    this.sdk.on('reward:calculated', (reward: RewardCalculation) => {
      this.rewardListeners.forEach(listener => listener(reward));
    });

    this.sdk.on('error', (error: BaseError) => {
      this.errorListeners.forEach(listener => listener(error));
    });

    this.sdk.on('tracking:started', () => {
      this.trackingStatusListeners.forEach(listener => listener(true));
    });

    this.sdk.on('tracking:stopped', () => {
      this.trackingStatusListeners.forEach(listener => listener(false));
    });
  }

  async startTracking() {
    if (!this.sdk) throw new Error('SDK not initialized');
    await this.sdk.startTracking();
  }

  async stopTracking() {
    if (!this.sdk) return;
    await this.sdk.stopTracking();
  }

  onMetricsCollected(listener: (metrics: ProcessedMetrics) => void) {
    this.metricsListeners.add(listener);
    return () => this.metricsListeners.delete(listener);
  }

  onRewardCalculated(listener: (reward: RewardCalculation) => void) {
    this.rewardListeners.add(listener);
    return () => this.rewardListeners.delete(listener);
  }

  onError(listener: (error: BaseError) => void) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  onTrackingStatusChange(listener: (isTracking: boolean) => void) {
    this.trackingStatusListeners.add(listener);
    return () => this.trackingStatusListeners.delete(listener);
  }

  async getLatestMetrics(): Promise<ProcessedMetrics | null> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return await this.sdk.getMetrics();
  }

  async healthCheck(): Promise<boolean> {
    if (!this.sdk) return false;
    try {
      return await this.sdk.healthCheck();
    } catch (error) {
      return false;
    }
  }

  getSDKInstance(): GitHubRewardsSDK | null {
    return this.sdk;
  }
} 