import { useAuth } from '../providers/AuthProvider';
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

export function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Show repo selector if user is logged in but hasn't selected a repo
  if (user && !user.trackedRepository) {
    return <RepoSelector />;
  }

  return (
    <>
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-6 pb-8 border-b border-white/10">
            <NetworkStats />
            {!user && <GetStartedCard />}
            <TestErrorScenarios />
          </div>

          {/* Main Content - Only show when user is authenticated */}
          {user && (
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
