import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ActivityNode {
  id: string;
  x: number;
  y: number;
  type: 'commit' | 'pr' | 'deployment';
  intensity: number;
  timestamp: number;
  project?: string;
}

// Mock project names for more realistic data
const projects = [
  'near-core',
  'near-api-js',
  'near-wallet',
  'near-explorer',
  'near-cli',
];

// Generate initial mock activities
const generateInitialActivities = (count: number): ActivityNode[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `initial-${i}`,
    x: Math.random() * window.innerWidth,
    y: Math.random() * 400, // Canvas height
    type: ['commit', 'pr', 'deployment'][Math.floor(Math.random() * 3)] as ActivityNode['type'],
    intensity: 0.3 + Math.random() * 0.7, // Minimum intensity of 0.3
    timestamp: Date.now() - Math.random() * 1000 * 60, // Last minute
    project: projects[Math.floor(Math.random() * projects.length)],
  }));
};

export function ActivityVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activities, setActivities] = useState<ActivityNode[]>(generateInitialActivities(20));
  const [hoveredActivity, setHoveredActivity] = useState<ActivityNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with higher resolution
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Handle mouse move for hover effects
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find activity near mouse pointer
      const activity = activities.find(a => {
        const dx = a.x - x;
        const dy = a.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 10;
      });

      setHoveredActivity(activity || null);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections with gradient
      activities.forEach((activity, i) => {
        if (i === 0) return;
        const prev = activities[i - 1];
        
        const gradient = ctx.createLinearGradient(prev.x, prev.y, activity.x, activity.y);
        gradient.addColorStop(0, getActivityColor(prev.type, 0.3));
        gradient.addColorStop(1, getActivityColor(activity.type, 0.3));

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(activity.x, activity.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw activity nodes with glow effect
      activities.forEach((activity) => {
        const isHovered = hoveredActivity?.id === activity.id;
        const radius = isHovered ? 8 : 4 + activity.intensity * 4;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          activity.x, activity.y, 0,
          activity.x, activity.y, radius * 2
        );
        gradient.addColorStop(0, getActivityColor(activity.type, 0.8));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(activity.x, activity.y, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(activity.x, activity.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = getActivityColor(activity.type, 1);
        ctx.fill();

        // Hover effect
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(activity.x, activity.y, radius * 2, 0, Math.PI * 2);
          ctx.strokeStyle = getActivityColor(activity.type, 0.3);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Add new activities periodically
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity: ActivityNode = {
          id: Math.random().toString(),
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          type: ['commit', 'pr', 'deployment'][Math.floor(Math.random() * 3)] as ActivityNode['type'],
          intensity: 0.3 + Math.random() * 0.7,
          timestamp: Date.now(),
          project: projects[Math.floor(Math.random() * projects.length)],
        };
        return [...prev.slice(-49), newActivity];
      });
    }, 2000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, [activities, hoveredActivity]);

  const getActivityColor = (type: ActivityNode['type'], alpha: number = 1) => {
    switch (type) {
      case 'commit':
        return `rgba(0, 236, 151, ${alpha})`; // near-green
      case 'pr':
        return `rgba(151, 151, 255, ${alpha})`; // near-purple
      case 'deployment':
        return `rgba(23, 217, 212, ${alpha})`; // near-blue
      default:
        return `rgba(255, 255, 255, ${alpha})`;
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-near-green" />
          <h2 className="text-2xl font-bold text-white">Ecosystem Activity</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-near-green animate-pulse"></span>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-[400px] rounded-lg bg-near-black"
          style={{ cursor: 'crosshair' }}
        />
        
        {hoveredActivity && (
          <div 
            className="absolute bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-sm text-white"
            style={{
              left: `${hoveredActivity.x + 10}px`,
              top: `${hoveredActivity.y + 10}px`,
              zIndex: 10,
            }}
          >
            <div className="font-medium mb-1">{hoveredActivity.project}</div>
            <div className="text-gray-400">
              {hoveredActivity.type.charAt(0).toUpperCase() + hoveredActivity.type.slice(1)}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-green"></span>
          <span className="text-sm text-gray-400">Commits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-purple"></span>
          <span className="text-sm text-gray-400">Pull Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-blue"></span>
          <span className="text-sm text-gray-400">Deployments</span>
        </div>
      </div>
    </div>
  );
}