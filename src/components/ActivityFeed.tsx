import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, GitCommit, GitPullRequest, Box, TrendingUp } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

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

const mockProjects = [
  {
    name: 'quantum-relay',
    description: 'High-performance networking layer',
  },
  {
    name: 'aurora-bridge',
    description: 'Cross-chain interoperability protocol',
  },
  {
    name: 'horizon-sdk',
    description: 'Developer toolkit and APIs',
  },
  {
    name: 'nebula-vault',
    description: 'Smart contract security framework',
  },
  {
    name: 'prism-indexer',
    description: 'Data indexing and querying service',
  }
];

const mockDescriptions = {
  commit: [
    'Optimized validator node performance',
    'Enhanced cross-shard messaging',
    'Improved state sync mechanism',
    'Updated consensus checkpointing',
    'Implemented adaptive gas pricing'
  ],
  pr: [
    'Added zero-knowledge proof validation',
    'Implemented sharded storage',
    'Enhanced validator selection algorithm',
    'Improved cross-contract calls',
    'Added dynamic resharding support'
  ],
  deployment: [
    'Deployed contract updates to mainnet',
    'Released new validator node version',
    'Updated protocol parameters',
    'Deployed security patches',
    'Released performance optimizations'
  ]
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Generate initial activities
    const generateActivity = (): ActivityItem => {
      const type = ['commit', 'pr', 'deployment'][Math.floor(Math.random() * 3)] as ActivityItem['type'];
      const project = mockProjects[Math.floor(Math.random() * mockProjects.length)];
      const descriptions = mockDescriptions[type];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        project: project.name,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as ActivityItem['impact'],
        metrics: {
          additions: Math.floor(Math.random() * 500),
          deletions: Math.floor(Math.random() * 200),
          files: Math.floor(Math.random() * 10),
          reviewers: Math.floor(Math.random() * 5),
        },
      };
    };

    setActivities(Array.from({ length: 5 }, generateActivity));

    // Add new activity every 5 seconds
    const interval = setInterval(() => {
      setActivities(prev => [generateActivity(), ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
                        <Tooltip content={mockProjects.find(p => p.name === activity.project)?.description || ''}>
                          <h3 className="font-medium text-white truncate hover:text-near-purple transition-colors">
                            {activity.project}
                          </h3>
                        </Tooltip>
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