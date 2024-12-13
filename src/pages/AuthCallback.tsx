import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Spinner } from '../components/ui/Spinner';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGitHubCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'initializing' | 'authenticating' | 'redirecting'>('initializing');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        setStatus('authenticating');
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

        await handleGitHubCallback(code, state);
        setStatus('redirecting');

        // Use requestAnimationFrame to ensure state updates are processed
        requestAnimationFrame(() => {
          navigate('/', { replace: true });
        });
      } catch (error) {
        console.error('Auth error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('redirecting');

        requestAnimationFrame(() => {
          navigate('/', {
            replace: true,
            state: { error: error instanceof Error ? error.message : 'Authentication failed' }
          });
        });
      }
    };

    handleAuth();
  }, [searchParams, navigate, handleGitHubCallback]);

  const getStatusMessage = () => {
    switch (status) {
      case 'initializing':
        return 'Preparing authentication...';
      case 'authenticating':
        return 'Authenticating with GitHub...';
      case 'redirecting':
        return 'Redirecting to dashboard...';
      default:
        return 'Processing...';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-lg">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-400"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner className="w-8 h-8 text-blue-500" />
      <div className="text-lg text-gray-400">
        {getStatusMessage()}
      </div>
    </div>
  );
}
