import React, { createContext, useContext, useEffect, useState } from 'react';
import { SDKManager } from '../lib/sdk-manager';
import { useUser } from '@clerk/clerk-react';
import type { GitHubMetrics, RewardCalculation } from '../lib/types';
import { toast } from 'sonner';
import { useGitHubToken } from '../lib/clerk-github';

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
  const { user, isLoaded } = useUser();
  const { getToken, isLoaded: isTokenLoaded } = useGitHubToken();

  const refreshData = async () => {
    if (!isLoaded || !user) {
      setError('Please sign in to view metrics.');
      setMetrics(null);
      setRewards(null);
      return;
    }

    const trackedRepo = user.unsafeMetadata?.trackedRepository as string;
    if (!trackedRepo) {
      setError('Please select a repository to track.');
      setMetrics(null);
      setRewards(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Failed to retrieve GitHub token');
      }

      await sdkManager.initialize(token, trackedRepo);
      const githubMetrics = await sdkManager.getUserMetrics();
      const rewardsData = await sdkManager.calculateRewards(githubMetrics);

      setMetrics(githubMetrics);
      setRewards(rewardsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
      setError(message);
      setMetrics(null);
      setRewards(null);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isTokenLoaded) {
      refreshData();
      const interval = setInterval(refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [isLoaded, isTokenLoaded, user?.unsafeMetadata?.trackedRepository]);

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
