import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Globe } from './Globe';
import type { GlobalActivity } from '../types';

const generateRandomActivity = (): GlobalActivity => {
  const lat = (Math.random() - 0.5) * 180;
  const lon = (Math.random() - 0.5) * 360;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (180 - lon) * (Math.PI / 180);
  const radius = 1;

  return {
    id: Math.random().toString(36).substr(2, 9),
    location: [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    ],
    type: ['commit', 'pr', 'deployment'][Math.floor(Math.random() * 3)] as GlobalActivity['type'],
    intensity: Math.random(),
  };
};

export const GlobeContainer: React.FC = () => {
  const [activities, setActivities] = useState<GlobalActivity[]>([]);

  useEffect(() => {
    // Initial activities
    setActivities(Array.from({ length: 50 }, generateRandomActivity));

    // Add new activities periodically
    const interval = setInterval(() => {
      setActivities(prev => [...prev.slice(-49), generateRandomActivity()]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-2xl font-bold text-white mb-2">Global Developer Activity</h2>
        <p className="text-gray-400">Real-time visualization of NEAR ecosystem contributions</p>
      </div>
      <Canvas camera={{ position: [0, 0, 2.5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Globe activities={activities} />
        </Suspense>
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};