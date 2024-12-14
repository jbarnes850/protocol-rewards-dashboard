import React, { createContext, useContext, useEffect, useState } from 'react';
import { SDKManager } from '../lib/sdk-manager';
import { useAuth } from './AuthProvider';
import { GitHubAuth } from '../lib/github-auth';
import type { GitHubMetrics, RewardCalculation } from '../lib/types';
import { toast } from 'sonner';

interface SDKContextValue {
  sdkManager: SDKManager | null;
  metrics: GitHubMetrics | null;
  rewards: RewardCalculation | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const SDKContext = createContext<SDKContextValue | null>(null);

export function SDKProvider({ children }: { children: React.ReactNode }) {
  const [sdkManager] = useState(() => new SDKManager());
  const [metrics, setMetrics] = useState<GitHubMetrics | null>(null);
  const [rewards, setRewards] = useState<RewardCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isGitHubConnected } = useAuth();
  const githubAuth = GitHubAuth.getInstance();

  const refreshData = async () => {
    if (!user || !isGitHubConnected) {
      setError('Please connect your GitHub account to view metrics.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await githubAuth.getAccessToken();
      if (!token) {
        throw new Error('GitHub token not found');
      }

      const repo = githubAuth.getTrackedRepository()?.full_name;
      await sdkManager.initialize(token, repo);
      const githubMetrics = await sdkManager.getUserMetrics();
      const rewardsData = await sdkManager.calculateRewards(githubMetrics);

      setMetrics(githubMetrics);
      setRewards(rewardsData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [user, isGitHubConnected]);

  const value: SDKContextValue = {
    sdkManager,
    metrics,
    rewards,
    loading,
    error,
    refreshData
  };

  return (
    <SDKContext.Provider value={value}>
      {children}
    </SDKContext.Provider>
  );
}

export const useSDK = () => {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within an SDKProvider');
  }
  return context;
};
