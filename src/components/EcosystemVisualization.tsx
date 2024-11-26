import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

// Replace Three.js visualization with a simpler 2D canvas visualization for now
export function EcosystemVisualization() {
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

      <div className="relative h-[600px] rounded-lg overflow-hidden bg-near-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-center"
        >
          <p>Activity visualization is being upgraded.</p>
          <p className="text-sm mt-2">Check back soon for real-time ecosystem insights.</p>
        </motion.div>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-green"></span>
          <span className="text-sm text-gray-400">Smart Contracts</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-purple"></span>
          <span className="text-sm text-gray-400">Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-blue"></span>
          <span className="text-sm text-gray-400">Validators</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-near-red"></span>
          <span className="text-sm text-gray-400">Applications</span>
        </div>
      </div>
    </div>
  );
}