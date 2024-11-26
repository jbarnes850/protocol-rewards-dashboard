export const REWARD_TIERS = [
  {
    name: 'Maximum Impact',
    minPoints: 90,
    maxPoints: 100,
    usdReward: 10000,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    name: 'High Impact',
    minPoints: 80,
    maxPoints: 89,
    usdReward: 7500,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'Significant Impact',
    minPoints: 70,
    maxPoints: 79,
    usdReward: 5000,
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
  {
    name: 'Growing Impact',
    minPoints: 60,
    maxPoints: 69,
    usdReward: 2500,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
  {
    name: 'Good Progress',
    minPoints: 50,
    maxPoints: 59,
    usdReward: 1000,
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    name: 'Early Traction',
    minPoints: 40,
    maxPoints: 49,
    usdReward: 500,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
  },
  {
    name: 'Getting Started',
    minPoints: 25,
    maxPoints: 39,
    usdReward: 250,
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
  },
] as const;

export const MONTHLY_POOL_LIMIT = 25000;
export const MINIMUM_SCORE_REQUIRED = 25;
export const CURRENT_NEAR_PRICE = 5; // Mock NEAR price in USD