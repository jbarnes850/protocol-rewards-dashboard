import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test endpoint to simulate various OAuth error scenarios
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only POST requests are allowed'
    });
  }

  const { scenario } = req.query;

  switch (scenario) {
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
