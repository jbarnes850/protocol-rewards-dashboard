import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GitHubAuth } from '../lib/github-auth';
import { NEARProtocolRewardsSDK } from '../lib/mock-sdk';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  avatar: string;
  githubUsername?: string;
  rewardTier: {
    name: string;
    color: string;
    progress: number;
    nextMilestone: number;
  };
  metrics?: {
    github: {
      commits: number;
      prs: number;
      reviews: number;
    };
    sdk: {
      transactions: number;
      contracts: number;
      users: number;
    };
  };
  trackedRepository?: {
    name: string;
    fullName: string;
    url: string;
  };
}

interface AuthContextType {
  user: User | null;
  loginWithGitHub: () => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isGitHubConnected: boolean;
  handleGitHubCallback: (code: string, state: string) => Promise<void>;
  setTrackedRepository: (repoFullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const githubAuth = GitHubAuth.getInstance();
const sdk = new NEARProtocolRewardsSDK({
  projectId: 'dashboard',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  // Check authentication status periodically
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = githubAuth.getAccessToken();
        if (!token) {
          if (isGitHubConnected) {
            setIsGitHubConnected(false);
            setUser(null);
            toast.error('Session expired. Please login again.');
          }
          return;
        }

        // Attempt to get current user, which will trigger token refresh if needed
        await githubAuth.getCurrentUser();
      } catch (error) {
        console.error('Auth status check failed:', error);
        setIsGitHubConnected(false);
        setUser(null);
        toast.error('Session expired. Please login again.');
      }
    };

    // Check auth status every minute
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, [isGitHubConnected]);

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = githubAuth.getAccessToken();
        if (token) {
          setIsGitHubConnected(true);
          await loadUserData();
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        toast.error('Failed to load user data');
        setIsGitHubConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadUserData = async () => {
    try {
      const githubUser = await githubAuth.getCurrentUser();
      const sdkMetrics = await sdk.getUserMetrics(githubUser.login);

      updateUser({
        id: githubUser.id,
        name: githubUser.name,
        avatar: githubUser.avatar_url,
        githubUsername: githubUser.login,
        metrics: {
          github: {
            commits: Math.floor(Math.random() * 100), // Mock data
            prs: Math.floor(Math.random() * 20),      // Mock data
            reviews: Math.floor(Math.random() * 30),   // Mock data
          },
          sdk: sdkMetrics,
        },
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load complete metrics');
      // If the error is auth-related, reset the connection
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        setIsGitHubConnected(false);
        setUser(null);
      }
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev: User | null) => {
      if (!prev && !data.id) return null;
      return {
        ...prev,
        ...data,
        rewardTier: data.rewardTier || prev?.rewardTier || {
          name: 'Getting Started',
          color: 'bg-gradient-to-r from-gray-500 to-slate-500',
          progress: 0,
          nextMilestone: 250,
        },
      } as User;
    });
  };

  const loginWithGitHub = () => {
    window.location.href = githubAuth.getLoginUrl();
  };

  const handleGitHubCallback = async (code: string, state: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check for OAuth error parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('error')) {
        const errorDescription = urlParams.get('error_description') || 'Authentication failed';
        throw new Error(errorDescription);
      }

      await githubAuth.handleCallback(code, state);
      setIsGitHubConnected(true);
      await loadUserData();
    } catch (error) {
      console.error('GitHub callback error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsGitHubConnected(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      githubAuth.logout();
      setUser(null);
      setIsGitHubConnected(false);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const setTrackedRepository = async (repoFullName: string) => {
    try {
      const repo = await githubAuth.setTrackedRepository(repoFullName);
      updateUser({
        trackedRepository: {
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url
        }
      });
      toast.success(`Now tracking repository: ${repo.full_name}`);
    } catch (error) {
      console.error('Failed to set tracked repository:', error);
      toast.error('Failed to set tracked repository');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGitHub,
        handleGitHubCallback,
        logout,
        loading,
        error,
        isGitHubConnected,
        setTrackedRepository
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
