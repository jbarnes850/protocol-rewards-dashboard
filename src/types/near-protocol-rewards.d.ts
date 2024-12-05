declare module 'near-protocol-rewards' {
  import { EventEmitter } from 'events';
  import { ProcessedMetrics, ContributorMetrics } from './metrics';

  export interface SDKConfig {
    githubToken: string;
    repositoryFullName: string;
    timeframe?: 'day' | 'week' | 'month';
    maxRequestsPerSecond?: number;
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
    'tracking:started': () => void;
    'tracking:stopped': () => void;
    'error': (error: Error) => void;
  }

  export class GitHubRewardsSDK extends EventEmitter {
    constructor(config: SDKConfig);
    on<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this;
    off<K extends keyof SDKEvents>(event: K, listener: SDKEvents[K]): this;
    startTracking(): Promise<void>;
    stopTracking(): Promise<void>;
    getMetrics(): Promise<ProcessedMetrics | null>;
    healthCheck(): Promise<boolean>;
    removeAllListeners(): this;
  }

  export { ProcessedMetrics, ContributorMetrics };
} 