import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Search, Loader2, Github, Shield, ExternalLink } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  updated_at: string;
}

export function RepoSelector() {
  const { user, setTrackedRepository } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/user/repos?sort=updated', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('github_token')}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        const data = await response.json();
        setRepositories(data);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

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
        await setTrackedRepository(repo.full_name);
      } else {
        setSelectedRepo(null);
      }
    } catch (error) {
      console.error('Failed to set repository:', error);
      setSelectedRepo(null);
    }
  };

  if (!user?.githubUsername) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-near-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to NEAR Protocol Rewards
          </h1>
          <p className="text-gray-400 text-lg">
            Let's get you set up with your development tracking.
          </p>
        </div>

        {/* Main Selection Card */}
        <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shadow-2xl">
          {/* Header Section */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2">Select Your Repository</h2>
            <p className="text-gray-400">
              Choose the main repository you want to track for the rewards program. 
              This will be your primary project for earning rewards.
            </p>
          </div>

          {/* Search Section */}
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

          {/* Repository List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-near-purple" />
              </div>
            ) : (
              <>
                {/* Repository count */}
                <div className="text-sm text-gray-400 mb-4">
                  {filteredRepos.length === 0 ? (
                    searchQuery ? 
                      'No repositories found' : 
                      'No repositories available'
                  ) : (
                    `${filteredRepos.length} ${filteredRepos.length === 1 ? 'repository' : 'repositories'} available`
                  )}
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
                              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
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

                  {filteredRepos.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No repositories match your search.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-near-purple hover:text-near-purple/80 text-sm mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-near-purple mt-1" />
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  We need access to your repository data to track your development activity 
                  for the rewards program. This includes commits, pull requests, and other 
                  GitHub activities.
                </p>
                <p className="text-sm text-gray-400">
                  Your data is securely handled and only used for calculating rewards. 
                  Learn more in our{' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-near-purple hover:text-near-purple/80 
                             underline transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 