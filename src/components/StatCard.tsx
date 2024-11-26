import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  description,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -4 }}
      className="bg-white/5 p-6 rounded-lg backdrop-blur-md border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Icon className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-sm text-green-400 font-medium">{trend}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <div className="text-3xl font-bold text-green-400 mb-2">{value}</div>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
    </motion.div>
  );
};