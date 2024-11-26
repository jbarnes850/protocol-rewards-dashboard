export interface DeveloperActivity {
  commits: number;
  prs: number;
  deployments: number;
  timestamp: string;
}

export interface RewardData {
  amount: number;
  timestamp: string;
  category: 'code' | 'review' | 'deployment';
}

export interface GlobalActivity {
  id: string;
  location: [number, number, number];
  type: 'commit' | 'pr' | 'deployment';
  intensity: number;
}