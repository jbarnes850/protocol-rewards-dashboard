import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GitHubAuth } from '../lib/github-auth';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = GitHubAuth.getInstance();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      console.error('Missing code or state');
      navigate('/');
      return;
    }

    auth.handleCallback(code, state)
      .then(() => {
        navigate('/dashboard');
      })
      .catch(error => {
        console.error('Auth error:', error);
        navigate('/');
      });
  }, [searchParams, navigate]);

  return <div>Authenticating...</div>;
}