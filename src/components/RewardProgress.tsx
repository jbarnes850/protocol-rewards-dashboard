import React from 'react';
import { Target, TrendingUp, Award, Zap } from 'lucide-react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/Collapsible';
import { MetricsBreakdown } from './MetricsBreakdown';

export function RewardProgress() {
  // Mock data - would come from API
  const rewards = {
    currentEarnings: 7500,
    maxEarnings: 10000,
    streakDays: 12,
    daysUntilBonus: 3,
    multiplier: 20,
    tier: 'Gold',
    nextTier: 'Platinum',
    progress: 75
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Monthly Earnings</h2>
          <p className="text-sm text-gray-400 mt-1">Track your rewards and unlock bonuses</p>
        </div>
        <Tooltip content="Your current reward tier">
          <div className="px-3 py-1.5 bg-near-purple/20 rounded-full">
            <span className="text-sm text-near-purple">{rewards.tier} Tier</span>
          </div>
        </Tooltip>
      </div>

      <div className="space-y-6">
        {/* Earnings Progress */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-gray-400">Monthly Progress</span>
            <div className="text-right">
              <span className="text-2xl font-bold">${rewards.currentEarnings.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-1">/ ${rewards.maxEarnings.toLocaleString()}</span>
            </div>
          </div>
          <Progress 
            value={(rewards.currentEarnings / rewards.maxEarnings) * 100} 
            className="mb-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Cap</span>
            <span className="text-near-purple">{Math.round((rewards.currentEarnings / rewards.maxEarnings) * 100)}%</span>
          </div>
        </div>

        {/* Streak & Multiplier */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Zap className="w-5 h-5 text-near-purple" />
                {rewards.streakDays} Day Streak
              </h3>
              <p className="text-sm text-gray-400">
                {rewards.daysUntilBonus} days until bonus rewards
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-near-green">+{rewards.multiplier}%</div>
              <div className="text-sm text-gray-400">Reward Multiplier</div>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Tier Progress</span>
            <div className="text-sm">
              <span className="text-near-purple">{rewards.tier}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="text-gray-400">{rewards.nextTier}</span>
            </div>
          </div>
          <Progress value={rewards.progress} className="mb-1" />
          <div className="text-sm text-gray-400">
            {100 - rewards.progress}% until next tier
          </div>
        </div>

        {/* Calculation Details */}
        <Collapsible>
          <CollapsibleTrigger className="text-sm text-gray-400 hover:text-white transition-colors">
            View Calculation Details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <MetricsBreakdown />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}