import React, { useEffect, useState } from 'react';
import { Activity, Users, GitPullRequest, Star, Code, Target, Coins } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

// API Constants
const GITHUB_API = 'https://api.github.com';
const NEAR_ENDPOINTS = {
  stats: import.meta.env.VITE_NEAR_INDEXER_URL,
  indexer: import.meta.env.VITE_NEAR_INDEXER_URL,
  rpc: import.meta.env.VITE_NEAR_RPC_URL
};

interface NetworkMetrics {
  totalRewardsDistributed: number;
  activeContributors: number;
  totalStars: number;
  openPRs: number;
  totalContributions: number;
}

const fetchGitHubMetrics = async () => {
  try {
    console.log('Fetching GitHub metrics...');
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    };

    // Get all NEAR repos
    const reposResponse = await fetch(`${GITHUB_API}/orgs/near/repos?per_page=100`, { headers });
    if (!reposResponse.ok) {
      throw new Error(`GitHub repos API error: ${reposResponse.status}`);
    }
    const repos = await reposResponse.json();

    // Get active contributors
    const contributorsResponse = await fetch(`${GITHUB_API}/orgs/near/members?per_page=100`, { headers });
    if (!contributorsResponse.ok) {
      throw new Error(`GitHub contributors API error: ${contributorsResponse.status}`);
    }
    const contributors = await contributorsResponse.json();

    // Get open PRs
    const prsResponse = await fetch(
      `${GITHUB_API}/search/issues?q=org:near+type:pr+state:open`,
      { headers }
    );
    if (!prsResponse.ok) {
      throw new Error(`GitHub PRs API error: ${prsResponse.status}`);
    }
    const prs = await prsResponse.json();

    const totalStars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);

    return {
      activeContributors: contributors.length,
      totalStars,
      openPRs: prs.total_count,
      totalContributions: repos.reduce((acc: number, repo: any) => acc + repo.open_issues_count + repo.forks_count, 0)
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw error;
  }
};

export function NetworkStats() {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalRewardsDistributed: 50000, // Mock data
    activeContributors: 0,
    totalStars: 0,
    openPRs: 0,
    totalContributions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch GitHub metrics
        const githubData = await fetchGitHubMetrics();
        console.log('GitHub data:', githubData);

        setMetrics({
          totalRewardsDistributed: 50000, // Mock data
          activeContributors: githubData.activeContributors || 0,
          totalStars: githubData.totalStars || 0,
          openPRs: githubData.openPRs || 0,
          totalContributions: githubData.totalContributions || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to fetch metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        <h2 className="text-lg font-semibold">Protocol Rewards Overview</h2>
        <span className="text-sm text-near-green flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-near-green animate-pulse"></span>
          Live
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