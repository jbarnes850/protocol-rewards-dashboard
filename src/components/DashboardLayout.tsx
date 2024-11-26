import React from 'react';
import { Outlet } from 'react-router-dom';
import { PersonalProgress } from './PersonalProgress';
import { RewardProgress } from './RewardProgress';
import { PriorityActions } from './PriorityActions';

export function DashboardLayout() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <PersonalProgress />
        <RewardProgress />
        <PriorityActions />
        <Outlet />
      </div>
    </div>
  );
} 