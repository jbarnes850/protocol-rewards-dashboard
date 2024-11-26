import { useRewards } from '../hooks/useRewards';

export const RewardTiers: React.FC = () => {
  const { rewards, nextTierProgress } = useRewards();
  
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-near-purple" 
          style={{ width: `${nextTierProgress}%` }}
        />
      </div>
      <div className="text-sm">
        <span className="text-near-purple">{rewards.currentTier}</span>
        <span className="text-gray-400 mx-1">→</span>
        <span className="text-gray-400">{rewards.nextTier}</span>
      </div>
    </div>
  );
}; 