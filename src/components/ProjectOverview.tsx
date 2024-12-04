import { motion } from 'framer-motion';
import { GitPullRequest, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { Link } from 'react-router-dom';
import { useMetrics } from '../providers/MetricsProvider';
import { ProcessedMetrics } from '../types/metrics';

interface Project {
  name: string;
  description: string;
  metrics: ProcessedMetrics;
  tags: string[];
  impact: 'high' | 'growing' | 'emerging';
}

export function ProjectOverview() {
  const { metrics, loading, error } = useMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-white/5 rounded-xl p-6 border border-white/10 animate-pulse"
          >
            <div className="h-6 bg-white/10 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 bg-white/10 rounded"></div>
              <div className="h-8 bg-white/10 rounded"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        Failed to load project metrics. Please try again later.
      </div>
    );
  }

  // Calculate project impact based on metrics
  const getProjectImpact = (score: number): 'high' | 'growing' | 'emerging' => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'growing';
    return 'emerging';
  };

  // Get growth rate from metrics history
  const getGrowthRate = (metrics: ProcessedMetrics) => {
    const currentScore = metrics.score.total;
    const previousScore = metrics.metadata.previousScore || 0;
    return previousScore > 0 
      ? Math.round(((currentScore - previousScore) / previousScore) * 100)
      : 0;
  };

  const project: Project = {
    name: metrics?.metadata.projectId || 'Unknown Project',
    description: metrics?.metadata.description || 'Project description not available',
    metrics: metrics!,
    tags: metrics?.metadata.tags || [],
    impact: getProjectImpact(metrics?.score.total || 0),
  };

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-near-purple/40 transition-colors"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium">{project.name}</h3>
            {project.impact === 'high' && (
              <span className="px-2 py-0.5 text-xs bg-near-purple/20 text-near-purple rounded-full">
                High Impact
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {project.description}
          </p>
        </div>

        <div className="space-y-4 flex-grow">
          <Tooltip content="Recent contribution momentum">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4" />
                Activity Score
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-near-green text-sm">
                  +{getGrowthRate(project.metrics)}%
                </span>
              </div>
            </div>
          </Tooltip>

          <div className="flex items-center justify-between">
            <Tooltip content="Active contributors">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                {project.metrics.metadata.contributors || 0} Contributors
              </div>
            </Tooltip>

            <Tooltip content="Pull requests">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <GitPullRequest className="w-4 h-4" />
                {project.metrics.github.pullRequests.merged || 0} PRs
              </div>
            </Tooltip>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-white/5 rounded-full text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to={`/projects/${project.name}`}
                className="flex items-center gap-1 text-near-purple hover:text-near-purple/80 transition-colors"
              >
                <span className="text-sm">View Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}