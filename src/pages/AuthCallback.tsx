import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Spinner } from '../components/ui/Spinner';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { client } = useClerk();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Handle Clerk OAuth callback
        const handshakeCode = searchParams.get('code');
        if (!handshakeCode) {
          throw new Error('No code provided');
        }

        // Clerk handles the OAuth flow automatically
        // Just redirect to dashboard after verification
        if (user) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/', {
          replace: true,
          state: { error: error instanceof Error ? error.message : 'Authentication failed' }
        });
      }
    };

    handleAuth();
  }, [searchParams, navigate, user, client]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner className="w-8 h-8 text-blue-500" />
      <div className="text-lg text-gray-400">
        Completing authentication...
      </div>
    </div>
  );
}
