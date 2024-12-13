import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Spinner } from '../components/ui/Spinner';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGitHubCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Missing code or state parameter');
        }

        // Check if localStorage is available
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
        } catch (e) {
          throw new Error('localStorage is not available. Please enable cookies.');
        }

        console.log('Starting GitHub callback...');
        await handleGitHubCallback(code, state);
        console.log('GitHub callback completed');
        navigate('/');
      } catch (error) {
        console.error('Auth error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        navigate('/', { state: { error: error instanceof Error ? error.message : 'Authentication failed' } });
      }
    };

    handleAuth();
  }, [searchParams, navigate, handleGitHubCallback]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner className="w-8 h-8 text-blue-500" />
      <div className="text-lg text-gray-400">Authenticating with GitHub...</div>
    </div>
  );
}
