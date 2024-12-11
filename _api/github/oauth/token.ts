import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Define specific error types for better error handling
interface GitHubOAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

// Validate environment variables
const requiredEnvVars = {
  VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};

// Validate all required environment variables are present
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only POST requests are allowed'
    });
  }

  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({
      error: 'invalid_request',
      message: `Missing required parameters: ${!code ? 'code' : ''} ${!state ? 'state' : ''}`.trim()
    });
  }

  try {
    const host = req.headers['host'];
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const appUrl = `${protocol}://${host}`;

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: requiredEnvVars.VITE_GITHUB_CLIENT_ID,
        client_secret: requiredEnvVars.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${appUrl}/auth/callback`,
        state,
      }),
    });

    const data = await response.json() as GitHubOAuthError | { access_token: string };

    // Check for GitHub OAuth specific errors
    if ('error' in data) {
      console.error('GitHub OAuth error:', data);
      return res.status(400).json({
        error: data.error,
        message: data.error_description || 'GitHub OAuth authentication failed',
        error_uri: data.error_uri
      });
    }

    if (!response.ok) {
      console.error('GitHub API error:', data);
      return res.status(response.status).json({
        error: 'github_api_error',
        message: 'Failed to exchange code for access token',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred during token exchange'
    });
  }
}
