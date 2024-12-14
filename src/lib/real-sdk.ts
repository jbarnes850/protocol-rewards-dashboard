import { GitHubMetrics, NEARMetrics, RewardCalculation, RewardTier } from './types';

interface SDKConfig {
  projectId: string;
  token?: string;
}

interface GitHubGraphQLResponse {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          nodes: Array<{
            committedDate: string;
            author: { email: string };
          }>;
        };
      };
    };
    pullRequests: {
      nodes: Array<{
        state: 'OPEN' | 'MERGED' | 'CLOSED';
        reviews: { totalCount: number };
        comments: { totalCount: number };
      }>;
    };
    issues: {
      nodes: Array<{
        state: 'OPEN' | 'CLOSED';
        comments: { totalCount: number };
        reactions: { totalCount: number };
      }>;
    };
  };
}

export class NEARProtocolRewardsSDK {
  private projectId: string;
  private githubToken: string;

  constructor({ projectId, token }: SDKConfig) {
    this.projectId = projectId;
    this.githubToken = token || '';
  }

  setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  setToken(token: string) {
    this.githubToken = token;
  }

  private async fetchGitHubData(query: string): Promise<{ data: GitHubGraphQLResponse }> {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Error: ${data.errors[0].message}`);
    }

    return data;
  }

  async getMetrics(projectId?: string): Promise<GitHubMetrics> {
    const repoId = projectId || this.projectId;
    const [repoOwner, repoName] = repoId.split('/');

    if (!repoOwner || !repoName) {
      throw new Error('Invalid repository ID format. Expected "owner/name"');
    }

    const query = `
      query {
        repository(owner: "${repoOwner}", name: "${repoName}") {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    committedDate
                    author { email }
                  }
                }
              }
            }
          }
          pullRequests(first: 100, states: [OPEN, MERGED]) {
            nodes {
              state
              reviews { totalCount }
              comments { totalCount }
            }
          }
          issues(first: 100, states: [OPEN, CLOSED]) {
            nodes {
              state
              comments { totalCount }
              reactions { totalCount }
            }
          }
        }
      }
    `;

    const { data } = await this.fetchGitHubData(query);
    const repository = data.repository;

    // Process commit data
    const commits = repository.defaultBranchRef.target.history.nodes;
    const uniqueAuthors = new Set(commits.map(c => c.author.email)).size;

    // Process PR data
    const prs = repository.pullRequests.nodes;
    const mergedPRs = prs.filter(pr => pr.state === 'MERGED').length;
    const totalPRs = prs.length;
    const prEngagement = prs.reduce((sum, pr) =>
      sum + pr.reviews.totalCount + pr.comments.totalCount, 0) / Math.max(totalPRs, 1);

    // Process issue data
    const issues = repository.issues.nodes;
    const closedIssues = issues.filter(issue => issue.state === 'CLOSED').length;
    const issueEngagement = issues.reduce((sum, issue) =>
      sum + issue.comments.totalCount + issue.reactions.totalCount, 0) / Math.max(issues.length, 1);

    return {
      commits: {
        count: commits.length,
        frequency: commits.length / 30, // commits per day over last month
        authorDiversity: uniqueAuthors / Math.max(commits.length, 1),
        score: Math.min((commits.length * uniqueAuthors) / 1000, 100)
      },
      pullRequests: {
        count: totalPRs,
        merged: mergedPRs,
        reviewEngagement: prEngagement,
        score: Math.min((mergedPRs * prEngagement) / 100, 100)
      },
      issues: {
        closed: closedIssues,
        communityEngagement: issueEngagement,
        quality: closedIssues / Math.max(issues.length, 1),
        score: Math.min((closedIssues * issueEngagement) / 100, 100)
      }
    };
  }

  async calculateRewards(githubMetrics: GitHubMetrics, nearMetrics: NEARMetrics): Promise<RewardCalculation> {
    // Calculate GitHub score (70% weight)
    const githubScore = (
      githubMetrics.commits.score * 0.3 +
      githubMetrics.pullRequests.score * 0.4 +
      githubMetrics.issues.score * 0.3
    ) * 0.7;

    // Calculate NEAR score (30% weight)
    const nearScore = (
      nearMetrics.transactions.score * 0.4 +
      nearMetrics.contracts.score * 0.4 +
      nearMetrics.users.score * 0.2
    ) * 0.3;

    const totalScore = githubScore + nearScore;

    // Define reward tiers
    const tiers: RewardTier[] = [
      { name: 'Bronze', minPoints: 0, maxPoints: 30, usdReward: 100, color: '#CD7F32' },
      { name: 'Silver', minPoints: 31, maxPoints: 60, usdReward: 250, color: '#C0C0C0' },
      { name: 'Gold', minPoints: 61, maxPoints: 80, usdReward: 500, color: '#FFD700' },
      { name: 'Platinum', minPoints: 81, maxPoints: 100, usdReward: 1000, color: '#E5E4E2' }
    ];

    // Determine tier
    const tier = tiers.find(t =>
      totalScore >= t.minPoints && totalScore <= t.maxPoints
    ) || tiers[0];

    // Calculate rewards
    const usdAmount = tier.usdReward;
    const nearAmount = usdAmount * 5; // Assuming 1 NEAR = $0.20

    return {
      githubScore,
      nearScore,
      totalScore,
      usdAmount,
      nearAmount,
      tier,
      totalAllocated: usdAmount
    };
  }
}
