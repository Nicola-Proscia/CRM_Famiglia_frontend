import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(email, password);
      setAuth(result.user, result.token);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  return { user, token, isAuthenticated, isLoading, login, logout: handleLogout };
}

export function useInitAuth() {
  const { token, setAuth, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsInitialized(true);
      return;
    }

    authApi
      .me()
      .then((user) => {
        setAuth(user, token);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  return { isInitialized };
}
