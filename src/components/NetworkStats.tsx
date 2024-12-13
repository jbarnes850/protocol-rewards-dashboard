import { useEffect, useState } from 'react';
import { Activity, Users, GitPullRequest, Star, Coins } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { useAuth } from '../providers/AuthProvider';
import { GitHubAuth } from '../lib/github-auth';

// API Constants
const GITHUB_API = 'https://api.github.com';

interface NetworkMetrics {
  totalRewardsDistributed: number;
  activeContributors: number;
  totalStars: number;
  openPRs: number;
  totalContributions: number;
  isPrivateRepo: boolean;
  trackedRepo: string | null;
  repoMetrics?: {
    stars: number;
    openIssues: number;
    forks: number;
  };
}

const fetchGitHubMetrics = async (auth: GitHubAuth) => {
  try {
    console.log('Fetching GitHub metrics...');
    const token = auth.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json'
    };

    // Get tracked repository first
    const trackedRepo = auth.getTrackedRepository();
    let repoMetrics = null;
    const repoFullName = trackedRepo?.full_name || null;

    if (repoFullName) {
      // Fetch private repo metrics if we have access
      if (auth.hasScope('repo')) {
        const repoResponse = await fetch(`${GITHUB_API}/repos/${repoFullName}`, { headers });
        if (repoResponse.ok) {
          const repo = await repoResponse.json();
          repoMetrics = {
            stars: repo.stargazers_count,
            openIssues: repo.open_issues_count,
            forks: repo.forks_count
          };
        }
      } else {
        console.log('Private repo access not granted');
      }
    }

    // Get active contributors
    const contributorsResponse = await fetch(`${GITHUB_API}/orgs/near/members?per_page=100`, { headers });
    if (!contributorsResponse.ok) {
      if (contributorsResponse.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`GitHub contributors API error: ${contributorsResponse.status}`);
    }
    const contributors = await contributorsResponse.json();

    // Get open PRs
    const prsQuery = repoFullName
      ? `repo:${repoFullName}+type:pr+state:open`
      : `org:near+type:pr+state:open`;
    const prsResponse = await fetch(
      `${GITHUB_API}/search/issues?q=${prsQuery}`,
      { headers }
    );
    if (!prsResponse.ok) {
      throw new Error(`GitHub PRs API error: ${prsResponse.status}`);
    }
    const prs = await prsResponse.json();

    return {
      activeContributors: contributors.length,
      totalStars: repoMetrics ? repoMetrics.stars : 0,
      openPRs: prs.total_count,
      totalContributions: repoMetrics
        ? repoMetrics.openIssues + repoMetrics.forks
        : 0,
      isPrivateRepo: !!repoMetrics,
      trackedRepo: repoFullName,
      repoMetrics: repoMetrics ? {
        stars: repoMetrics.stars,
        openIssues: repoMetrics.openIssues,
        forks: repoMetrics.forks
      } : undefined
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw error;
  }
};

export function NetworkStats() {
  const { user } = useAuth();
  const auth = GitHubAuth.getInstance();
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalRewardsDistributed: 50000, // Mock data
    activeContributors: 0,
    totalStars: 0,
    openPRs: 0,
    totalContributions: 0,
    isPrivateRepo: false,
    trackedRepo: null,
    repoMetrics: undefined
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) {
        setError('Please connect your GitHub account to view metrics.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch GitHub metrics
        const githubData = await fetchGitHubMetrics(auth);
        console.log('GitHub data:', githubData);

        setMetrics({
          totalRewardsDistributed: 50000, // Mock data
          activeContributors: githubData.activeContributors || 0,
          totalStars: githubData.totalStars || 0,
          openPRs: githubData.openPRs || 0,
          totalContributions: githubData.totalContributions || 0,
          isPrivateRepo: githubData.isPrivateRepo,
          trackedRepo: githubData.trackedRepo,
          repoMetrics: githubData.repoMetrics
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        const isAuthError = error instanceof Error &&
          (error.message.includes('401') || error.message.includes('Authentication required'));
        setError(
          isAuthError
            ? 'Please connect your GitHub account to view metrics.'
            : 'Failed to fetch metrics. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, auth]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {metrics.trackedRepo ? (
            <>Repository Metrics: {metrics.trackedRepo}</>
          ) : (
            <>Protocol Rewards Overview</>
          )}
        </h2>
        <span className="text-sm text-near-green flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-near-green animate-pulse"></span>
          Live {metrics.isPrivateRepo && '(Private Repository)'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Tooltip content="Total rewards available in the current program period">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/10 rounded-lg">
              <Coins className="w-4 h-4 text-near-purple" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Available Pool</div>
              <div className="font-medium">${(metrics.totalRewardsDistributed / 1000).toFixed(1)}K</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Active developers participating in Protocol Rewards">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-green/10 rounded-lg">
              <Users className="w-4 h-4 text-near-green" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Builders</div>
              <div className="font-medium">{metrics.activeContributors}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Total GitHub stars across eligible repositories">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-blue/10 rounded-lg">
              <Star className="w-4 h-4 text-near-blue" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Project Stars</div>
              <div className="font-medium">{metrics.totalStars}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Open pull requests eligible for rewards">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-red/10 rounded-lg">
              <GitPullRequest className="w-4 h-4 text-near-red" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Reward PRs</div>
              <div className="font-medium">{metrics.openPRs}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Total contributions eligible for rewards this period">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/10 rounded-lg">
              <Activity className="w-4 h-4 text-near-purple" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Impact</div>
              <div className="font-medium">{metrics.totalContributions}</div>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
} 