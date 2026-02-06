import { useState, useEffect } from 'react';

export function useGoogleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if participant token exists
    const token = localStorage.getItem('participant_token');
    if (token) {
      // Verify token is still valid (basic check)
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('participant_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('participant_token');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}
