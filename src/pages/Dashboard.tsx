import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { RepoSelector } from '../components/RepoSelector';
import { ProjectOverview } from '../components/ProjectOverview';
import { PersonalProgress } from '../components/PersonalProgress';
import { DeveloperMetrics } from '../components/DeveloperMetrics';
import { GetStartedCard } from '../components/GetStartedCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { PriorityActions } from '../components/PriorityActions';
import { Footer } from '../components/Footer';
import { NetworkStats } from '../components/NetworkStats';
import { Spinner } from '../components/ui/Spinner';
import { TestErrorScenarios } from '../components/TestErrorScenarios';
import { toast } from 'sonner';

export function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Handle auth error from callback
  useEffect(() => {
    const authError = location.state?.error;
    if (authError) {
      toast.error(authError);
      // Clear the error from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner className="w-8 h-8 text-blue-500" />
        <div className="text-lg text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  // Show repo selector if user is logged in but hasn't selected a repo
  if (isSignedIn && user && !user.unsafeMetadata?.trackedRepository) {
    return <RepoSelector />;
  }

  return (
    <>
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-6 pb-8 border-b border-white/10">
            <NetworkStats />
            {!isSignedIn && <GetStartedCard />}
            <TestErrorScenarios />
          </div>

          {/* Main Content - Only show when user is authenticated */}
          {isSignedIn && user && (
            <div className="space-y-12">
              <ProjectOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PersonalProgress />
                <DeveloperMetrics />
              </div>
              <PriorityActions />
              <ActivityFeed />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
