export interface GitHubMetrics {
  commits: {
    count: number;
    frequency: number;
    authorDiversity: number;
    score: number;
  };
  pullRequests: {
    count: number;
    merged: number;
    reviewEngagement: number;
    score: number;
  };
  issues: {
    closed: number;
    communityEngagement: number;
    quality: number;
    score: number;
  };
}

export interface NEARMetrics {
  transactions: {
    count: number;
    volume: number;
    quality: number;
    score: number;
  };
  contracts: {
    interactions: number;
    uniqueCallers: number;
    usagePatterns: number;
    score: number;
  };
  users: {
    total: number;
    retention: number;
    growthRate: number;
    score: number;
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
  totalAllocated: number;
}

export interface ProcessedMetrics {
  github: GitHubMetrics;
  near: NEARMetrics;
}

export interface User {
  id: string;
  name: string | null;
  avatar: string;
  githubUsername: string;
  metrics?: ProcessedMetrics;
  rewardTier?: {
    name: string;
    color: string;
    progress: number;
    nextMilestone: number;
  };
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}
