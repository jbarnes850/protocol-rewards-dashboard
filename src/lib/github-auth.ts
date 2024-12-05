const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const APP_URL = import.meta.env.VITE_APP_URL;

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
  private trackedRepository: GitHubRepository | null = null;

  private constructor() {}

  static getInstance(): GitHubAuth {
    if (!GitHubAuth.instance) {
      GitHubAuth.instance = new GitHubAuth();
    }
    return GitHubAuth.instance;
  }

  getLoginUrl(): string {
    const state = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    const stateObj = {
      value: state,
      expires: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    sessionStorage.setItem('github_oauth_state', JSON.stringify(stateObj));
    
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${APP_URL}/auth/callback`,
      scope: 'read:user user:email repo',
      state,
      allow_signup: 'true'
    } as Record<string, string>);

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<GitHubUser> {
    const storedStateJson = sessionStorage.getItem('github_oauth_state');
    if (!storedStateJson) {
      throw new Error('No state found');
    }

    const storedState = JSON.parse(storedStateJson);
    if (Date.now() > storedState.expires) {
      sessionStorage.removeItem('github_oauth_state');
      throw new Error('State expired');
    }

    if (state !== storedState.value) {
      throw new Error('Invalid state parameter');
    }
    sessionStorage.removeItem('github_oauth_state');

    const tokenResponse = await fetch('/api/github/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error_description);
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    this.setAccessToken(tokenData.access_token);

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

  private setAccessToken(token: string): void {
    // Store in memory
    this.accessToken = token;
    
    // Store in sessionStorage for tab persistence
    sessionStorage.setItem('github_access_token', token);
  }

  logout(): void {
    this.accessToken = null;
    this.trackedRepository = null;
    sessionStorage.removeItem('github_access_token');
    sessionStorage.removeItem('github_oauth_state');
  }

  private async makeGitHubRequest(url: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // Handle rate limiting
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      throw new Error(`Rate limit exceeded. Resets at ${new Date(Number(resetTime) * 1000)}`);
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }
}