import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, GitPullRequest, Box, Activity } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

interface Developer {
  id: string;
  rank: number;
  name: string;
  specialization: string;
  tier: {
    name: string;
    color: string;
  };
  metrics: {
    commits: number;
    prs: number;
    contracts: number;
    transactions: number;
  };
  reward: number;
  change: number;
}

const mockDevelopers: Developer[] = [
  {
    id: '1',
    rank: 1,
    name: 'Sarah Chen',
    specialization: 'Smart Contracts • Core Protocol',
    tier: {
      name: 'Maximum Impact',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
    metrics: {
      commits: 45,
      prs: 12,
      contracts: 3,
      transactions: 156,
    },
    reward: 10000,
    change: 12.3,
  },
  {
    id: '2',
    rank: 2,
    name: 'Alex Kumar',
    specialization: 'DeFi • API Development',
    tier: {
      name: 'High Impact',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    metrics: {
      commits: 38,
      prs: 9,
      contracts: 2,
      transactions: 128,
    },
    reward: 7500,
    change: 8.5,
  },
  {
    id: '3',
    rank: 3,
    name: 'Maria Rodriguez',
    specialization: 'Frontend • Developer Tools',
    tier: {
      name: 'Rising Star',
      color: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    },
    metrics: {
      commits: 52,
      prs: 15,
      contracts: 1,
      transactions: 92,
    },
    reward: 5000,
    change: 15.2,
  },
];

export function Leaderboard() {
  return (
    <div className="bg-near-white rounded-xl p-6 border border-near-black/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-near-black">Developer Leaderboard</h2>
        <div className="flex items-center gap-4">
          <select
            className="bg-near-off-white border border-near-black/10 rounded-lg px-3 py-1.5 text-sm text-near-black"
            defaultValue="week"
          >
            <option value="day">24h</option>
            <option value="week">7d</option>
            <option value="month">30d</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {mockDevelopers.map((dev) => (
          <motion.div
            key={dev.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-near-off-white p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-near-purple text-white font-bold">
                  {dev.rank}
                </div>
                <div>
                  <div className="font-medium text-near-black flex items-center gap-2">
                    {dev.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${dev.tier.color}`}>
                      {dev.tier.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {dev.specialization}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-lg text-near-black">
                  {dev.reward.toLocaleString()} Ⓝ
                </div>
                <div className="text-sm text-green-500">
                  ↑ {dev.change}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
              <Tooltip content="Commits">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4" />
                  {dev.metrics.commits}
                </div>
              </Tooltip>
              <Tooltip content="Pull Requests">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" />
                  {dev.metrics.prs}
                </div>
              </Tooltip>
              <Tooltip content="Smart Contracts">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  {dev.metrics.contracts}
                </div>
              </Tooltip>
              <Tooltip content="Transactions">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {dev.metrics.transactions}
                </div>
              </Tooltip>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}