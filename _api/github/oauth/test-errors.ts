import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test endpoint to simulate various OAuth error scenarios
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Request method:', req.method);
    console.log('Request query parameters:', req.query);
    console.log('Request headers:', req.headers);

    // Ensure proper type handling for query parameters
    const scenario = typeof req.query.scenario === 'string' ? req.query.scenario : undefined;
    const redirect_uri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';

    console.log('Parsed parameters:', { scenario, redirect_uri, state });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle initial OAuth redirect (GET request)
    if (req.method === 'GET') {
      // Parse state parameter - handle both UUID-only and JSON formats
      let stateObj;
      try {
        // First try parsing as JSON
        stateObj = state ? JSON.parse(decodeURIComponent(state)) : null;
      } catch (error) {
        // If JSON parsing fails, check if it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (state && uuidRegex.test(state)) {
          stateObj = { state, timestamp: Date.now() };
        } else {
          return res.status(400).json({
            error: 'invalid_state',
            message: 'Invalid state parameter format'
          });
        }
      }

      // Validate scenario
      const validScenarios = ['success', 'expired_state', 'invalid_token', 'network_error', 'scope_denied'];
      if (!scenario || !validScenarios.includes(scenario)) {
        console.log('Invalid or missing scenario, defaulting to success');
        return handleSuccessScenario(res, redirect_uri, state);
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

function handleSuccessScenario(res: VercelResponse, redirect_uri: string, state: string) {
  const code = 'test_success_code_' + Date.now();
  console.log('Handling success scenario:', { redirect_uri, state, code });
  return res.redirect(302, `${redirect_uri}?code=${code}&state=${encodeURIComponent(state)}`);
}
