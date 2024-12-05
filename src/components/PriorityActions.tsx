import React from 'react';
import { Target, GitPullRequest, Code, Users, ArrowRight } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useRewards } from '../hooks/useRewards';
import { Link } from 'react-router-dom';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  icon: React.ElementType;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

export function PriorityActions() {
  const { rewards } = useRewards();
  
  const getPersonalizedActions = (): ActionItem[] => {
    // Simple logic to prioritize actions based on user's current metrics
    // This could be enhanced with Claude API if needed
    const baseActions: ActionItem[] = [
      {
        id: 'review-prs',
        title: 'Review Open PRs',
        description: 'High-impact PRs need review in quantum-relay',
        impact: '+15 points',
        icon: GitPullRequest,
        link: '/repos/quantum-relay/pulls',
        priority: 'high'
      },
      {
        id: 'code-quality',
        title: 'Improve Code Quality',
        description: 'Refactor identified areas in horizon-sdk',
        impact: '+20 points',
        icon: Code,
        link: '/repos/horizon-sdk/issues',
        priority: 'medium'
      },
      {
        id: 'community',
        title: 'Help Community',
        description: 'Answer questions in Discord support channel',
        impact: '+10 points',
        icon: Users,
        link: '/community/discord',
        priority: 'medium'
      }
    ];

    return baseActions.sort((a, b) => 
      a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
    );
  };

  const actions = getPersonalizedActions();

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
            <Link
              key={action.id}
              to={action.link}
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 