import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, GitCommit, GitPullRequest, Box, TrendingUp, User } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useMetrics } from '../providers/MetricsProvider';
import { ProcessedMetrics } from '../types/metrics';

interface ActivityItem {
  id: string;
  type: 'commit' | 'pr' | 'review' | 'issue';
  title: string;
  description: string;
  timestamp: Date;
  impact: number;
  metrics?: {
    additions?: number;
    deletions?: number;
    files?: number;
    comments?: number;
  };
  url: string;
  user: {
    login: string;
  };
}

interface ActivityIconProps {
  type: ActivityItem['type'];
}

const ActivityIcon = React.memo<ActivityIconProps>(({ type }) => {
  const icon = useMemo(() => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-5 h-5 text-near-purple" />;
      case 'pr':
        return <GitPullRequest className="w-5 h-5 text-near-green" />;
      case 'review':
        return <Activity className="w-5 h-5 text-near-blue" />;
      case 'issue':
        return <Box className="w-5 h-5 text-near-red" />;
    }
  }, [type]);

  return (
    <Tooltip content={`${type.charAt(0).toUpperCase() + type.slice(1)}`}>
      <div className="p-2 rounded-lg bg-white/5">
        {icon}
      </div>
    </Tooltip>
  );
});

ActivityIcon.displayName = 'ActivityIcon';

interface ActivityMetricsProps {
  type: ActivityItem['type'];
  metrics: NonNullable<ActivityItem['metrics']>;
}

const ActivityMetrics = React.memo<ActivityMetricsProps>(({ type, metrics }) => {
  if (!metrics) return null;

  return (
    <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
      {type === 'commit' && (
        <>
          <Tooltip content="Lines added">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-near-green" />
              +{metrics.additions}
            </div>
          </Tooltip>
          <Tooltip content="Lines deleted">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-near-red" />
              -{metrics.deletions}
            </div>
          </Tooltip>
          <Tooltip content="Files changed">
            <div className="flex items-center gap-1">
              <Box className="w-4 h-4" />
              {metrics.files} files
            </div>
          </Tooltip>
        </>
      )}
      {(type === 'pr' || type === 'review') && metrics.comments && (
        <Tooltip content="Comments">
          <div className="flex items-center gap-1">
            <GitPullRequest className="w-4 h-4" />
            {metrics.comments} comments
          </div>
        </Tooltip>
      )}
    </div>
  );
});

ActivityMetrics.displayName = 'ActivityMetrics';

interface ActivityItemProps {
  activity: ActivityItem;
  formatTime: (date: Date) => string;
  getImpactColor: (impact: number) => string;
}

const ActivityItemComponent = React.memo<ActivityItemProps>(({ activity, formatTime, getImpactColor }) => (
  <motion.a
    href={activity.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    className="block bg-white/5 rounded-lg border border-white/10 p-4 hover:border-near-purple/20 transition-all duration-200"
  >
    <div className="flex items-start gap-4">
      <ActivityIcon type={activity.type} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-near-purple">
                {activity.user.login}
              </span>
              <span className="text-gray-400">in</span>
              <span className="font-medium text-white truncate hover:text-near-purple transition-colors">
                {activity.title}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {activity.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm text-gray-400">
              {formatTime(activity.timestamp)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(activity.impact)}`}>
              Impact: {activity.impact}
            </span>
          </div>
        </div>

        {activity.metrics && (
          <ActivityMetrics type={activity.type} metrics={activity.metrics} />
        )}
      </div>
    </div>
  </motion.a>
));

ActivityItemComponent.displayName = 'ActivityItemComponent';

export function ActivityFeed() {
  const { metrics, loading, error } = useMetrics();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const processMetricsToActivities = useCallback((newMetrics: ProcessedMetrics) => {
    const newActivities: ActivityItem[] = [];

    // Process network activity (all participants)
    if (newMetrics.network?.activity) {
      // Process commits from all users
      newMetrics.network.activity.commits?.forEach(commit => {
        newActivities.push({
          id: commit.sha,
          type: 'commit',
          title: commit.repo,
          description: commit.message,
          timestamp: new Date(commit.timestamp),
          impact: commit.score || 0,
          metrics: {
            additions: commit.additions,
            deletions: commit.deletions,
            files: commit.files
          },
          url: commit.url,
          user: {
            login: commit.author.login
          }
        });
      });

      // Process pull requests from all users
      newMetrics.network.activity.pullRequests?.forEach(pr => {
        newActivities.push({
          id: pr.id,
          type: 'pr',
          title: pr.repo,
          description: pr.title,
          timestamp: new Date(pr.timestamp),
          impact: pr.score || 0,
          metrics: {
            comments: pr.comments
          },
          url: pr.url,
          user: {
            login: pr.author.login
          }
        });
      });

      // Process reviews from all users
      newMetrics.network.activity.reviews?.forEach(review => {
        newActivities.push({
          id: review.id,
          type: 'review',
          title: review.repo,
          description: `Reviewed PR: ${review.prTitle}`,
          timestamp: new Date(review.timestamp),
          impact: review.score || 0,
          metrics: {
            comments: review.comments
          },
          url: review.url,
          user: {
            login: review.author.login
          }
        });
      });
    }

    // Sort by timestamp
    return newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  useEffect(() => {
    if (metrics && metrics.collectionTimestamp > lastUpdate) {
      const newActivities = processMetricsToActivities(metrics);
      setActivities(prev => {
        // Merge new activities with existing ones, removing duplicates
        const combined = [...newActivities, ...prev];
        const unique = combined.filter((item, index) => 
          combined.findIndex(i => i.id === item.id) === index
        );
        return unique.slice(0, 10); // Keep only the 10 most recent activities
      });
      setLastUpdate(metrics.collectionTimestamp);
    }
  }, [metrics, lastUpdate, processMetricsToActivities]);

  const getImpactColor = useCallback((impact: number) => {
    if (impact >= 8) return 'bg-near-green/10 text-near-green border-near-green/20';
    if (impact >= 5) return 'bg-near-purple/10 text-near-purple border-near-purple/20';
    return 'bg-near-blue/10 text-near-blue border-near-blue/20';
  }, []);

  const formatTime = useCallback((date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-lg"></div>
            <div>
              <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="text-red-400">
          Failed to load activity feed. Please try again later.
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
              <h2 className="text-2xl font-bold">Community Activity</h2>
              <p className="text-sm text-gray-400">Live feed of all developer contributions</p>
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
              <ActivityItemComponent
                key={activity.id}
                activity={activity}
                formatTime={formatTime}
                getImpactColor={getImpactColor}
              />
            ))}
          </AnimatePresence>

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No recent activity to show. Be the first to contribute!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}