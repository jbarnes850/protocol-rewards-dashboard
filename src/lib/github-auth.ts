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

  private constructor() {
    this.initializeEncryptionKey().then(() => {
      const storedToken = sessionStorage.getItem('github_access_token');
      const storedExpiration = sessionStorage.getItem('github_token_expiration');

      if (storedToken && storedExpiration) {
        this.decryptToken(storedToken)
          .then(token => {
            this.accessToken = token;
            this.tokenExpiration = parseInt(storedExpiration, 10);
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
    const state = crypto.randomUUID();

    const stateObj = {
      state,
      timestamp: Date.now()
    };

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'read:user user:email repo',
      state: JSON.stringify(stateObj)
    });

    // For testing, use our test endpoint
    if (import.meta.env.DEV) {
      return `/api/github/oauth/test-errors?scenario=success&${params.toString()}`;
    }

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<GitHubUser> {
    try {
      const parsedState = JSON.parse(state);
      const { timestamp } = parsedState;

      // Verify state is not expired (5 minutes)
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        throw new Error('State expired');
      }

      // For testing error scenarios in development
      if (import.meta.env.DEV && code.startsWith('test_')) {
        return this.handleTestScenario(code.substring(5));
      }

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

      await this.setAccessToken(tokenData.access_token);

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
      console.error('Error handling callback:', error);
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
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

  private async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
    this.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    try {
      const encryptedToken = await this.encryptToken(token);
      sessionStorage.setItem('github_access_token', encryptedToken);
      sessionStorage.setItem('github_token_expiration', this.tokenExpiration.toString());
    } catch (error) {
      console.error('Failed to encrypt token:', error);
      throw new Error('Failed to securely store access token');
    }
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiration = null;
    this.trackedRepository = null;
    sessionStorage.removeItem('github_access_token');
    sessionStorage.removeItem('github_token_expiration');
    sessionStorage.removeItem('github_oauth_state');
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiration) {
      throw new Error('Not authenticated with GitHub');
    }

    // Refresh token if it expires in less than 5 minutes
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
      await this.setAccessToken(data.access_token);
    }
  }

  private async handleTestScenario(scenario: string): Promise<GitHubUser> {
    const response = await fetch(`/api/github/oauth/test-errors?scenario=${scenario}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const tokenData = await response.json();
    await this.setAccessToken(tokenData.access_token);

    // Return mock user data for testing
    return {
      id: 'test_user_id',
      login: 'test_user',
      name: 'Test User',
      avatar_url: 'https://github.com/github.png',
      email: 'test@example.com'
    };
  }
}
