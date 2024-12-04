import { Calculator } from 'lucide-react';
import { useMetrics } from '../providers/MetricsProvider';

interface RewardCalculation {
  amount: number;
  breakdown: {
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
  };
  tier: {
    name: string;
    color: string;
  };
}

const calculateRewards = (metrics: any): RewardCalculation => {
  // Get tier based on total score
  const getTier = (score: number) => {
    if (score >= 90) return { name: 'Platinum', color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
    if (score >= 75) return { name: 'Gold', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' };
    if (score >= 50) return { name: 'Silver', color: 'bg-gradient-to-r from-gray-400 to-gray-500' };
    return { name: 'Bronze', color: 'bg-gradient-to-r from-orange-500 to-red-500' };
  };

  return {
    amount: metrics.score.total,
    breakdown: metrics.score.breakdown,
    tier: getTier(metrics.score.total)
  };
};

export function RewardCalculator() {
  const { metrics, loading, error } = useMetrics();

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

  if (error) {
    return (
      <div className="dashboard-card p-6">
        <div className="text-red-400">
          Failed to calculate rewards. Please try again later.
        </div>
      </div>
    );
  }

  const calculation = calculateRewards(metrics);

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
          <div className={`px-3 py-1 text-sm text-white rounded-full ${calculation.tier.color}`}>
            {calculation.tier.name}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
            <div className="text-2xl font-bold">{calculation.amount.toLocaleString()} Ⓝ</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Current Period</div>
            <div className="text-2xl font-bold">
              {new Date(metrics.periodStart).toLocaleDateString()} - {new Date(metrics.periodEnd).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-3">Reward Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Commits</span>
              <span>{calculation.breakdown.commits.toLocaleString()} Ⓝ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pull Requests</span>
              <span>{calculation.breakdown.pullRequests.toLocaleString()} Ⓝ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Code Reviews</span>
              <span>{calculation.breakdown.reviews.toLocaleString()} Ⓝ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Issue Management</span>
              <span>{calculation.breakdown.issues.toLocaleString()} Ⓝ</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Rewards</span>
              <span className="text-near-purple">{calculation.amount.toLocaleString()} Ⓝ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}