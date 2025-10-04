import { useState, useEffect } from 'react';
import { AppwriteAuth, type AuthUser } from '../lib/appwrite';

interface UseAppwriteAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: {
    google: () => Promise<void>;
    github: () => Promise<void>;
  };
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAppwriteAuth = (): UseAppwriteAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = AppwriteAuth.getInstance();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentUser = await auth.checkAuthAndRefresh();
        setUser(currentUser);

        unsubscribe = auth.onAuthChange((newUser) => {
          setUser(newUser);
        });
      } catch (err) {
        console.error('Auth hook initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth]);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      await auth.loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      throw err;
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    try {
      setError(null);
      await auth.loginWithGitHub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub login failed');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await auth.logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    }
  };

  const refresh = async (): Promise<void> => {
    try {
      setError(null);
      await auth.checkAuthAndRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth refresh failed');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: {
      google: loginWithGoogle,
      github: loginWithGitHub,
    },
    logout,
    refresh,
  };
};

export default useAppwriteAuth;