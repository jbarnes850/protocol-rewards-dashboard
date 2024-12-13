import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OAuthRequestBody {
  code: string;
  state?: string;
  scenario?: string;
}

type TestScenario = 'success' | 'expired_state' | 'invalid_token' | 'network_error' | 'scope_denied';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { query, method, body } = req;
    const scenario = (query.scenario as TestScenario) || 'success';
    const redirect_uri = query.redirect_uri as string;
    const state = query.state as string;

    console.log('Test endpoint request:', {
      method,
      scenario,
      redirect_uri,
      state,
      headers: req.headers,
      body: method === 'POST' ? body : undefined
    });

    // Handle initial OAuth redirect (GET request)
    if (method === 'GET') {
      // Validate required parameters
      if (!redirect_uri || !state) {
        return res.status(400).json({
          error: 'invalid_request',
          message: 'redirect_uri and state parameters are required'
        });
      }

      // Generate test code
      const code = `test_${scenario}_${Date.now()}`;

      // Build redirect URL with proper encoding
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set('code', code);
      redirectUrl.searchParams.set('state', state);

      console.log('Test endpoint redirecting to:', redirectUrl.toString());

      // Return redirect response
      return res.redirect(302, redirectUrl.toString());
    }

    // Handle token exchange (POST request)
    if (method === 'POST') {
      const { code, state: returnedState, scenario: tokenScenario = scenario } = (body || {}) as OAuthRequestBody;

      // Validate required parameters
      if (!code || !returnedState) {
        return res.status(400).json({
          error: 'invalid_request',
          message: 'code and state parameters are required'
        });
      }

      // Handle different test scenarios
      switch (tokenScenario) {
        case 'expired_state':
          return res.status(400).json({
            error: 'invalid_state',
            message: 'The state parameter has expired'
          });

        case 'invalid_token':
          return res.status(401).json({
            error: 'invalid_token',
            message: 'The access token is invalid'
          });

        case 'network_error':
          return res.status(503).json({
            error: 'service_unavailable',
            message: 'Network error occurred'
          });

        case 'scope_denied':
          return res.status(403).json({
            error: 'scope_denied',
            message: 'Required scope was denied'
          });

        case 'success':
          return res.status(200).json({
            access_token: `test_token_${Date.now()}`,
            token_type: 'bearer',
            scope: 'read:user,user:email'
          });

        default:
          return res.status(400).json({
            error: 'invalid_scenario',
            message: 'Invalid test scenario specified'
          });
      }
    }

    // Handle unsupported methods
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
