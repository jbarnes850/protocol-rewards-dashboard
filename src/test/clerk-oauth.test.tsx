import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth, ClerkProvider, useUser } from '@clerk/clerk-react';
import { SDKProvider } from '../providers/SDKProvider';
import { CustomClerkProvider } from '../providers/ClerkProvider';
import { RepoSelector } from '../components/RepoSelector';
import { SDKManager } from '../lib/sdk-manager';
import { useGitHubToken } from '../lib/clerk-github';
import type { GitHubMetrics, RewardCalculation } from '../lib/types';

// Mock Clerk's hooks and components
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useUser: vi.fn(),
}));

// Mock GitHub token hook
vi.mock('../lib/clerk-github', () => ({
  useGitHubToken: vi.fn(),
}));

// Mock SDK manager with proper types
vi.mock('../lib/sdk-manager', () => ({
  SDKManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    getUserMetrics: vi.fn().mockResolvedValue({
      totalContributions: 100,
      issueCount: 10,
      prCount: 5,
    } as GitHubMetrics),
    calculateRewards: vi.fn().mockResolvedValue({
      level: { name: 'Gold', multiplier: 2 },
      totalScore: 1000,
    } as RewardCalculation),
  })),
}));

describe('Clerk OAuth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock values for useUser
    (useUser as any).mockReturnValue({
      user: { id: '123', fullName: 'Test User', unsafeMetadata: { trackedRepository: 'test/repo' } },
      isLoaded: true,
    });

    // Setup default mock values for useGitHubToken
    (useGitHubToken as any).mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-github-token'),
      isLoaded: true,
    });
  });

  it('handles public repository OAuth flow successfully', async () => {
    // Mock successful public repository scenario
    (useUser as any).mockReturnValue({
      user: {
        id: '123',
        fullName: 'Test User',
        unsafeMetadata: { trackedRepository: 'test/public-repo' }
      },
      isLoaded: true
    });

    (useGitHubToken as any).mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-github-token'),
      isLoaded: true,
    });

    render(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify repository is displayed
    expect(screen.getByText('test/public-repo')).toBeInTheDocument();
  });

  it('handles private repository OAuth flow successfully', async () => {
    // Mock successful private repository scenario
    (useUser as any).mockReturnValue({
      user: {
        id: '123',
        fullName: 'Test User',
        unsafeMetadata: { trackedRepository: 'test/private-repo' }
      },
      isLoaded: true
    });

    (useGitHubToken as any).mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-private-repo-token'),
      isLoaded: true,
    });

    render(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify repository is displayed
    expect(screen.getByText('test/private-repo')).toBeInTheDocument();
  });

  it('maintains session persistence across page reloads', async () => {
    // Mock authenticated user with tracked repository
    const user = {
      id: '123',
      fullName: 'Test User',
      unsafeMetadata: { trackedRepository: 'test/repo' }
    };

    (useUser as any).mockReturnValue({ user, isLoaded: true });
    (useGitHubToken as any).mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-github-token'),
      isLoaded: true,
    });

    const { rerender } = render(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // Wait for initial render and loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify repository is displayed after loading
    await waitFor(() => {
      expect(screen.getByText('test/repo')).toBeInTheDocument();
    });

    // Simulate page reload
    rerender(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // Wait for loading state after rerender
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify repository is still displayed after rerender
    await waitFor(() => {
      expect(screen.getByText('test/repo')).toBeInTheDocument();
    });
  });

  it('handles token refresh scenarios', async () => {
    // Mock token refresh scenario with loading states
    const getToken = vi.fn()
      .mockRejectedValueOnce(new Error('Token expired'))
      .mockResolvedValueOnce('new-token');

    (useUser as any).mockReturnValue({
      user: {
        id: '123',
        fullName: 'Test User',
        unsafeMetadata: {} // Empty metadata to trigger repo fetch
      },
      isLoaded: true,
    });

    (useGitHubToken as any).mockReturnValue({
      getToken,
      isLoaded: true,
    });

    render(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // First, verify loading state appears
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Then wait for loading to clear and error to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Token expired');
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    }, { timeout: 10000 }); // Increase timeout to 10 seconds
  });

  it('handles scope-related errors', async () => {
    // Mock insufficient scope error with proper user metadata
    (useUser as any).mockReturnValue({
      user: {
        id: '123',
        fullName: 'Test User',
        unsafeMetadata: {} // Empty metadata to trigger repo fetch
      },
      isLoaded: true,
    });

    (useGitHubToken as any).mockReturnValue({
      getToken: vi.fn().mockRejectedValue(new Error('Unauthorized')),
      isLoaded: true,
    });

    render(
      <CustomClerkProvider>
        <SDKProvider>
          <RepoSelector />
        </SDKProvider>
      </CustomClerkProvider>
    );

    // First, verify loading state appears
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Then wait for loading to clear and error to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Unauthorized');
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    }, { timeout: 10000 }); // Increase timeout to 10 seconds
  });
});
