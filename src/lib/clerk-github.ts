import { useClerk } from '@clerk/clerk-react';

interface GitHubTokenHook {
  getToken: () => Promise<string>;
  isLoaded: boolean;
}

let cachedToken: string | null = null;

export function useGitHubToken(): GitHubTokenHook {
  const clerk = useClerk();

  const getToken = async () => {
    try {
      if (cachedToken) {
        return cachedToken;
      }

      const token = await clerk.session?.getToken({ template: 'github-token' });

      if (!token) {
        throw new Error('Failed to retrieve GitHub token from Clerk');
      }

      cachedToken = token;
      return token;
    } catch (error) {
      console.error('Error getting GitHub token:', error);
      throw new Error('Failed to retrieve GitHub token');
    }
  };

  return {
    getToken,
    isLoaded: !!clerk.session
  };
}
