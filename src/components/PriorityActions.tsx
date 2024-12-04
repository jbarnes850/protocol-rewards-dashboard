import { ArrowRight, GitPullRequest, Code, Star, MessageSquare } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useMetrics } from '../providers/MetricsProvider';

interface Action {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: any;
  impact: string;
  priority: number;
}

export function PriorityActions() {
  const { metrics, loading, error } = useMetrics();

  const getPersonalizedActions = (metrics: any): Action[] => {
    const actions: Action[] = [];

    // Add PR review action if there are pending reviews
    if (metrics?.github.reviews.count < 10) {
      actions.push({
        id: 'review-prs',
        title: 'Review Pull Requests',
        description: 'Help the community by reviewing open pull requests',
        link: 'https://github.com/pulls/review-requested',
        icon: GitPullRequest,
        impact: '+10 points',
        priority: 1
      });
    }

    // Suggest code contributions if commit count is low
    if (metrics?.github.commits.count < 20) {
      actions.push({
        id: 'contribute-code',
        title: 'Contribute Code',
        description: 'Make code contributions to increase your impact',
        link: 'https://github.com/issues',
        icon: Code,
        impact: '+15 points',
        priority: 2
      });
    }

    // Encourage documentation if score is high but documentation contributions are low
    if (metrics?.score.total > 70 && !metrics?.metadata.hasDocContributions) {
      actions.push({
        id: 'improve-docs',
        title: 'Improve Documentation',
        description: 'Help others by improving project documentation',
        link: '/docs',
        icon: MessageSquare,
        impact: '+8 points',
        priority: 3
      });
    }

    // Suggest project maintenance for high-impact contributors
    if (metrics?.score.total > 85) {
      actions.push({
        id: 'maintain-project',
        title: 'Project Maintenance',
        description: 'Help maintain the project and mentor others',
        link: '/contribute',
        icon: Star,
        impact: '+20 points',
        priority: 4
      });
    }

    // Sort by priority
    return actions.sort((a, b) => a.priority - b.priority);
  };

  if (loading) {
    return (
      <div className="dashboard-card p-6 relative overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card p-6">
        <div className="text-red-400">
          Failed to load recommended actions. Please try again later.
        </div>
      </div>
    );
  }

  const actions = getPersonalizedActions(metrics);

  return (
    <div className="dashboard-card p-6 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-near-purple/10 via-transparent to-near-green/10 
                   opacity-75 pointer-events-none"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommended Actions</h2>
          <Tooltip content="AI-powered recommendations based on your activity">
            <div className="px-3 py-1.5 bg-near-purple/10 rounded-full border border-near-purple/20">
              <span className="text-sm text-near-purple">AI Powered</span>
            </div>
          </Tooltip>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.link}
              className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm rounded-lg 
                       hover:bg-white/10 transition-colors group border border-white/5 hover:border-near-purple/20"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-near-purple/10 rounded-lg">
                  <action.icon className="w-5 h-5 text-near-purple" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tooltip content="Estimated impact on your score">
                  <span className="text-sm text-near-green">{action.impact}</span>
                </Tooltip>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-near-purple transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 