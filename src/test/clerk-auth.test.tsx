import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useGitHubToken } from '../lib/clerk-github';
import { SDKProvider, useSDK } from '../providers/SDKProvider';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Test wrapper component that displays SDK context state
function TestComponent() {
  const { error, loading } = useSDK();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return <div>Test Content</div>;
}

// Mock types
type MockUser = {
  unsafeMetadata: {
    trackedRepository?: string;
  };
};

// Mock SDK Manager
const mockInitialize = vi.fn();
const mockGetUserMetrics = vi.fn();
const mockCalculateRewards = vi.fn();

vi.mock('../lib/sdk-manager', () => ({
  SDKManager: vi.fn().mockImplementation(() => ({
    initialize: mockInitialize,
    getUserMetrics: mockGetUserMetrics,
    calculateRewards: mockCalculateRewards
  }))
}));

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(),
  useClerk: vi.fn()
}));

// Mock GitHub token hook
vi.mock('../lib/clerk-github', () => ({
  useGitHubToken: vi.fn()
}));

describe('Clerk Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitialize.mockResolvedValue(undefined);
    mockGetUserMetrics.mockResolvedValue({});
    mockCalculateRewards.mockResolvedValue({});
  });

  it('handles unauthenticated state correctly', async () => {
    // Mock unauthenticated user
    (useUser as any).mockReturnValue({ user: null, isLoaded: true });
    (useClerk as any).mockReturnValue({ session: null });
    (useGitHubToken as any).mockReturnValue({ getToken: async () => null, isLoaded: true });

    render(
      <MemoryRouter>
        <SDKProvider>
          <TestComponent />
        </SDKProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Please sign in to view metrics.')).toBeInTheDocument();
    });
  });

  it('handles authenticated state with no repository selected', async () => {
    // Mock authenticated user without repository
    const mockUser: MockUser = { unsafeMetadata: {} };
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoaded: true
    });
    (useClerk as any).mockReturnValue({ session: { getToken: async () => 'mock-token' } });
    (useGitHubToken as any).mockReturnValue({
      getToken: async () => 'mock-github-token',
      isLoaded: true
    });

    render(
      <MemoryRouter>
        <SDKProvider>
          <TestComponent />
        </SDKProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Please select a repository to track.')).toBeInTheDocument();
    });
  });

  it('handles authenticated state with repository selected', async () => {
    // Mock authenticated user with repository
    const mockUser: MockUser = { unsafeMetadata: { trackedRepository: 'owner/repo' } };
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoaded: true
    });
    (useClerk as any).mockReturnValue({ session: { getToken: async () => 'mock-token' } });
    (useGitHubToken as any).mockReturnValue({
      getToken: async () => 'mock-github-token',
      isLoaded: true
    });

    render(
      <MemoryRouter>
        <SDKProvider>
          <TestComponent />
        </SDKProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Please sign in to view metrics.')).not.toBeInTheDocument();
      expect(screen.queryByText('Please select a repository to track.')).not.toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('handles GitHub token error', async () => {
    // Mock authenticated user with token error
    const mockUser: MockUser = { unsafeMetadata: { trackedRepository: 'owner/repo' } };
    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoaded: true
    });
    (useClerk as any).mockReturnValue({ session: { getToken: async () => { throw new Error('Token error'); } } });
    (useGitHubToken as any).mockReturnValue({
      getToken: async () => { throw new Error('Failed to retrieve GitHub token'); },
      isLoaded: true
    });

    mockInitialize.mockRejectedValue(new Error('Failed to retrieve GitHub token'));

    render(
      <MemoryRouter>
        <SDKProvider>
          <TestComponent />
        </SDKProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to retrieve GitHub token')).toBeInTheDocument();
    });
  });
});
