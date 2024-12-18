import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Github, Shield, ExternalLink } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useGitHubToken } from '../lib/clerk-github';
import { toast } from 'sonner';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  updated_at: string;
}

interface TrackedRepository {
  name: string;
  private: boolean;
}

export function RepoSelector() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: tokenLoaded } = useGitHubToken();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth states:', {
      userLoaded,
      tokenLoaded,
      hasUser: !!user,
      loading
    });
  }, [userLoaded, tokenLoaded, user, loading]);

  // Only show loading spinner when actually loading
  if (!userLoaded || !tokenLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 
          className="w-8 h-8 animate-spin text-near-purple" 
          role="progressbar"
          aria-label="Initializing..."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Please sign in to continue
      </div>
    );
  }

  // Fetch repositories only if no tracked repository
  const fetchRepos = useCallback(async () => {
    if (!userLoaded || !tokenLoaded || user?.unsafeMetadata?.trackedRepository) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching GitHub token...');
      const token = await getToken();
      if (!token) {
        throw new Error('No GitHub token available');
      }

      console.log('Making GitHub API request...');
      const response = await fetch('https://api.github.com/user/repos?sort=updated&visibility=all&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log(`Found ${data.length} repositories`);
      setRepositories(data);
    } catch (error) {
      console.error('Repository fetch error:', error);
      setError(error instanceof Error ? error.message : String(error));
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, [userLoaded, tokenLoaded, user?.unsafeMetadata?.trackedRepository, getToken]);

  // Display tracked repository from user metadata
  useEffect(() => {
    if (!userLoaded || !user?.unsafeMetadata?.trackedRepository) return;

    const trackedRepo = user.unsafeMetadata.trackedRepository;
    
    if (typeof trackedRepo === 'string') {
      // Handle legacy format
      setRepositories([{
        id: 0,
        name: trackedRepo.split('/')[1] || '',
        full_name: trackedRepo,
        private: false,
        html_url: `https://github.com/${trackedRepo}`,
        updated_at: new Date().toISOString()
      }]);
      setLoading(false);
      return;
    }

    // Type assertion for the object format
    const repoData = trackedRepo as TrackedRepository;
    setRepositories([{
      id: 0,
      name: repoData.name.split('/')[1] || '',
      full_name: repoData.name,
      private: repoData.private,
      html_url: `https://github.com/${repoData.name}`,
      updated_at: new Date().toISOString()
    }]);
    setLoading(false);
  }, [userLoaded, user?.unsafeMetadata?.trackedRepository]);

  // Call fetchRepos when component mounts and dependencies are ready
  useEffect(() => {
    if (userLoaded && tokenLoaded && !user?.unsafeMetadata?.trackedRepository) {
      console.log('Dependencies ready, calling fetchRepos...');
      fetchRepos();
    }
  }, [userLoaded, tokenLoaded, user?.unsafeMetadata?.trackedRepository, fetchRepos]);

  const filteredRepos = repositories.filter(repo =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepoSelect = async (repo: Repository) => {
    try {
      setSelectedRepo(repo.id);

      const confirmed = window.confirm(
        `Are you sure you want to track ${repo.full_name}? This will be your primary repository for the rewards program.`
      );

      if (confirmed) {
        try {
          await user?.update({
            unsafeMetadata: {
              trackedRepository: {
                name: repo.full_name,
                private: repo.private
              }
            }
          });
        } catch (error) {
          console.error('Error updating user metadata:', error);
          throw error;
        }
      }

      setSelectedRepo(null);
    } catch (error) {
      console.error('Failed to set repository:', error);
      setError(error instanceof Error ? error.message : 'Failed to set repository');
      setSelectedRepo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-near-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to NEAR Protocol Rewards
          </h1>
          <p className="text-gray-400 text-lg">
            Let's get you set up with your development tracking.
          </p>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2">Select Your Repository</h2>
            <p className="text-gray-400">
              Choose the main repository you want to track for the rewards program.
              This will be your primary project for earning rewards.
            </p>
          </div>

          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your repositories..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10
                         text-white placeholder-gray-400
                         focus:border-near-purple focus:ring-1 focus:ring-near-purple
                         transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4" data-testid="error-message">
                  {error}
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    fetchRepos();
                  }}
                  className="px-4 py-2 bg-near-purple text-white rounded-lg
                           hover:bg-near-purple/80 transition-colors"
                  data-testid="retry-button"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="w-8 h-8 animate-spin text-near-purple"
                  role="progressbar"
                  aria-label="Loading repositories"
                />
              </div>
            ) : filteredRepos.length > 0 ? (
              <div>
                <div className="text-sm text-gray-400 mb-4">
                  {filteredRepos.length} {filteredRepos.length === 1 ? 'repository' : 'repositories'} available
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2
                              scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {filteredRepos.map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className={`w-full p-4 text-left rounded-lg
                                transition-all duration-200 border
                                ${selectedRepo === repo.id
                                  ? 'bg-near-purple/20 border-near-purple'
                                  : 'bg-white/5 border-white/10 hover:bg-near-purple/10 hover:border-near-purple/50'}
                                group`}
                      disabled={selectedRepo !== null && selectedRepo !== repo.id}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white group-hover:text-near-purple
                                       transition-colors flex items-center gap-2">
                            <Github className="w-4 h-4" />
                            {repo.full_name}
                            {repo.private && (
                              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Private
                              </span>
                            )}
                          </h3>
                          {repo.description && (
                            <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Last updated {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100
                                               transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                No repositories found
              </div>
            )}
          </div>
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-near-purple mt-1" />
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  We request repository access to track your development activity
                  for the rewards program. You control which specific repository is tracked,
                  and we only collect metrics for your selected repository.
                </p>
                <p className="text-sm text-gray-400">
                  Your data is securely handled and only used for calculating rewards.
                  Learn more in our{' '}
                  <a href="https://near.org/privacy"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-near-purple hover:text-near-purple/80
                              underline transition-colors">
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}             