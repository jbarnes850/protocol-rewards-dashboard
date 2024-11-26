import { useState, useEffect } from 'react';
import type { RewardData } from '../types';

export const useRewardsData = () => {
  const [data, setData] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with 24 hours of mock data
    const initialData: RewardData[] = Array.from({ length: 24 }, (_, i) => ({
      amount: Math.floor(Math.random() * 1000) + 500,
      timestamp: `${i}:00`,
      category: ['code', 'review', 'deployment'][Math.floor(Math.random() * 3)] as RewardData['category'],
    }));

    setData(initialData);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(current => {
        const newEntry: RewardData = {
          amount: Math.floor(Math.random() * 1000) + 500,
          timestamp: new Date().getHours() + ':00',
          category: ['code', 'review', 'deployment'][Math.floor(Math.random() * 3)] as RewardData['category'],
        };
        return [...current.slice(1), newEntry];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading };
};