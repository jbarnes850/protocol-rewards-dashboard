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
      
      // Get the raw token from Clerk
      const tokenResponse = await clerk.session.getToken({ template: 'github-token' });
      if (!tokenResponse) {
        clearCache();
        console.error('No token returned from Clerk');
        throw new Error('Failed to retrieve GitHub token from Clerk');
      }

      // Parse the JWT to get the actual GitHub token
      try {
        const tokenData = JSON.parse(atob(tokenResponse.split('.')[1]));
        const githubToken = tokenData.github_token;
        
        if (!githubToken) {
          throw new Error('No GitHub token found in JWT payload');
        }

        console.log('Successfully retrieved GitHub token');
        cachedToken = githubToken;
        return githubToken;
      } catch (parseError) {
        console.error('Error parsing token:', parseError);
        throw new Error('Invalid token format received from Clerk');
      }
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
