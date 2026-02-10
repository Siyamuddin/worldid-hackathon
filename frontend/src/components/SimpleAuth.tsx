import { useState } from 'react';
import api from '../lib/api';

interface SimpleAuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: any) => void;
}

export function SimpleAuth({ onSuccess, onError }: SimpleAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (isLogin) {
        // Login
        response = await api.post('/api/auth/login', {
          email,
          password,
        });
      } else {
        // Register
        response = await api.post('/api/auth/register', {
          email,
          password,
          name: name || undefined,
        });
      }

      // Store participant token
      localStorage.setItem('participant_token', response.data.access_token);
      onSuccess?.(response.data.access_token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Authentication failed';
      setError(errorMessage);
      onError?.(error);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex gap-2 mb-3 sm:mb-4">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError('');
          }}
          className={`flex-1 py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
            isLogin
              ? 'bg-[#00FFC2] text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError('');
          }}
          className={`flex-1 py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
            !isLogin
              ? 'bg-[#00FFC2] text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
              Name (Optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
              placeholder="Your name"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
            placeholder="••••••••"
          />
          {!isLogin && (
            <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-[#00FFC2] hover:underline"
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}
