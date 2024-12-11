import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test endpoint to simulate various OAuth error scenarios
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { scenario } = req.query;

  // Handle initial OAuth redirect (GET request)
  if (req.method === 'GET') {
    const { redirect_uri, state } = req.query;

    // Simulate GitHub OAuth redirect with test scenario
    const code = `test_${req.query.scenario || 'success'}`;
    const redirectUrl = `${redirect_uri}?code=${code}&state=${state}`;
    return res.redirect(302, redirectUrl);
  }

  // Handle token exchange (POST request)
  if (req.method === 'POST') {
    switch (scenario) {
      case 'success':
        return res.status(200).json({
          access_token: 'test_valid_token',
          token_type: 'bearer',
          scope: 'read:user,user:email,repo',
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

      case 'expired_token':
        return res.status(401).json({
          error: 'expired_token',
          message: 'The access token has expired'
        });

      case 'rate_limit':
        return res.status(429).json({
          error: 'rate_limit_exceeded',
          message: 'API rate limit exceeded'
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
