import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { Link } from 'react-router-dom';

interface Project {
  name: string;
  description: string;
  momentum: {
    recentActivity: number;
    growthRate: number;
    contributors: number;
    openOpportunities: number;
  };
  tags: string[];
  impact: 'high' | 'growing' | 'emerging';
}

const projects: Project[] = [
  {
    name: 'horizon-sdk',
    description: 'Developer toolkit and APIs',
    momentum: {
      recentActivity: 92,
      growthRate: 156,
      contributors: 18,
      openOpportunities: 45,
    },
    tags: ['developer-tools'],
    impact: 'high',
  },
  {
    name: 'quantum-relay',
    description: 'High-performance networking layer',
    momentum: {
      recentActivity: 85,
      growthRate: 123,
      contributors: 12,
      openOpportunities: 23,
    },
    tags: ['networking'],
    impact: 'growing',
  },
  {
    name: 'aurora-bridge',
    description: 'Cross-chain interoperability protocol',
    momentum: {
      recentActivity: 78,
      growthRate: 95,
      contributors: 8,
      openOpportunities: 15,
    },
    tags: ['infrastructure'],
    impact: 'growing',
  },
  {
    name: 'nebula-vault',
    description: 'Smart contract security framework',
    momentum: {
      recentActivity: 82,
      growthRate: 110,
      contributors: 14,
      openOpportunities: 28,
    },
    tags: ['security'],
    impact: 'high',
  },
];

export function ProjectOverview() {
  return (
    <div className="mt-16 mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Top Projects</h2>
          <p className="text-sm text-gray-400 mt-1">
            Most active projects in the ecosystem
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map(project => (
          <motion.div
            key={project.name}
            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-near-purple/40 transition-colors"
            whileHover={{ scale: 1.02 }}
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
                      Activity
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-near-green text-sm">
                        +{project.momentum.growthRate}%
                      </span>
                    </div>
                  </div>
                </Tooltip>

                <div className="flex items-center justify-between">
                  <Tooltip content="Active contributors">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      {project.momentum.contributors} Contributors
                    </div>
                  </Tooltip>

                  <Tooltip content="Open opportunities">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <GitPullRequest className="w-4 h-4" />
                      {project.momentum.openOpportunities}
                    </div>
                  </Tooltip>
                </div>
              </div>

              <Link
                to={`/projects/${project.name}`}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-near-purple/10 
                         text-near-purple rounded-lg hover:bg-near-purple/20 transition-colors text-sm"
              >
                View Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}