import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GitHubAuth } from '../lib/github-auth';
import { NEARProtocolRewardsSDK } from '../lib/real-sdk';
import { User, ProcessedMetrics, RewardCalculation } from '../lib/types';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isGitHubConnected: boolean;
  metrics: ProcessedMetrics | null;
  rewards: RewardCalculation | null;
  trackedRepository: string | null;
  loginWithGitHub: () => void;
  handleGitHubCallback: (code: string, state: string) => Promise<void>;
  logout: () => void;
  setTrackedRepository: (repo: string) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const sdk = new NEARProtocolRewardsSDK({
  projectId: 'dashboard',
  token: ''
});

const githubAuth = GitHubAuth.getInstance();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize as true
  const [error, setError] = useState<string | null>(null);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [metrics, setMetrics] = useState<ProcessedMetrics | null>(null);
  const [rewards, setRewards] = useState<RewardCalculation | null>(null);
  const [trackedRepository, setTrackedRepository] = useState<string | null>(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const token = await githubAuth.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const githubUser = await githubAuth.getCurrentUser();
      const user: User = {
        id: githubUser.id.toString(),
        name: githubUser.name,
        avatar: githubUser.avatar_url,
        githubUsername: githubUser.login
      };
      setUser(user);

      if (trackedRepository) {
        sdk.setToken(token);
        const [githubMetrics, nearMetricsResponse] = await Promise.all([
          sdk.getMetrics(trackedRepository),
          Promise.resolve({
            transactions: { count: 0, volume: 0, quality: 0, score: 0 },
            contracts: { interactions: 0, uniqueCallers: 0, usagePatterns: 0, score: 0 },
            users: { total: 0, retention: 0, growthRate: 0, score: 0 }
          })
        ]);

        const processedMetrics: ProcessedMetrics = {
          github: githubMetrics,
          near: nearMetricsResponse
        };

        const rewards = await sdk.calculateRewards(githubMetrics, nearMetricsResponse);

        setMetrics(processedMetrics);
        setRewards(rewards);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      setIsGitHubConnected(false);
    }
  }, [trackedRepository]);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckInProgress) {
      console.log('Auth check already in progress, skipping...');
      return;
    }

    try {
      setAuthCheckInProgress(true);
      setLoading(true);
      console.log('Starting auth status check...');
      await githubAuth.waitForEncryption();
      console.log('Encryption ready, checking for token...');
      const token = await githubAuth.getAccessToken();
      console.log('Token status:', token ? 'found' : 'not found');

      if (token) {
        console.log('Token found, validating with getCurrentUser...');
        try {
          const githubUser = await githubAuth.getCurrentUser();
          const user: User = {
            id: githubUser.id.toString(),
            name: githubUser.name,
            avatar: githubUser.avatar_url,
            githubUsername: githubUser.login
          };
          setUser(user);
          setIsGitHubConnected(true);
          sdk.setToken(token);
          await loadUserData();
        } catch (error) {
          console.error('Token validation failed:', error);
          setIsGitHubConnected(false);
        }
      } else {
        console.log('No token found, ready for login');
        setIsGitHubConnected(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsGitHubConnected(false);
      setError(error instanceof Error ? error.message : 'Failed to check authentication status');
    } finally {
      setAuthCheckInProgress(false);
      setLoading(false);
    }
  }, [loadUserData]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await githubAuth.initialize();
        await checkAuthStatus();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (isGitHubConnected && trackedRepository) {
      loadUserData();
    }
  }, [isGitHubConnected, trackedRepository, loadUserData]);

  const loginWithGitHub = useCallback(() => {
    githubAuth.login();
  }, []);

  const handleGitHubCallback = useCallback(async (code: string, state: string) => {
    try {
      setLoading(true);
      setError(null);

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
  }, [loadUserData]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await githubAuth.logout();
      setUser(null);
      setMetrics(null);
      setRewards(null);
      setIsGitHubConnected(false);
      setTrackedRepository(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetTrackedRepository = useCallback((repo: string) => {
    setTrackedRepository(repo);
  }, []);

  const value = {
    user,
    loading,
    error,
    isGitHubConnected,
    metrics,
    rewards,
    trackedRepository,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    setTrackedRepository: handleSetTrackedRepository,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
