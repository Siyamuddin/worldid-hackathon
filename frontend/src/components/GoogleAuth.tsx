import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import api from '../lib/api';

interface GoogleAuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: any) => void;
}

export function GoogleAuth({ onSuccess, onError }: GoogleAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      // Send Google ID token to backend for verification
      // Note: api baseURL already includes the domain, so we just need the path
      const response = await api.post('/api/auth/google/verify', {
        token: credentialResponse.credential
      });
      
      // Store participant token
      localStorage.setItem('participant_token', response.data.access_token);
      
      onSuccess?.(response.data.access_token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Google authentication failed';
      alert(`Error: ${errorMessage}`);
      onError?.(error);
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert('Google authentication failed. Please try again.');
    onError?.('Google authentication failed');
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
        Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
      {isLoading && (
        <p className="text-sm text-gray-600 text-center">Verifying...</p>
      )}
      <p className="text-xs text-gray-600 text-center">
        Sign in with Google to participate in events
      </p>
    </div>
  );
}
