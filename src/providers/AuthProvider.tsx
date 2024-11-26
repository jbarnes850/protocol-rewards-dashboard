import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

interface AuthContextType {
  user: User | null;
  loginWithGitHub: () => void;
  logout: () => void;
  loading: boolean;
  isGitHubConnected: boolean;
  handleGitHubCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const githubAuth = GitHubAuth.getInstance();
const sdk = new NEARProtocolRewardsSDK({
  projectId: 'dashboard',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const githubToken = githubAuth.getAccessToken();
        if (githubToken) {
          setIsGitHubConnected(true);
          await correlateUserData(githubToken);
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const correlateUserData = async (githubToken: string) => {
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
      console.error('Failed to correlate user data:', error);
      toast.error('Failed to load complete metrics');
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
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
      };
    });
  };

  const loginWithGitHub = () => {
    window.location.href = githubAuth.getLoginUrl();
  };

  const handleGitHubCallback = async (code: string) => {
    try {
      const githubToken = await githubAuth.handleCallback(code);
      setIsGitHubConnected(true);
      await correlateUserData(githubToken);
    } catch (error) {
      console.error('GitHub callback error:', error);
      throw error;
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

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loginWithGitHub,
        handleGitHubCallback,
        logout, 
        loading,
        isGitHubConnected
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