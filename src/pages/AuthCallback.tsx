import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Spinner } from '../components/ui/Spinner';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { client } = useClerk();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Auth callback initiated', {
          hasCode: !!searchParams.get('code'),
          isLoaded,
          hasUser: !!user
        });

        if (!isLoaded) {
          console.log('Clerk still loading...');
          return;
        }
        
        const handshakeCode = searchParams.get('code');
        if (!handshakeCode) {
          console.error('No handshake code found in URL');
          throw new Error('No code provided');
        }

        console.log('Handshake code found, waiting for user...');

        // Wait for user to be available
        if (user) {
          console.log('User authenticated successfully, redirecting...');
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
  }, [searchParams, navigate, user, isLoaded, client]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner className="w-8 h-8 text-near-purple" />
      <div className="text-lg text-gray-400">
        Completing authentication...
      </div>
    </div>
  );
}
