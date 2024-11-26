import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins } from 'lucide-react';
import { useRewardsData } from '../hooks/useRewardsData';

export const RewardsDistribution: React.FC = () => {
  const { data, loading } = useRewardsData();
  const totalRewards = data.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl p-6 h-96" />;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Rewards Distribution</h2>
        <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
          <Coins className="text-yellow-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Total Rewards</p>
            <p className="text-xl font-bold text-yellow-600">{totalRewards.toLocaleString()} Ⓝ</p>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#eab308" 
              strokeWidth={2}
              dot={false}
              name="NEAR Tokens"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};