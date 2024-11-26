import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGitHubCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Failed to authenticate with GitHub');
      navigate('/');
      return;
    }

    if (code) {
      handleGitHubCallback(code)
        .then(() => {
          toast.success('Successfully connected with GitHub');
          navigate('/');
        })
        .catch((err) => {
          console.error('Auth error:', err);
          toast.error('Authentication failed');
          navigate('/');
        });
    }
  }, [searchParams, navigate, handleGitHubCallback]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-near-purple mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-near-black">Connecting to GitHub...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
}