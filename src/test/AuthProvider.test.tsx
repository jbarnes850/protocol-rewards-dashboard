import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext, AuthContextType } from '../providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { GitHubAuth } from '../lib/github-auth';

// Mock GitHubAuth
vi.mock('../lib/github-auth', () => ({
  GitHubAuth: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      getAccessToken: vi.fn().mockResolvedValue(null),
      waitForEncryption: vi.fn().mockResolvedValue(undefined),
      getCurrentUser: vi.fn().mockResolvedValue({
        id: '123',
        name: 'Test User',
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.png'
      }),
      handleCallback: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue(() => {}),
      getTrackedRepository: vi.fn().mockReturnValue(null),
      setTrackedRepository: vi.fn().mockResolvedValue(undefined)
    }))
  }
}));

// Mock NEARProtocolRewardsSDK
vi.mock('../lib/real-sdk', () => ({
  NEARProtocolRewardsSDK: vi.fn().mockImplementation(() => ({
    getMetrics: vi.fn().mockResolvedValue({
      commits: { count: 10, score: 75 },
      pullRequests: { count: 5, score: 80 },
      issues: { count: 8, score: 70 }
    }),
    calculateRewards: vi.fn().mockResolvedValue({
      tier: {
        name: 'Bronze',
        color: '#CD7F32',
        maxPoints: 1000
      },
      totalScore: 750
    }),
    setProjectId: vi.fn(),
    setToken: vi.fn()
  }))
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides authentication context to children', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <div data-testid="child">Test Child</div>
          </AuthProvider>
        </BrowserRouter>
      );
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes with not authenticated state', async () => {
    let contextValue: AuthContextType | null = null;
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthContext.Consumer>
              {(context) => {
                contextValue = context;
                return <div data-testid="auth-state">{context?.isGitHubConnected ? 'true' : 'false'}</div>;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    expect(screen.getByTestId('auth-state')).toHaveTextContent('false');
    expect(contextValue?.isGitHubConnected).toBe(false);
  });

  it('shows loading state during authentication', async () => {
    // Mock GitHubAuth to control timing
    const mockGitHubAuth = GitHubAuth.getInstance();
    let resolveInitialize: () => void;
    const initializePromise = new Promise<void>((resolve) => {
      resolveInitialize = resolve;
    });

    vi.mocked(mockGitHubAuth.initialize).mockReturnValue(initializePromise);
    vi.mocked(mockGitHubAuth.getAccessToken).mockResolvedValue(null);

    // Render component
    const rendered = render(
      <BrowserRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(context) => (
              <div data-testid="loading-state">
                {context?.loading ? 'Loading...' : 'Done'}
              </div>
            )}
          </AuthContext.Consumer>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify initial loading state
    expect(rendered.getByTestId('loading-state')).toHaveTextContent('Loading...');

    // Complete initialization
    await act(async () => {
      resolveInitialize();
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(rendered.getByTestId('loading-state')).toHaveTextContent('Done');
    }, { timeout: 3000 });
  });
});
