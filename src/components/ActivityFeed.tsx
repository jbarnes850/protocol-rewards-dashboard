import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, GitCommit, GitPullRequest, Box, TrendingUp } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useSDK } from '../providers/SDKProvider';

interface ActivityItem {
  id: string;
  type: 'commit' | 'pr' | 'deployment';
  project: string;
  description: string;
  timestamp: Date;
  impact: 'high' | 'medium' | 'low';
  metrics?: {
    additions?: number;
    deletions?: number;
    files?: number;
    reviewers?: number;
  };
}

export function ActivityFeed() {
  const { metrics, loading, error } = useSDK();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!metrics) return;

    // Generate activities based on metrics data
    const newActivities: ActivityItem[] = [];

    // Add commit activity
    if (metrics.commits.count > 0) {
      newActivities.push({
        id: 'commit-' + Date.now(),
        type: 'commit',
        project: 'Repository',
        description: `${metrics.commits.count} new commits with ${Math.floor(metrics.commits.authorDiversity * 100)}% author diversity`,
        timestamp: new Date(),
        impact: metrics.commits.score > 70 ? 'high' : metrics.commits.score > 40 ? 'medium' : 'low',
        metrics: {
          additions: Math.floor(metrics.commits.frequency * 100),
          deletions: Math.floor(metrics.commits.frequency * 50),
          files: Math.floor(metrics.commits.count / 3)
        }
      });
    }

    // Add PR activity
    if (metrics.pullRequests.count > 0) {
      newActivities.push({
        id: 'pr-' + Date.now(),
        type: 'pr',
        project: 'Repository',
        description: `${metrics.pullRequests.merged} merged PRs with ${Math.floor(metrics.pullRequests.reviewEngagement)} reviews per PR`,
        timestamp: new Date(),
        impact: metrics.pullRequests.score > 70 ? 'high' : metrics.pullRequests.score > 40 ? 'medium' : 'low',
        metrics: {
          reviewers: Math.floor(metrics.pullRequests.reviewEngagement)
        }
      });
    }

    // Add deployment activity if we have high scores
    if (metrics.commits.score > 80 || metrics.pullRequests.score > 80) {
      newActivities.push({
        id: 'deployment-' + Date.now(),
        type: 'deployment',
        project: 'Repository',
        description: 'High-impact changes detected with significant improvements',
        timestamp: new Date(),
        impact: 'high'
      });
    }

    setActivities(newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [metrics]);

  const getImpactColor = (impact: ActivityItem['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-near-green/10 text-near-green border-near-green/20';
      case 'medium':
        return 'bg-near-purple/10 text-near-purple border-near-purple/20';
      case 'low':
        return 'bg-near-blue/10 text-near-blue border-near-blue/20';
    }
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-5 h-5 text-near-purple" />;
      case 'pr':
        return <GitPullRequest className="w-5 h-5 text-near-green" />;
      case 'deployment':
        return <Box className="w-5 h-5 text-near-blue" />;
    }
  };

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (error) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/20 rounded-lg">
              <Activity className="w-6 h-6 text-near-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Developer Activity</h2>
              <p className="text-sm text-gray-400">Real-time project updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-near-green animate-pulse"></span>
            <span className="text-sm text-gray-400">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 rounded-lg border border-white/10 p-4 hover:border-near-purple/20 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <Tooltip content={`${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`}>
                    <div className="p-2 rounded-lg bg-white/5">
                      {getIcon(activity.type)}
                    </div>
                  </Tooltip>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-white truncate hover:text-near-purple transition-colors">
                          {activity.project}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-gray-400">
                          {formatTime(activity.timestamp)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(activity.impact)}`}>
                          {activity.impact} impact
                        </span>
                      </div>
                    </div>

                    {activity.metrics && (
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                        {activity.type === 'commit' && (
                          <>
                            <Tooltip content="Lines added">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-near-green" />
                                +{activity.metrics.additions}
                              </div>
                            </Tooltip>
                            <Tooltip content="Lines removed">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-near-red rotate-180" />
                                -{activity.metrics.deletions}
                              </div>
                            </Tooltip>
                            <Tooltip content="Files changed">
                              <div className="flex items-center gap-1">
                                <Box className="w-4 h-4" />
                                {activity.metrics.files}
                              </div>
                            </Tooltip>
                          </>
                        )}
                        {activity.type === 'pr' && activity.metrics.reviewers && (
                          <Tooltip content="Reviewers assigned">
                            <div className="flex items-center gap-1">
                              <GitPullRequest className="w-4 h-4" />
                              {activity.metrics.reviewers} reviewers
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
