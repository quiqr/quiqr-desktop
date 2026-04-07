/**
 * Auth Wrapper
 *
 * Wraps the application with auth-aware routing.
 * Checks if auth is enabled, shows login/change-password when needed.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { hasToken } from './token-storage';
import { setupAuthInterceptors } from './auth-interceptor';
import LoginPage from './LoginPage';
import ChangePasswordPage from './ChangePasswordPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'no-auth' | 'login' | 'change-password' | 'authenticated';

function AuthWrapper({ children }: AuthWrapperProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // The /api/auth/check endpoint is always public (no token needed)
      const response = await axios.get('/api/auth/check');
      const { authEnabled } = response.data;

      if (!authEnabled) {
        setAuthState('no-auth');
        return;
      }

      // Auth is enabled — set up interceptors before rendering children
      setupAuthInterceptors();

      if (hasToken()) {
        setAuthState('authenticated');
      } else {
        setAuthState('login');
      }
    } catch {
      // If auth check fails, assume no auth (backward compatibility)
      setAuthState('no-auth');
    }
  }

  function handleLogin(mustChangePassword: boolean) {
    if (mustChangePassword) {
      setAuthState('change-password');
    } else {
      setAuthState('authenticated');
    }
  }

  function handlePasswordChanged() {
    setAuthState('authenticated');
  }

  switch (authState) {
    case 'loading':
      return null;
    case 'no-auth':
      return <>{children}</>;
    case 'login':
      return <LoginPage onLogin={handleLogin} />;
    case 'change-password':
      return <ChangePasswordPage onPasswordChanged={handlePasswordChanged} />;
    case 'authenticated':
      return <>{children}</>;
  }
}

export default AuthWrapper;
