import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Star, GitPullRequest, TrendingUp } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useMetrics } from '../providers/MetricsProvider';
import { toast } from 'sonner';
import { GitHubRepository, GitHubUser, GitHubSearchResponse } from '../types/github';
import { LucideIcon } from 'lucide-react';

// GitHub API Constants
const GITHUB_API = 'https://api.github.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface GitHubStats {
  activeContributors: number;
  totalStars: number;
  openPRs: number;
  lastUpdated: number;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const StatCard = React.memo<StatCardProps>(({ icon: Icon, label, value, color }) => (
  <Tooltip content={`Current ${label.toLowerCase()}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}/10 rounded-lg`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  </Tooltip>
));

StatCard.displayName = 'StatCard';

export function NetworkStats() {
  const { metrics, loading: metricsLoading, error: metricsError } = useMetrics();
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    activeContributors: 0,
    totalStars: 0,
    openPRs: 0,
    lastUpdated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({ remaining: 0, reset: 0 });

  const checkRateLimit = useCallback((headers: Headers): RateLimitInfo => {
    return {
      remaining: parseInt(headers.get('x-ratelimit-remaining') || '0', 10),
      reset: parseInt(headers.get('x-ratelimit-reset') || '0', 10) * 1000,
    };
  }, []);

  const shouldRefresh = useCallback((lastUpdated: number) => {
    return Date.now() - lastUpdated > CACHE_DURATION;
  }, []);

  const fetchGitHubStats = useCallback(async () => {
    try {
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub token not found');
      }

      // Check if we should use cached data
      if (!shouldRefresh(githubStats.lastUpdated)) {
        return;
      }

      // Check rate limit before making requests
      if (rateLimit.remaining === 0 && Date.now() < rateLimit.reset) {
        const waitTime = Math.ceil((rateLimit.reset - Date.now()) / 1000 / 60);
        toast.warning(`Rate limit exceeded. Please wait ${waitTime} minutes.`);
        return;
      }

      const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      };

      // Batch requests with Promise.all
      const [membersRes, reposRes, prsRes] = await Promise.all([
        fetch(`${GITHUB_API}/orgs/near/members?per_page=100`, { headers }),
        fetch(`${GITHUB_API}/orgs/near/repos?per_page=100`, { headers }),
        fetch(`${GITHUB_API}/search/issues?q=org:near+type:pr+state:open`, { headers })
      ]);

      // Update rate limit info
      setRateLimit(checkRateLimit(membersRes.headers));

      if (!membersRes.ok || !reposRes.ok || !prsRes.ok) {
        throw new Error('Failed to fetch GitHub data');
      }

      const [members, repos, prs] = await Promise.all([
        membersRes.json() as Promise<GitHubUser[]>,
        reposRes.json() as Promise<GitHubRepository[]>,
        prsRes.json() as Promise<GitHubSearchResponse<any>>
      ]);

      const totalStars = repos.reduce((acc: number, repo) => acc + repo.stargazers_count, 0);

      setGithubStats({
        activeContributors: members.length,
        totalStars,
        openPRs: prs.total_count,
        lastUpdated: Date.now(),
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching GitHub stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch GitHub stats'));
      toast.error('Failed to fetch GitHub stats');
    } finally {
      setLoading(false);
    }
  }, [githubStats.lastUpdated, rateLimit, shouldRefresh, checkRateLimit]);

  useEffect(() => {
    fetchGitHubStats();
    const interval = setInterval(fetchGitHubStats, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchGitHubStats]);

  const formattedMetrics = useMemo(() => ({
    totalRewards: metrics?.totalContributions ? 
      `${(metrics.totalContributions.commits * 10 + 
        metrics.totalContributions.pullRequests * 20 + 
        metrics.totalContributions.reviews * 15).toLocaleString()} Ⓝ` : '0 Ⓝ',
    activeBuilders: githubStats.activeContributors.toLocaleString(),
    projectStars: githubStats.totalStars.toLocaleString(),
    rewardPRs: githubStats.openPRs.toLocaleString()
  }), [metrics?.totalContributions, githubStats]);

  if (loading || metricsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-lg animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-white/10 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || metricsError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        Failed to load network stats. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={TrendingUp}
        label="Total Rewards"
        value={formattedMetrics.totalRewards}
        color="near-purple"
      />
      <StatCard
        icon={Users}
        label="Active Builders"
        value={formattedMetrics.activeBuilders}
        color="near-green"
      />
      <StatCard
        icon={Star}
        label="Project Stars"
        value={formattedMetrics.projectStars}
        color="near-blue"
      />
      <StatCard
        icon={GitPullRequest}
        label="Reward PRs"
        value={formattedMetrics.rewardPRs}
        color="near-red"
      />
    </div>
  );
} 