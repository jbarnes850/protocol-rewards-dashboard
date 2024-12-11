import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

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

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Missing or invalid authorization header'
    });
  }

  const currentToken = authHeader.substring(7);

  try {
    // Exchange the current token for a new one
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: requiredEnvVars.VITE_GITHUB_CLIENT_ID,
        client_secret: requiredEnvVars.GITHUB_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: currentToken
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('GitHub OAuth refresh error:', data);
      return res.status(400).json({
        error: data.error,
        message: data.error_description || 'Failed to refresh access token'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred during token refresh'
    });
  }
}