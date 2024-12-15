import React from 'react';
import { Activity, Users, GitPullRequest, Star, Coins } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSDK } from '../providers/SDKProvider';

interface NetworkMetrics {
  totalRewardsDistributed: number;
  activeContributors: number;
  totalStars: number;
  openPRs: number;
  totalContributions: number;
  isPrivateRepo: boolean;
  trackedRepo: string | null;
}

export function NetworkStats() {
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const { metrics: sdkMetrics, rewards, loading, error: sdkError } = useSDK();
  const [metrics, setMetrics] = React.useState<NetworkMetrics>({
    totalRewardsDistributed: 0,
    activeContributors: 0,
    totalStars: 0,
    openPRs: 0,
    totalContributions: 0,
    isPrivateRepo: false,
    trackedRepo: null
  });

  React.useEffect(() => {
    if (sdkMetrics && rewards) {
      const activeContributors = Math.ceil(sdkMetrics.commits.count * sdkMetrics.commits.authorDiversity);
      const totalContributions = sdkMetrics.commits.count + sdkMetrics.pullRequests.count + sdkMetrics.issues.closed;

      setMetrics({
        totalRewardsDistributed: rewards.totalAllocated || 0,
        activeContributors,
        totalStars: Math.floor(sdkMetrics.commits.score + sdkMetrics.pullRequests.score),
        openPRs: sdkMetrics.pullRequests.count - sdkMetrics.pullRequests.merged,
        totalContributions,
        isPrivateRepo: true,
        trackedRepo: rewards.tier.name
      });
    }
  }, [sdkMetrics, rewards]);

  if (!isLoaded || !user) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">Please connect your GitHub account to view metrics.</p>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">{sdkError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {metrics.trackedRepo ? (
            <>Repository Metrics: {metrics.trackedRepo}</>
          ) : (
            <>Protocol Rewards Overview</>
          )}
        </h2>
        <span className="text-sm text-near-green flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-near-green animate-pulse"></span>
          Live {metrics.isPrivateRepo && '(Private Repository)'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Tooltip content="Total rewards available in the current program period">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/10 rounded-lg">
              <Coins className="w-4 h-4 text-near-purple" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Available Pool</div>
              <div className="font-medium">${(metrics.totalRewardsDistributed / 1000).toFixed(1)}K</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Active developers participating in Protocol Rewards">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-green/10 rounded-lg">
              <Users className="w-4 h-4 text-near-green" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Builders</div>
              <div className="font-medium">{metrics.activeContributors}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Total GitHub stars across eligible repositories">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-blue/10 rounded-lg">
              <Star className="w-4 h-4 text-near-blue" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Project Stars</div>
              <div className="font-medium">{metrics.totalStars}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Open pull requests eligible for rewards">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-red/10 rounded-lg">
              <GitPullRequest className="w-4 h-4 text-near-red" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Reward PRs</div>
              <div className="font-medium">{metrics.openPRs}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Total contributions eligible for rewards this period">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/10 rounded-lg">
              <Activity className="w-4 h-4 text-near-purple" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Impact</div>
              <div className="font-medium">{metrics.totalContributions}</div>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
} 