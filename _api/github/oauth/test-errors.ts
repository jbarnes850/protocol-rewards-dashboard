import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test endpoint to simulate various OAuth error scenarios
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { scenario, redirect_uri, state } = req.query;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Handle initial OAuth redirect (GET request)
  if (req.method === 'GET') {
    switch (scenario) {
      case 'success':
        const code = 'test_success_code_' + Date.now();
        return res.redirect(302, `${redirect_uri}?code=${code}&state=${state}`);

      case 'expired_state':
        return res.status(401).json({
          error: 'expired_state',
          message: 'The state parameter has expired'
        });

      case 'invalid_token':
        return res.status(401).json({
          error: 'bad_verification_code',
          message: 'The authorization code is invalid'
        });

      case 'network_error':
        return res.status(503).json({
          error: 'service_unavailable',
          message: 'GitHub API is temporarily unavailable'
        });

      case 'scope_denied':
        return res.status(403).json({
          error: 'scope_denied',
          message: 'Required permissions were not granted'
        });

      default:
        return res.status(400).json({
          error: 'invalid_scenario',
          message: 'Invalid test scenario specified'
        });
    }
  }

  // Handle token exchange (POST request)
  if (req.method === 'POST') {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Authorization code is required'
      });
    }

    switch (scenario) {
      case 'success':
        return res.status(200).json({
          access_token: 'test_valid_token_' + Date.now(),
          token_type: 'bearer',
          scope: 'read:user user:email repo',
          expires_in: 3600
        });

      case 'network_error':
        return res.status(503).json({
          error: 'service_unavailable',
          message: 'GitHub API is temporarily unavailable'
        });

      case 'invalid_token':
        return res.status(401).json({
          error: 'invalid_token',
          message: 'The access token provided is invalid'
        });

      default:
        return res.status(400).json({
          error: 'invalid_scenario',
          message: 'Invalid test scenario specified'
        });
    }
  }

  return res.status(405).json({
    error: 'method_not_allowed',
    message: 'Only GET and POST requests are allowed'
  });
}
