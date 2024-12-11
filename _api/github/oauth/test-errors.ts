import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test endpoint to simulate various OAuth error scenarios
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure proper type handling for query parameters
    const scenario = typeof req.query.scenario === 'string' ? req.query.scenario : 'success';
    const redirect_uri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle initial OAuth redirect (GET request)
    if (req.method === 'GET') {
      // Parse state parameter
      let stateObj;
      try {
        stateObj = state ? JSON.parse(decodeURIComponent(state)) : null;
        if (!stateObj || !stateObj.state || !stateObj.timestamp) {
          throw new Error('Invalid state format');
        }
      } catch (error) {
        return res.status(400).json({
          error: 'invalid_state',
          message: 'Invalid state parameter format'
        });
      }

      // Default to success scenario if none specified
      switch (scenario) {
        case 'success':
          const code = 'test_success_code_' + Date.now();
          return res.redirect(302, `${redirect_uri}?code=${code}&state=${encodeURIComponent(state)}`);

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

      // Default to success scenario if none specified
      switch (scenario) {
        case 'success':
          return res.status(200).json({
            access_token: 'test_valid_token_' + Date.now(),
            token_type: 'bearer',
            scope: 'read:user user:email',
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
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    });
  }
}
