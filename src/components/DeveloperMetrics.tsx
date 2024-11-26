import React from 'react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';

const TimeRangeSelector = () => (
  <select className="bg-white/5 text-sm rounded-lg px-3 py-2">
    <option>Last 7 days</option>
    <option>Last 30 days</option>
    <option>Last 90 days</option>
  </select>
);

export const DeveloperMetrics: React.FC = () => {
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
              <span className="text-near-purple">89/100</span>
            </Tooltip>
          </div>
          <Progress value={89} className="mb-1" />
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <Tooltip content="Measured by code reviews, test coverage, and documentation">
              <div>
                <div className="text-gray-400">Code Quality</div>
                <div className="font-medium">85/100</div>
              </div>
            </Tooltip>
            <Tooltip content="Based on adoption and usage of your contributions">
              <div>
                <div className="text-gray-400">User Impact</div>
                <div className="font-medium">92/100</div>
              </div>
            </Tooltip>
          </div>
        </div>

        <Tooltip content="Percentage of contributions from unique developers">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Collaboration Score</div>
            <div className="text-xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </div>
        </Tooltip>

        <Tooltip content="Total value generated through your contributions">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Value Generated</div>
            <div className="text-xl font-bold">$1.5M</div>
            <div className="text-sm text-near-green mt-1">↑ 36% vs last month</div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};