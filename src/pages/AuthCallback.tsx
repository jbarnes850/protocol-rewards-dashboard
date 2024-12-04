import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'sonner';

interface AuthError {
  type: 'scope' | 'rate_limit' | 'network' | 'unknown';
  message: string;
  retryable: boolean;
}

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGitHubCallback, loginWithGitHub } = useAuth();

  const parseError = (error: string, description?: string): AuthError => {
    if (error.includes('scope') || description?.includes('scope')) {
      return {
        type: 'scope',
        message: 'Additional permissions are needed for full functionality',
        retryable: true
      };
    }
    if (error.includes('rate limit') || description?.includes('rate limit')) {
      return {
        type: 'rate_limit',
        message: 'Too many attempts. Please wait a moment',
        retryable: true
      };
    }
    if (error.includes('network') || description?.includes('network')) {
      return {
        type: 'network',
        message: 'Network connection issue. Please check your connection',
        retryable: true
      };
    }
    return {
      type: 'unknown',
      message: description || 'Authentication failed',
      retryable: false
    };
  };

  const handleAuthError = async (error: AuthError) => {
    console.error('Auth error:', error);

    switch (error.type) {
      case 'scope':
        toast.error(error.message, {
          action: {
            label: 'Grant Access',
            onClick: () => loginWithGitHub()
          }
        });
        // Wait a moment before redirecting to allow toast to be seen
        await new Promise(resolve => setTimeout(resolve, 2000));
        loginWithGitHub();
        break;

      case 'rate_limit':
        toast.warning(error.message);
        // Wait 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (error.retryable) {
          loginWithGitHub();
        } else {
          navigate('/');
        }
        break;

      case 'network':
        toast.error(error.message, {
          action: {
            label: 'Retry',
            onClick: () => loginWithGitHub()
          }
        });
        break;

      default:
        toast.error(error.message);
        navigate('/');
        break;
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    console.log('Auth callback params:', { code, state, error, error_description });

    if (error || !code || !state) {
      const authError = parseError(error || 'missing_params', error_description);
      handleAuthError(authError);
      return;
    }

    handleGitHubCallback(code, state)
      .then(() => {
        toast.success('Successfully connected with GitHub');
        navigate('/');
      })
      .catch((err: Error) => {
        const authError = parseError(err.message, err.message);
        handleAuthError(authError);
      });
  }, [searchParams, navigate, handleGitHubCallback, loginWithGitHub]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-near-purple mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white">Connecting to GitHub...</h2>
        <p className="text-gray-400 mt-2">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
}