const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

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
  private tokenExpiration: number | null = null;
  private trackedRepository: GitHubRepository | null = null;
  private encryptionKey: CryptoKey | null = null;
  private currentScopes: string[] = [];

  private constructor() {
    this.initializeEncryptionKey().then(() => {
      const storedToken = localStorage.getItem('github_access_token');
      const storedExpiration = localStorage.getItem('github_token_expiration');
      const storedScopes = localStorage.getItem('github_scopes');

      if (storedToken && storedExpiration) {
        this.decryptToken(storedToken)
          .then(token => {
            this.accessToken = token;
            this.tokenExpiration = parseInt(storedExpiration, 10);
            this.currentScopes = storedScopes ? JSON.parse(storedScopes) : [];
          })
          .catch(error => {
            console.error('Failed to decrypt stored token:', error);
            this.logout();
          });
      }
    });
  }

  private async initializeEncryptionKey(): Promise<void> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(import.meta.env.VITE_GITHUB_CLIENT_ID),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('github-oauth-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async encryptToken(token: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedToken = new TextEncoder().encode(token);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encodedToken
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decryptToken(encryptedToken: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const combined = new Uint8Array(
      atob(encryptedToken).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encryptedData
    );

    return new TextDecoder().decode(decryptedData);
  }

  static getInstance(): GitHubAuth {
    if (!GitHubAuth.instance) {
      GitHubAuth.instance = new GitHubAuth();
    }
    return GitHubAuth.instance;
  }

  getLoginUrl(): string {
    const stateObj = {
      state: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // Store state for validation
    sessionStorage.setItem('oauth_state', JSON.stringify(stateObj));

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'read:user user:email',
      state: JSON.stringify(stateObj)
    });

    // For testing, use our test endpoint
    const baseUrl = import.meta.env.DEV
      ? '/_api/github/oauth/test-errors'
      : 'https://github.com/login/oauth/authorize';

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<GitHubUser> {
    try {
      // Validate state
      const storedState = sessionStorage.getItem('oauth_state');
      if (!storedState) {
        throw new Error('No stored state found');
      }

      let stateObj: { state: string; timestamp: number };
      let parsedState: { state: string; timestamp: number };

      try {
        stateObj = JSON.parse(storedState);
        parsedState = JSON.parse(state);
      } catch (error) {
        console.error('State parsing error:', error);
        throw new Error('Invalid state parameter format');
      }

      if (stateObj.state !== parsedState.state) {
        throw new Error('State mismatch');
      }

      // Check if state has expired (10 minute window)
      if (Date.now() - parsedState.timestamp > 10 * 60 * 1000) {
        throw new Error('State has expired');
      }

      // Clear stored state
      sessionStorage.removeItem('oauth_state');

      // Handle test scenarios in development
      if (import.meta.env.DEV && code.startsWith('test_')) {
        const scenario = code.substring(5);
        try {
          await this.handleTestScenario(scenario);
          if (scenario === 'success') {
            return {
              id: 'test_12345',
              login: 'test-user',
              name: 'Test User',
              avatar_url: 'https://github.com/github.png',
              email: 'test@example.com'
            };
          }
        } catch (error) {
          console.error('Test scenario error:', error);
          throw error;
        }
      }

      // Exchange code for access token
      const tokenResponse = await fetch('/api/github/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.message || 'Failed to exchange code for token');
      }

      const { access_token, scope } = await tokenResponse.json();

      // Store token with encryption
      await this.setAccessToken(access_token, scope.split(','));

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await userResponse.json();
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  hasScope(scope: string): boolean {
    return this.currentScopes.includes(scope);
  }

  async requestPrivateRepoAccess(): Promise<void> {
    if (this.hasScope('repo')) {
      return;
    }
    const loginUrl = this.getLoginUrl();
    window.location.href = loginUrl;
  }

  async getCurrentUser(): Promise<GitHubUser> {
    await this.refreshTokenIfNeeded();
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

  private async setAccessToken(token: string, scopes?: string[]): Promise<void> {
    this.accessToken = token;
    this.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    if (scopes) {
      this.currentScopes = scopes;
      localStorage.setItem('github_scopes', JSON.stringify(scopes));
    }

    try {
      // Test localStorage availability
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');

      const encryptedToken = await this.encryptToken(token);
      localStorage.setItem('github_access_token', encryptedToken);
      localStorage.setItem('github_token_expiration', this.tokenExpiration.toString());
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to securely store access token');
    }
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiration = null;
    this.trackedRepository = null;
    this.currentScopes = [];
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_token_expiration');
    localStorage.removeItem('github_oauth_state');
    localStorage.removeItem('github_scopes');
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiration) {
      throw new Error('Not authenticated with GitHub');
    }

    if (Date.now() + 5 * 60 * 1000 > this.tokenExpiration) {
      const response = await fetch('/api/github/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.setAccessToken(data.access_token, data.scope.split(' '));
    }
  }

  async handleTestScenario(scenario: string): Promise<void> {
    console.log(`Testing scenario: ${scenario}`);
    const testEndpoint = `/api/github/oauth/test-errors?scenario=${scenario}`;

    try {
      const response = await fetch(testEndpoint);
      const data = await response.json();
      console.log('Test scenario response:', data);

      if (!response.ok) {
        switch (data.error) {
          case 'expired_state':
            throw new Error('Authentication expired. Please try logging in again.');
          case 'bad_verification_code':
            throw new Error('Invalid authentication code. Please try again.');
          case 'service_unavailable':
            throw new Error('GitHub authentication service is temporarily unavailable. Please try again later.');
          case 'bad_access_token':
            throw new Error('Your session has expired. Please log in again.');
          case 'scope_denied':
            throw new Error('Additional permissions are required. Please grant the requested permissions.');
          default:
            throw new Error(`An unexpected error occurred: ${data.message || 'Please try again.'}`);
        }
      }
    } catch (error) {
      console.error('Test scenario error:', error);
      throw error;
    }
  }
}
