// src/pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setError(error?.message || 'Verification failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Session verified — redirect to home or account
      navigate('/account', { replace: true });
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <div className="text-center max-w-md px-4">
        {error ? (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <p className="text-xs text-gray-400">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#008ECC] border-t-transparent mx-auto mb-4" />
            <p className="text-gray-500">Verifying your email...</p>
          </>
        )}
      </div>
    </div>
  );
}