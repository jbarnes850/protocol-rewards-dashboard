export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ContributorMetrics {
  contributorId: string;
  commits: number;
  additions: number;
  deletions: number;
  pullRequests: {
    opened: number;
    reviewed: number;
    merged: number;
  };
  issues: {
    opened: number;
    closed: number;
    commented: number;
  };
  timestamp: number;
}

export interface ProcessedMetrics {
  repositoryId: string;
  timeframe: 'day' | 'week' | 'month';
  contributors: ContributorMetrics[];
  totalContributions: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
  };
  validation: ValidationResult;
  timestamp: number;
} 