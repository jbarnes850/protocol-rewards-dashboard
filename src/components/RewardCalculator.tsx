import React from 'react';
import { Calculator } from 'lucide-react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import { useRewards } from '../hooks/useRewards';

export function RewardCalculator() {
  const { calculation, loading } = useRewards();

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="p-6 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-4" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/20 rounded-lg">
              <Calculator className="w-6 h-6 text-near-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Reward Calculator</h2>
              <p className="text-gray-400 mt-1">Track your impact and earnings</p>
            </div>
          </div>
          <div className="px-3 py-1 text-sm bg-near-purple/20 text-near-purple rounded-full">
            {calculation.tier.name}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <Tooltip content="GitHub score is calculated based on commit quality, PR engagement, and issue resolution">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">GitHub Impact</span>
                <span className="font-medium">{Math.round(calculation.githubScore)}</span>
              </div>
              <Progress value={calculation.githubScore} />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Quality Score</div>
                  <div className="font-medium">{Math.round(calculation.githubScore * 0.6)}/60</div>
                </div>
                <div>
                  <div className="text-gray-400">Engagement</div>
                  <div className="font-medium">{Math.round(calculation.githubScore * 0.4)}/40</div>
                </div>
              </div>
            </div>
          </Tooltip>

          <Tooltip content="NEAR score combines transaction volume, contract usage, and user growth metrics">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">NEAR Impact</span>
                <span className="font-medium">{Math.round(calculation.nearScore)}</span>
              </div>
              <Progress value={calculation.nearScore} />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Volume</div>
                  <div className="font-medium">{Math.round(calculation.nearScore * 0.7)}/70</div>
                </div>
                <div>
                  <div className="text-gray-400">Growth</div>
                  <div className="font-medium">{Math.round(calculation.nearScore * 0.3)}/30</div>
                </div>
              </div>
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <Tooltip content="Total score determines your reward tier and potential earnings">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Total Score</div>
                <div className="text-3xl font-bold">{Math.round(calculation.totalScore)}</div>
              </div>
              <Progress 
                value={calculation.totalScore} 
                className="mt-2"
                variant={calculation.totalScore >= 70 ? 'success' : 'default'}
              />
            </div>
          </Tooltip>

          <Tooltip content="Rewards are calculated based on your tier and available monthly pool">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div>
                <div className="text-sm text-gray-400 mb-1">Current Reward</div>
                <div className="text-2xl font-bold text-near-green">
                  ${Math.round(calculation.usdAmount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Ⓝ {Math.round(calculation.nearAmount).toLocaleString()}
                </div>
              </div>
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Tooltip content="Quality commits with meaningful impact">
            <div className="metric-card">
              <div className="text-sm text-gray-400 mb-1">Commits</div>
              <div className="text-xl font-bold">22</div>
              <div className="text-xs text-gray-500">Quality Commits</div>
            </div>
          </Tooltip>

          <Tooltip content="Successfully merged pull requests">
            <div className="metric-card">
              <div className="text-sm text-gray-400 mb-1">Merged PRs</div>
              <div className="text-xl font-bold">4</div>
              <div className="text-xs text-gray-500">Successfully Merged</div>
            </div>
          </Tooltip>

          <Tooltip content="Total NEAR transactions processed">
            <div className="metric-card">
              <div className="text-sm text-gray-400 mb-1">Transactions</div>
              <div className="text-xl font-bold">9,855</div>
              <div className="text-xs text-gray-500">Total Volume</div>
            </div>
          </Tooltip>

          <Tooltip content="Unique active users this month">
            <div className="metric-card">
              <div className="text-sm text-gray-400 mb-1">Users</div>
              <div className="text-xl font-bold">371</div>
              <div className="text-xs text-gray-500">Active Users</div>
            </div>
          </Tooltip>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Monthly Pool</span>
            <span className="text-sm">
              ${Math.round(25000 - calculation.totalAllocated).toLocaleString()} remaining
            </span>
          </div>
          <Progress 
            value={Math.round((calculation.totalAllocated / 25000) * 100)}
            variant={calculation.totalAllocated > 20000 ? 'warning' : 'default'}
          />
        </div>
      </div>
    </div>
  );
}