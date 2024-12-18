import { useClerk } from '@clerk/clerk-react';

interface GitHubTokenHook {
  getToken: () => Promise<string>;
  isLoaded: boolean;
  clearCache: () => void;
}

let cachedToken: string | null = null;

export function useGitHubToken(): GitHubTokenHook {
  const clerk = useClerk();

  const clearCache = () => {
    cachedToken = null;
  };

  const getToken = async () => {
    try {
      if (cachedToken) {
        return cachedToken;
      }

      console.log('Requesting GitHub token from Clerk...');
      if (!clerk.session) {
        clearCache();
        throw new Error('No active session found');
      }
      
      const token = await clerk.session.getToken({ template: 'github-token' });
      if (!token) {
        clearCache();
        console.error('No token returned from Clerk');
        throw new Error('Failed to retrieve GitHub token from Clerk');
      }

      console.log('Successfully retrieved GitHub token');
      cachedToken = token;
      return token;
    } catch (error) {
      clearCache();
      console.error('Error getting GitHub token:', error);
      throw error;
    }
  };

  return {
    getToken,
    isLoaded: !!clerk.session,
    clearCache
  };
}
