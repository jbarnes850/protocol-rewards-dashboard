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

// Validate all required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  } else if (key === 'GITHUB_CLIENT_SECRET' && !/^[a-f0-9]{40}$/i.test(value)) {
    throw new Error(`Invalid ${key} format. Expected 40-character hexadecimal string.`);
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
    // Handle test scenarios
    if (code.startsWith('test_')) {
      const scenario = code.substring(5);
      if (scenario === 'success') {
        return res.status(200).json({
          access_token: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          token_type: 'bearer',
          scope: 'read:user,user:email,repo',
          expires_in: 3600
        });
      }
      // Let other test scenarios be handled by test-errors endpoint
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Invalid test scenario'
      });
    }

    // For real GitHub OAuth requests
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
        state
      }),
    });

    const data = await response.json() as GitHubOAuthError | {
      access_token: string;
      scope?: string;
      token_type?: string;
    };

    // Check for GitHub OAuth specific errors
    if ('error' in data) {
      console.error('GitHub OAuth error:', data);
      return res.status(400).json({
        error: data.error,
        message: data.error_description || 'GitHub OAuth authentication failed'
      });
    }

    // Parse scopes from response
    const scopes = data.scope ? data.scope.split(',') : ['read:user', 'user:email', 'repo'];

    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      scope: scopes.join(','),
      expires_in: 3600
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred during token exchange'
    });
  }
}
