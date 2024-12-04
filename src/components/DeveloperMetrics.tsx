import React from 'react';
import { Progress } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import { useMetrics } from '../providers/MetricsProvider';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const TimeRangeSelector = () => (
  <select className="bg-white/5 text-sm rounded-lg px-3 py-2">
    <option>Last 7 days</option>
    <option>Last 30 days</option>
    <option>Last 90 days</option>
  </select>
);

export function DeveloperMetrics() {
  const { metrics, loading, error } = useMetrics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse"></div>
            <div className="h-8 bg-white/10 rounded w-1/4 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-red-400 p-4">
            Failed to load developer metrics. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    {
      name: 'Pull Requests',
      value: metrics?.github.pullRequests.merged || 0,
      score: metrics?.score.breakdown.pullRequests || 0,
      max: 100,
      tooltip: 'Number of merged pull requests and their impact score',
    },
    {
      name: 'Code Reviews',
      value: metrics?.github.reviews.count || 0,
      score: metrics?.score.breakdown.reviews || 0,
      max: 100,
      tooltip: 'Number of code reviews completed and their impact score',
    },
    {
      name: 'Issue Management',
      value: metrics?.github.issues.closed || 0,
      score: metrics?.score.breakdown.issues || 0,
      max: 100,
      tooltip: 'Number of issues closed and their impact score',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Developer Impact</CardTitle>
          <TimeRangeSelector />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => (
            <Tooltip key={category.name} content={category.tooltip}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{category.value} items</span>
                    <span className="text-sm text-near-purple">
                      Score: {category.score}
                    </span>
                  </div>
                </div>
                <Progress value={(category.score / category.max) * 100} />
              </div>
            </Tooltip>
          ))}

          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Overall Impact Score</span>
              <span className="text-lg font-bold text-near-purple">
                {metrics?.score.total || 0}
              </span>
            </div>
            <Progress 
              value={metrics?.score.total || 0} 
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}