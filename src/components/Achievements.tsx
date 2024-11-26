import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Trophy, Target, Rocket } from 'lucide-react';

const achievements = [
  {
    id: 1,
    title: 'First Contribution',
    description: 'Made your first contribution to the NEAR ecosystem',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    earned: true,
    date: '2024-02-15',
  },
  {
    id: 2,
    title: 'Impact Maker',
    description: 'Contributions affected over 10,000 users',
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    earned: true,
    date: '2024-02-28',
  },
  {
    id: 3,
    title: 'Elite Developer',
    description: 'Reached Elite tier in the rewards program',
    icon: Trophy,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    earned: true,
    date: '2024-03-10',
  },
  {
    id: 4,
    title: 'Protocol Pioneer',
    description: 'Deployed 5 smart contracts to mainnet',
    icon: Rocket,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    earned: false,
    progress: 80,
  },
];

export const Achievements: React.FC = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Achievements</h2>
        <span className="text-sm text-gray-400">
          {achievements.filter(a => a.earned).length}/{achievements.length} Earned
        </span>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg ${achievement.earned ? 'bg-white/5' : 'bg-white/5 opacity-50'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{achievement.title}</h3>
                  {achievement.earned ? (
                    <span className="text-xs text-gray-400">{achievement.date}</span>
                  ) : (
                    <span className="text-xs text-gray-400">{achievement.progress}% Complete</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                {!achievement.earned && (
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};