import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state } = req.body;
  console.log('Received code and state:', { code, state });

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.VITE_GITHUB_CLIENT_ID,
        client_secret: process.env.VITE_GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.VITE_APP_URL}/auth/callback`,
        state,
      }),
    });

    const data = await response.json();
    console.log('GitHub response:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ message: 'Failed to exchange code for token' });
  }
}