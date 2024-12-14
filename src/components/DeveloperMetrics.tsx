import React from 'react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import { useSDK } from '../providers/SDKProvider';

const TimeRangeSelector = () => (
  <select className="bg-white/5 text-sm rounded-lg px-3 py-2">
    <option>Last 7 days</option>
    <option>Last 30 days</option>
    <option>Last 90 days</option>
  </select>
);

export const DeveloperMetrics: React.FC = () => {
  const { metrics, rewards, loading, error } = useSDK();

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded mb-6 w-48"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!metrics || !rewards) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <p className="text-gray-400">No metrics available.</p>
      </div>
    );
  }

  const impactScore = Math.floor((metrics.commits.score + metrics.pullRequests.score + metrics.issues.score) / 3);
  const codeQualityScore = Math.floor((metrics.commits.authorDiversity * 100 + metrics.pullRequests.reviewEngagement * 100) / 2);
  const userImpactScore = Math.floor(metrics.issues.communityEngagement * 100);
  const collaborationScore = Math.floor(metrics.commits.authorDiversity * 100);

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Contribution Quality</h2>
        <TimeRangeSelector />
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Overall Impact</span>
            <Tooltip content="Combined score of code quality and user impact">
              <span className="text-near-purple">{impactScore}/100</span>
            </Tooltip>
          </div>
          <Progress value={impactScore} className="mb-1" />
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <Tooltip content="Measured by code reviews, test coverage, and documentation">
              <div>
                <div className="text-gray-400">Code Quality</div>
                <div className="font-medium">{codeQualityScore}/100</div>
              </div>
            </Tooltip>
            <Tooltip content="Based on adoption and usage of your contributions">
              <div>
                <div className="text-gray-400">User Impact</div>
                <div className="font-medium">{userImpactScore}/100</div>
              </div>
            </Tooltip>
          </div>
        </div>

        <Tooltip content="Percentage of contributions from unique developers">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Collaboration Score</div>
            <div className="text-xl font-bold">{collaborationScore}%</div>
            <Progress value={collaborationScore} className="mt-2" />
          </div>
        </Tooltip>

        <Tooltip content="Total value generated through your contributions">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Value Generated</div>
            <div className="text-xl font-bold">${(rewards.usdAmount / 1000).toFixed(1)}K</div>
            <div className="text-sm text-near-green mt-1">↑ {Math.floor(rewards.totalScore)}% vs baseline</div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
