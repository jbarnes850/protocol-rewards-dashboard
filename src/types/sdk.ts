import { ProcessedMetrics } from './metrics';
import { BaseError } from './errors';

export interface SDKConfig {
  githubToken: string;
  repoFullName: string;
  timeframe?: 'day' | 'week' | 'month';
  maxRequestsPerSecond?: number;
  logger?: Console;
}

export interface RewardCalculation {
  contributorId: string;
  rewardAmount: number;
  metrics: ProcessedMetrics;
  timestamp: number;
}

export interface SDKEvents {
  'metrics:collected': (metrics: ProcessedMetrics) => void;
  'reward:calculated': (reward: RewardCalculation) => void;
  'error': (error: BaseError) => void;
  'tracking:started': () => void;
  'tracking:stopped': () => void;
}

export interface GitHubRewardsSDK {
  on<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): void;
  off<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): void;
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  getMetrics(): Promise<ProcessedMetrics | null>;
  healthCheck(): Promise<boolean>;
} 