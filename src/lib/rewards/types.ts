export interface GitHubMetrics {
  commits: {
    count: number;
    frequency: number;
    authorDiversity: number;
  };
  pullRequests: {
    count: number;
    merged: number;
    reviewEngagement: number;
  };
  issues: {
    closed: number;
    communityEngagement: number;
    quality: number;
  };
}

export interface NEARMetrics {
  transactions: {
    count: number;
    volume: number;
    quality: number;
  };
  contracts: {
    interactions: number;
    uniqueCallers: number;
    usagePatterns: number;
  };
  users: {
    total: number;
    retention: number;
    growthRate: number;
  };
}

export interface RewardTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  usdReward: number;
  color: string;
}

export interface RewardCalculation {
  githubScore: number;
  nearScore: number;
  totalScore: number;
  usdAmount: number;
  nearAmount: number;
  tier: RewardTier;
}