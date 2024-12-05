import React from 'react';
import { useMetrics } from '../providers/MetricsProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/Progress';

interface MetricItem {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export function MetricsBreakdown() {
  const { metrics } = useMetrics();

  if (!metrics) {
    return null;
  }

  const metricsData: MetricItem[] = [
    {
      label: 'Pull Requests',
      value: metrics.github?.pullRequests.merged || 0,
      maxValue: 100,
      color: 'bg-purple-500'
    },
    {
      label: 'Code Reviews',
      value: metrics.github?.reviews.count || 0,
      maxValue: 100,
      color: 'bg-blue-500'
    },
    {
      label: 'Issues',
      value: metrics.github?.issues.closed || 0,
      maxValue: 100,
      color: 'bg-green-500'
    },
    {
      label: 'Commits',
      value: metrics.github?.commits.count || 0,
      maxValue: 100,
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metricsData.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{metric.label}</span>
                <span>{metric.value} / {metric.maxValue}</span>
              </div>
              <Progress 
                value={(metric.value / metric.maxValue) * 100}
                className={metric.color}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 