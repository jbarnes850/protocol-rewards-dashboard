export interface RewardMetrics {
  impact: number;
  quality: number;
  adoption: number;
}

export interface RewardTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  multiplier: number;
  requirements: RewardMetrics;
}

export interface RewardAction {
  description: string;
  reward: number;
  type: 'review' | 'deploy' | 'commit';
  impact: number;
} 