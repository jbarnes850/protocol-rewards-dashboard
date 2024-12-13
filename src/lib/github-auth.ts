const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

function validateEnvironmentVariables() {
  const errors: string[] = [];

  if (!GITHUB_CLIENT_ID) {
    errors.push('VITE_GITHUB_CLIENT_ID is not configured. Please check your .env file.');
  } else if (!/^[a-zA-Z0-9]+$/.test(GITHUB_CLIENT_ID)) {
    errors.push('VITE_GITHUB_CLIENT_ID appears to be invalid. It should only contain alphanumeric characters.');
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
  }
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
  tracked_repository?: GitHubRepository | null;
}

export class GitHubAuth {
  private static instance: GitHubAuth;
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private trackedRepository: GitHubRepository | null = null;
  private encryptionKey: CryptoKey | null = null;
  private currentScopes: string[] = [];
  private encryptionReady: Promise<void>;
  private isAuthenticated: boolean = false;
  private authStateListeners: Array<(isAuthenticated: boolean) => void> = [];

  private constructor() {
    try {
      validateEnvironmentVariables();
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw error;
    }
    // Initialize encryption key
    this.encryptionReady = this.initializeEncryptionKey().then(async () => {
      try {
        console.log('Encryption initialized');
        const token = await this.getAccessToken();
        console.log('Token retrieval attempt:', token ? 'success' : 'not found');

        if (token) {
          this.accessToken = token;
          const expiration = localStorage.getItem('github_token_expiration');
          this.tokenExpiration = expiration ? parseInt(expiration, 10) : null;
          this.currentScopes = JSON.parse(localStorage.getItem('github_token_scopes') || '[]');
          this.isAuthenticated = true;
          console.log('Auth state restored successfully');
          this.notifyAuthStateChange();
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        this.logout();
      }
    });
  }

  // Public method to check encryption readiness
  public async waitForEncryption(): Promise<void> {
    await this.encryptionReady;
  }

  private notifyAuthStateChange(): void {
    this.authStateListeners.forEach(listener => listener(this.isAuthenticated));
  }

  public onAuthStateChange(listener: (isAuthenticated: boolean) => void): () => void {
    this.authStateListeners.push(listener);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  private async initializeEncryptionKey(): Promise<void> {
    try {
      // Generate a secure key for token encryption
      const keyMaterial = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      this.encryptionKey = keyMaterial;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Failed to initialize secure storage. Please ensure you are using a modern browser.');
    }
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

    try {
      // Decode base64 string to binary data
      const binaryStr = atob(encryptedToken);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Extract IV and encrypted data
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      // Clear invalid token data
      this.logout();
      throw new Error('Failed to decrypt token');
    }
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
    localStorage.setItem('github_oauth_state', JSON.stringify(stateObj));

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'read:user user:email',
      state: stateObj.state
    });

    const baseUrl = import.meta.env.DEV
      ? `${window.location.origin}/_api/github/oauth/test-errors`
      : 'https://github.com/login/oauth/authorize';

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Generated OAuth URL:', url);
    return url;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    try {
      // Verify state matches
      const storedStateJson = localStorage.getItem('github_oauth_state');
      if (!storedStateJson) {
        throw new Error('No stored state found');
      }

      const storedState = JSON.parse(storedStateJson);
      if (!storedState || storedState.state !== state) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for token
      const response = await fetch('/_api/github/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to exchange code for token');
      }

      const tokenResponse = await response.json();
      const { access_token, scope } = tokenResponse;

      if (!access_token) {
        throw new Error('No access token received');
      }

      // Store token with scopes
      const scopes = scope ? scope.split(',') : ['read:user', 'user:email'];
      await this.setAccessToken(access_token, scopes);

      // Verify token by fetching user data
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to validate token with GitHub API');
      }

      // Clear state after successful authentication
      localStorage.removeItem('github_oauth_state');

      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication failed:', error);
      this.logout();
      throw error;
    }
  }

  public async getAccessToken(): Promise<string | null> {
    try {
      // Wait for encryption initialization
      await this.encryptionReady;

      // If we have a token in memory and it's not expired, use it
      if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
        return this.accessToken;
      }

      // Otherwise try to get it from storage
      return await this.getStoredToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      // Wait for encryption to be ready
      await this.encryptionReady;

      const encryptedToken = localStorage.getItem('github_access_token');
      const expirationStr = localStorage.getItem('github_token_expiration');

      if (!encryptedToken || !expirationStr) {
        return null;
      }

      const expiration = parseInt(expirationStr, 10);
      if (Date.now() >= expiration) {
        this.logout(); // Clear expired token
        return null;
      }

      // Decrypt and update instance variables
      const token = await this.decryptToken(encryptedToken);
      this.accessToken = token;
      this.tokenExpiration = expiration;
      this.currentScopes = JSON.parse(localStorage.getItem('github_token_scopes') || '[]');
      this.isAuthenticated = true;
      this.notifyAuthStateChange();

      return token;
    } catch (error) {
      console.error('Failed to retrieve stored token:', error);
      this.logout();
      return null;
    }
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
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Ensure token is refreshed if needed
      const isValid = await this.refreshTokenIfNeeded();
      if (!isValid) {
        throw new Error('Authentication expired');
      }

      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed:', await response.text());
          this.logout();
          throw new Error('Authentication expired');
        }
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData = await response.json();
      return {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email,
        tracked_repository: this.trackedRepository
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
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

  private async setAccessToken(token: string, scopes: string[] = []): Promise<void> {
    try {
      await this.encryptionReady;

      // Encrypt token before storing
      const encryptedToken = await this.encryptToken(token);
      const expiration = Date.now() + 3600000; // 1 hour expiration

      // Store encrypted token and metadata
      localStorage.setItem('github_access_token', encryptedToken);
      localStorage.setItem('github_token_expiration', expiration.toString());
      localStorage.setItem('github_token_scopes', JSON.stringify(scopes));

      // Update in-memory state
      this.accessToken = token;
      this.tokenExpiration = expiration;
      this.currentScopes = scopes;
      this.isAuthenticated = true;

      console.log('Token stored successfully with scopes:', scopes);

      // Notify listeners of auth state change
      this.notifyAuthStateChange();
    } catch (error) {
      console.error('Failed to store access token:', error);
      throw new Error('Failed to securely store GitHub access token. Please try logging in again.');
    }
  }

  public logout(): void {
    this.accessToken = null;
    this.tokenExpiration = null;
    this.currentScopes = [];
    this.isAuthenticated = false;
    this.trackedRepository = null;

    // Clear storage
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_token_expiration');
    localStorage.removeItem('github_token_scopes');

    this.notifyAuthStateChange();
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.accessToken || !this.tokenExpiration) {
      return false;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes
    if (Date.now() + expirationBuffer >= this.tokenExpiration) {
      try {
        const response = await fetch('/_api/github/oauth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.accessToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        await this.setAccessToken(data.access_token, data.scope?.split(',') || this.currentScopes);
        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.logout();
        return false;
      }
    }

    return true;
  }

  async handleTestScenario(scenario: string): Promise<void> {
    console.log('Testing scenario:', scenario);
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    try {
      // First step: Get the authorization code through redirect
      const redirect_uri = `${window.location.origin}/auth/callback`;
      const params = new URLSearchParams({
        scenario,
        redirect_uri,
        state,
      });

      const response = await fetch(
        `/api/github/oauth/test-errors?${params.toString()}`,
        { redirect: 'follow' }
      );

      // Handle redirect response
      if (response.redirected) {
        const redirectUrl = new URL(response.url);
        const code = redirectUrl.searchParams.get('code');
        const returnedState = redirectUrl.searchParams.get('state');

        if (!code || !returnedState) {
          throw new Error('Missing code or state in redirect');
        }

        if (returnedState !== state) {
          throw new Error('State mismatch');
        }

        // Second step: Exchange code for token
        const tokenResponse = await fetch('/api/github/oauth/test-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state: returnedState, scenario })
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          throw new Error(error.message || 'Token exchange failed');
        }

        const data = await tokenResponse.json();
        if (data.access_token) {
          await this.setAccessToken(data.access_token);
          this.isAuthenticated = true;
          this.notifyAuthStateChange();
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Test scenario failed');
      }
    } catch (error) {
      console.error('Test scenario error:', error);
      throw error;
    }
  }
}
