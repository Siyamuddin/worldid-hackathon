import { useState, useEffect, useCallback } from 'react';

export function useGoogleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    // Check if participant token exists
    const token = localStorage.getItem('participant_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();

    // Listen for storage changes (e.g., from other tabs or after login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'participant_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case localStorage was updated in the same tab
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const login = useCallback((token: string) => {
    localStorage.setItem('participant_token', token);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('participant_token');
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}
