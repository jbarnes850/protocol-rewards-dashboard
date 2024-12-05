const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET;
const APP_URL = import.meta.env.DEV 
  ? 'http://localhost:5173'
  : 'https://protocol-rewards-dashboard.vercel.app';

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
  tracked_repository?: GitHubRepository | null;
}

export class GitHubAuth {
  private static instance: GitHubAuth;
  private accessToken: string | null = null;
  private state: string | null = null;
  private trackedRepository: GitHubRepository | null = null;

  private constructor() {}

  static getInstance(): GitHubAuth {
    if (!GitHubAuth.instance) {
      GitHubAuth.instance = new GitHubAuth();
    }
    return GitHubAuth.instance;
  }

  getLoginUrl(): string {
    this.state = crypto.randomUUID();
    localStorage.setItem('github_oauth_state', this.state);
    
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${APP_URL}/auth/callback`,
      scope: 'read:user user:email repo',
      state: this.state,
      allow_signup: 'true'
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    console.log('Generated GitHub OAuth URL:', url);
    console.log('Using APP_URL:', APP_URL);
    return url;
  }

  async handleCallback(code: string, state: string): Promise<GitHubUser> {
    try {
      const savedState = localStorage.getItem('github_oauth_state');
      
      if (!savedState || state !== savedState) {
        throw new Error('Invalid state parameter');
      }

      localStorage.removeItem('github_oauth_state');

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

      this.accessToken = tokenData.access_token;

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
        email: userData.email || ''
      };
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw error;
    } finally {
      this.state = null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
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

  getTrackedRepository(): GitHubRepository | null {
    return this.trackedRepository;
  }

  logout(): void {
    this.accessToken = null;
    this.state = null;
    this.trackedRepository = null;
  }
}