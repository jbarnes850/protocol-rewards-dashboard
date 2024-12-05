import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state } = req.body;
  
  if (!code || !state) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.VITE_APP_URL + '/auth/callback',
        state,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return res.status(response.status).json({ 
        message: 'GitHub API error',
        error 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}