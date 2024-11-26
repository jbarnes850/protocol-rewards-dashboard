import { GitHubMetrics, NEARMetrics, RewardCalculation, RewardTier } from './types';
import { REWARD_TIERS, MONTHLY_POOL_LIMIT, CURRENT_NEAR_PRICE } from './constants';

export class RewardsCalculator {
  private calculateGitHubScore(metrics: GitHubMetrics): number {
    const commitScore = this.calculateCommitScore(metrics.commits);
    const prScore = this.calculatePRScore(metrics.pullRequests);
    const issueScore = this.calculateIssueScore(metrics.issues);

    return (commitScore * 0.4) + (prScore * 0.3) + (issueScore * 0.3);
  }

  private calculateNEARScore(metrics: NEARMetrics): number {
    const txScore = this.calculateTransactionScore(metrics.transactions);
    const contractScore = this.calculateContractScore(metrics.contracts);
    const userScore = this.calculateUserScore(metrics.users);

    return (txScore * 0.4) + (contractScore * 0.3) + (userScore * 0.3);
  }

  private calculateCommitScore(commits: GitHubMetrics['commits']): number {
    const countScore = Math.min(commits.count / 100, 1) * 100;
    const frequencyScore = commits.frequency * 100;
    const diversityScore = commits.authorDiversity * 100;

    return (countScore * 0.5) + (frequencyScore * 0.25) + (diversityScore * 0.25);
  }

  private calculatePRScore(prs: GitHubMetrics['pullRequests']): number {
    const mergedScore = Math.min(prs.merged / 20, 1) * 100;
    const engagementScore = prs.reviewEngagement * 100;

    return (mergedScore * 0.6) + (engagementScore * 0.4);
  }

  private calculateIssueScore(issues: GitHubMetrics['issues']): number {
    const closedScore = Math.min(issues.closed / 30, 1) * 100;
    const engagementScore = issues.communityEngagement * 100;
    const qualityScore = issues.quality * 100;

    return (closedScore * 0.4) + (engagementScore * 0.3) + (qualityScore * 0.3);
  }

  private calculateTransactionScore(tx: NEARMetrics['transactions']): number {
    const countScore = Math.min(tx.count / 10000, 1) * 100;
    const volumeScore = Math.min(tx.volume / 1000000, 1) * 100;
    const qualityScore = tx.quality * 100;

    return (countScore * 0.4) + (volumeScore * 0.3) + (qualityScore * 0.3);
  }

  private calculateContractScore(contracts: NEARMetrics['contracts']): number {
    const interactionScore = Math.min(contracts.interactions / 1000, 1) * 100;
    const diversityScore = contracts.uniqueCallers * 100;
    const patternScore = contracts.usagePatterns * 100;

    return (interactionScore * 0.4) + (diversityScore * 0.3) + (patternScore * 0.3);
  }

  private calculateUserScore(users: NEARMetrics['users']): number {
    const totalScore = Math.min(users.total / 1000, 1) * 100;
    const retentionScore = users.retention * 100;
    const growthScore = users.growthRate * 100;

    return (totalScore * 0.4) + (retentionScore * 0.3) + (growthScore * 0.3);
  }

  private getTier(score: number): RewardTier {
    return REWARD_TIERS.find(
      tier => score >= tier.minPoints && score <= tier.maxPoints
    ) || REWARD_TIERS[REWARD_TIERS.length - 1];
  }

  calculateRewards(githubMetrics: GitHubMetrics, nearMetrics: NEARMetrics): RewardCalculation {
    const githubScore = this.calculateGitHubScore(githubMetrics);
    const nearScore = this.calculateNEARScore(nearMetrics);
    const totalScore = (githubScore + nearScore) / 2;

    const tier = this.getTier(totalScore);
    const baseUsdReward = Math.pow(totalScore/100, 1.5) * tier.usdReward;
    const finalUsdReward = Math.min(
      Math.max(baseUsdReward, tier.usdReward),
      MONTHLY_POOL_LIMIT
    );

    return {
      githubScore,
      nearScore,
      totalScore,
      usdAmount: finalUsdReward,
      nearAmount: finalUsdReward / CURRENT_NEAR_PRICE,
      tier,
    };
  }
}