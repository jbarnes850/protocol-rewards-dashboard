import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, ArrowUpRight, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: '2024-01', users: 1200, contracts: 15, transactions: 45000 },
  { date: '2024-02', users: 1800, contracts: 22, transactions: 68000 },
  { date: '2024-03', users: 2500, contracts: 28, transactions: 92000 },
  { date: '2024-04', users: 3800, contracts: 35, transactions: 125000 },
];

export function ImpactMetrics() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Developer Impact</h2>
        <button className="flex items-center gap-1 text-near-purple hover:text-near-purple/80 transition-colors">
          <span className="text-sm">View Details</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-400">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-white">3.8K</div>
          <div className="text-sm text-green-400 mt-1">↑ 58% vs last month</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Code className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-gray-400">Smart Contracts</span>
          </div>
          <div className="text-2xl font-bold text-white">35</div>
          <div className="text-sm text-green-400 mt-1">↑ 25% vs last month</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-gray-400">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-white">125K</div>
          <div className="text-sm text-green-400 mt-1">↑ 36% vs last month</div>
        </motion.div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Active Users"
            />
            <Line
              type="monotone"
              dataKey="contracts"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="Smart Contracts"
            />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="#EAB308"
              strokeWidth={2}
              dot={false}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}