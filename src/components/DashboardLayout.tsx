import React from 'react';
import { Outlet } from 'react-router-dom';
import { PersonalProgress } from './PersonalProgress';
import { RewardProgress } from './RewardProgress';
import { PriorityActions } from './PriorityActions';
import { SEO } from './SEO';

export function DashboardLayout() {
  return (
    <>
      <SEO 
        title="Developer Dashboard"
        description="Track your contributions, monitor rewards, and view your impact on the NEAR Protocol ecosystem."
        pathname="/dashboard"
      />
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <PersonalProgress />
          <RewardProgress />
          <PriorityActions />
          <Outlet />
        </div>
      </div>
    </>
  );
} 