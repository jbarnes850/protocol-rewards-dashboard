import React from 'react';
import { TrendingUp, Zap, Code, GitPullRequest } from 'lucide-react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import { useMetrics } from '../providers/MetricsProvider';

export function PersonalProgress() {
  const { metrics, loading } = useMetrics();

  // Calculate tier based on total score
  const getTier = (score: number) => {
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 50) return 'Silver';
    return 'Bronze';
  };

  const currentScore = metrics?.score.total || 0;
  const tier = getTier(currentScore);
  const maxScore = 100;

  // Calculate monthly earnings based on score (example calculation)
  const maxEarnings = 10000;
  const currentEarnings = Math.round((currentScore / maxScore) * maxEarnings);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Monthly Earnings</h2>
          <p className="text-sm text-gray-400 mt-1">Track your rewards and unlock bonuses</p>
        </div>
        <Tooltip content="Your current reward tier - keep contributing to level up">
          <div className="px-3 py-1.5 bg-near-purple/20 rounded-full">
            <span className="text-sm text-near-purple">{tier} Tier</span>
          </div>
        </Tooltip>
      </div>

      <div className="space-y-6">
        {/* Earnings Progress */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-gray-400">Monthly Progress</span>
            <div className="text-right">
              <span className="text-2xl font-bold">${currentEarnings.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-1">/ ${maxEarnings.toLocaleString()}</span>
            </div>
          </div>
          <Progress 
            value={currentScore} 
            className="mb-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Cap</span>
            <span className="text-near-purple">{Math.round(currentScore)}%</span>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GitPullRequest className="w-4 h-4 text-near-purple" />
              <span className="text-gray-400">Pull Requests</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.github.pullRequests.merged || 0}</div>
            <div className="text-sm text-near-purple mt-1">
              Score: {metrics?.score.breakdown.pullRequests || 0}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-near-purple" />
              <span className="text-gray-400">Commits</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.github.commits.count || 0}</div>
            <div className="text-sm text-near-purple mt-1">
              Score: {metrics?.score.breakdown.commits || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}