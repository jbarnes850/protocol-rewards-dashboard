import { useState, useEffect } from 'react';
import type { DeveloperActivity } from '../types';

const mockActivityData: DeveloperActivity[] = [
  { commits: 120, prs: 45, deployments: 12, timestamp: '2024-W1' },
  { commits: 150, prs: 52, deployments: 15, timestamp: '2024-W2' },
  { commits: 180, prs: 60, deployments: 18, timestamp: '2024-W3' },
  { commits: 210, prs: 75, deployments: 22, timestamp: '2024-W4' },
];

export const useActivityData = () => {
  const [data, setData] = useState<DeveloperActivity[]>(mockActivityData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate WebSocket updates
    const interval = setInterval(() => {
      setData(current => {
        const lastEntry = current[current.length - 1];
        return [...current.slice(1), {
          commits: lastEntry.commits + Math.floor(Math.random() * 20),
          prs: lastEntry.prs + Math.floor(Math.random() * 5),
          deployments: lastEntry.deployments + Math.floor(Math.random() * 3),
          timestamp: `2024-W${current.length + 1}`,
        }];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading };
};