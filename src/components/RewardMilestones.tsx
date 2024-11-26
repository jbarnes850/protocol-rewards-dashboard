import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Code } from 'lucide-react';
import { Progress } from './ui/Progress';

const milestones = [
  {
    id: 'm1',
    title: 'Maximum Impact',
    description: '100+ quality commits, 20+ merged PRs, 30+ closed issues',
    points: 90,
    reward: '$10,000',
    icon: Trophy,
    progress: 85,
    eta: '~2 weeks',
  },
  {
    id: 'm2',
    title: 'Transaction Volume',
    description: '$1M+ monthly volume (~200K NEAR)',
    points: 75,
    reward: '$7,500',
    icon: TrendingUp,
    progress: 68,
    eta: '~1 month',
  },
  {
    id: 'm3',
    title: 'User Growth',
    description: '1,000+ unique users with strong retention',
    points: 60,
    reward: '$5,000',
    icon: Target,
    progress: 45,
    eta: '~3 weeks',
  },
  {
    id: 'm4',
    title: 'Contract Usage',
    description: 'Regular interactions with diverse caller base',
    points: 40,
    reward: '$2,500',
    icon: Code,
    progress: 30,
    eta: '~1 month',
  },
];

export function RewardMilestones() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Reward Milestones</h2>
        <div className="text-sm text-gray-400">Monthly Pool: $25,000</div>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-near-purple/10 mt-1">
                  <milestone.icon className="w-5 h-5 text-near-purple" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">{milestone.title}</h3>
                  <p className="text-sm text-gray-400">{milestone.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-near-green font-medium">{milestone.reward}</div>
                <div className="text-sm text-gray-400">ETA: {milestone.eta}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-near-purple">{milestone.progress}%</span>
              </div>
              <Progress value={milestone.progress} />
              <div className="mt-2 text-xs text-gray-400">
                Required Score: {milestone.points}+ points
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Important Notes:</div>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Rewards distributed on first-come, first-served basis</li>
          <li>Minimum score required: 25 points</li>
          <li>Scores calculated from GitHub (50%) and NEAR (50%) activity</li>
        </ul>
      </div>
    </div>
  );
}