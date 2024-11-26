import React from 'react';
import { Progress } from './ui/Progress';

export const MetricsBreakdown: React.FC = () => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">GitHub Activity</span>
          <span className="text-near-purple">85/100</span>
        </div>
        <Progress value={85} className="h-1" />
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
          <div>Commits: 42</div>
          <div>PRs: 15</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Contract Usage</span>
          <span className="text-near-purple">92/100</span>
        </div>
        <Progress value={92} className="h-1" />
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
          <div>Transactions: 15.2k</div>
          <div>Users: 3.4k</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Community Impact</span>
          <span className="text-near-purple">78/100</span>
        </div>
        <Progress value={78} className="h-1" />
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
          <div>Reviews: 28</div>
          <div>Issues: 45</div>
        </div>
      </div>
    </div>
  );
}; 