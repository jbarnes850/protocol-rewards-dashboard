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

      console.log('Requesting GitHub token from Clerk...');
      const token = await clerk.session?.getToken({ template: 'github-token' });
      
      if (!token) {
        console.error('No token returned from Clerk');
        throw new Error('Failed to retrieve GitHub token from Clerk');
      }

      console.log('Successfully retrieved GitHub token');
      cachedToken = token;
      return token;
    } catch (error) {
      console.error('Error getting GitHub token:', error);
      throw error;
    }
  };

  return {
    getToken,
    isLoaded: !!clerk.session
  };
}
