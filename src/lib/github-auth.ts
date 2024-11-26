import { Buffer } from 'buffer';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET;

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export class GitHubAuth {
  private static instance: GitHubAuth;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): GitHubAuth {
    if (!GitHubAuth.instance) {
      GitHubAuth.instance = new GitHubAuth();
    }
    return GitHubAuth.instance;
  }

  getLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${window.location.origin}/github/callback`,
      scope: 'read:user user:email repo',
      state: crypto.randomUUID(),
      allow_signup: 'true'
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<GitHubUser> {
    try {
      // Exchange code for access token
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
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      this.accessToken = tokenData.access_token;

      // Get user data with the token
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

      // Get user email if not public
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || userData.email;

      return {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        email: primaryEmail
      };
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw error;
    }
  }

  async getRepositories(): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    return response.json();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  logout(): void {
    this.accessToken = null;
    // Could also redirect to GitHub's logout URL if needed
  }
}