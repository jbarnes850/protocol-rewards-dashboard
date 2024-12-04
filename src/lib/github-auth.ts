const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET;
const APP_URL = 'https://protocol-rewards-dashboard.vercel.app';

const REQUIRED_SCOPES = [
  'read:user',
  'user:email',
  'repo',           // For repository access (includes private repos)
  'read:org',       // For organization metrics
  'read:packages'   // For package metrics
] as const;

type GitHubScope = typeof REQUIRED_SCOPES[number];

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

interface GitHubUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
  tracked_repository?: GitHubRepository;
}

export class GitHubAuth {
  private static instance: GitHubAuth;
  private accessToken: string | undefined = undefined;
  private state: string | undefined = undefined;
  private trackedRepository: GitHubRepository | undefined = undefined;
  private currentScopes: GitHubScope[] = [];

  private constructor() {}

  static getInstance(): GitHubAuth {
    if (!GitHubAuth.instance) {
      GitHubAuth.instance = new GitHubAuth();
    }
    return GitHubAuth.instance;
  }

  getLoginUrl(): string {
    this.state = crypto.randomUUID();
    
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${APP_URL}/auth/callback`,
      scope: REQUIRED_SCOPES.join(' '),
      state: this.state,
      allow_signup: 'true'
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  private async verifyScopes(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify scopes');
      }

      const scopesHeader = response.headers.get('x-oauth-scopes');
      if (!scopesHeader) {
        throw new Error('No scopes returned from GitHub');
      }

      this.currentScopes = scopesHeader.split(',').map(s => s.trim()) as GitHubScope[];
      
      return REQUIRED_SCOPES.every(scope => this.currentScopes.includes(scope));
    } catch (error) {
      console.error('Scope verification failed:', error);
      return false;
    }
  }

  async handleCallback(code: string, state: string): Promise<GitHubUser> {
    try {
      if (!this.state || state !== this.state) {
        throw new Error('Invalid state parameter');
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${APP_URL}/auth/callback`,
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('GitHub OAuth error:', tokenData.error_description);
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      const token = tokenData.access_token;
      if (!token) {
        throw new Error('No access token received');
      }

      // Verify scopes before proceeding
      const hasRequiredScopes = await this.verifyScopes(token);
      if (!hasRequiredScopes) {
        throw new Error('Insufficient permissions. Please authorize all required scopes.');
      }

      this.accessToken = token;

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();

      return {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email || '',
        tracked_repository: this.trackedRepository
      };
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw error;
    } finally {
      this.state = undefined;
    }
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  getCurrentScopes(): GitHubScope[] {
    return this.currentScopes;
  }

  async getCurrentUser(): Promise<GitHubUser> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      email: userData.email || '',
      tracked_repository: this.trackedRepository
    };
  }

  async setTrackedRepository(repoFullName: string): Promise<GitHubRepository> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repository data');
    }

    const repoData = await response.json();
    this.trackedRepository = {
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      private: repoData.private,
      html_url: repoData.html_url
    };

    return this.trackedRepository;
  }

  getTrackedRepository(): GitHubRepository | undefined {
    return this.trackedRepository;
  }

  async verifyRepositoryAccess(repoFullName: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // Try to access repository contents to verify permissions
      const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or no access');
        }
        throw new Error('Failed to verify repository access');
      }

      return true;
    } catch (error) {
      console.error('Repository access verification failed:', error);
      return false;
    }
  }

  logout(): void {
    this.accessToken = undefined;
    this.state = undefined;
    this.trackedRepository = undefined;
    this.currentScopes = [];
  }
}