import React from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export const ContributionHeatmap: React.FC = () => {
  const today = new Date();
  const startDate = subDays(today, 364);
  
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  // Generate more realistic contribution data
  const contributions = days.map(day => {
    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Higher chance of no activity on weekends
    if (isWeekend && Math.random() > 0.3) {
      return { date: format(day, 'yyyy-MM-dd'), count: 0 };
    }

    // Generate realistic activity patterns
    const random = Math.random();
    let count = 0;

    if (random > 0.7) { // 30% chance of activity
      if (random > 0.95) { // 5% chance of high activity
        count = Math.floor(Math.random() * 2) + 4; // 4-5 contributions
      } else if (random > 0.85) { // 10% chance of medium activity
        count = Math.floor(Math.random() * 2) + 2; // 2-3 contributions
      } else { // 15% chance of low activity
        count = 1; // 1 contribution
      }
    }

    return {
      date: format(day, 'yyyy-MM-dd'),
      count
    };
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-near-green/30';
    if (count <= 3) return 'bg-near-green/60';
    return 'bg-near-green';
  };

  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Contribution Activity</span>
          <span className="text-base font-normal text-gray-400">
            {totalContributions} contributions in the last year
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-53 gap-1">
            {contributions.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.001 }}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer 
                  hover:ring-2 hover:ring-white/20 transition-all`}
                title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-sm text-gray-400">Less</span>
          <div className="flex gap-1">
            {['bg-gray-800', 'bg-near-green/30', 'bg-near-green/60', 'bg-near-green'].map((color) => (
              <div key={color} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
          </div>
          <span className="text-sm text-gray-400">More</span>
        </div>
      </CardContent>
    </Card>
  );
};