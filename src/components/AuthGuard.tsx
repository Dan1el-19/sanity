import React, { useState, useEffect, ReactNode } from 'react';
import { Card, Text, Flex, Stack, Button, Spinner, Container, Badge } from '@sanity/ui';
import { LogIn, User, LogOut, AlertCircle } from 'lucide-react';
import { FaGoogle, FaGithub } from "react-icons/fa";
import { AppwriteAuth, type AuthUser } from '../lib/appwrite';

/**
 * AuthGuard wraps a tool and enforces authentication using AppwriteAuth.
 * It handles initialization, OAuth redirect cleanup, and exposes
 * simple login/logout controls. When `requireAuth` is false the
 * children are rendered after auth initialization completes.
 */
interface AuthGuardProps {
  children: ReactNode;
  toolName: string;
  requireAuth?: boolean;
  showAuthStatus?: boolean; // New prop to control auth status bar
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  toolName, 
  requireAuth = true,
  showAuthStatus = true 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const auth = AppwriteAuth.getInstance();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        setAuthInitialized(false);
        
        console.log('[AuthGuard] Initializing auth for tool:', toolName);
        
        // Check if we're returning from OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const isOAuthReturn = urlParams.has('userId') || urlParams.has('secret');
        
        if (isOAuthReturn) {
          console.log('[AuthGuard] Detected OAuth return, cleaning URL...');
          // Clean the URL from OAuth parameters
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Small delay to let OAuth session establish
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check current auth state with longer timeout
        const currentUser = await auth.checkAuthAndRefresh();
        
        if (!mounted) return;
        
        setUser(currentUser);
        setAuthInitialized(true);
        
        console.log('[AuthGuard] Auth initialized. User:', currentUser ? 'authenticated' : 'not authenticated');

        // Subscribe to auth changes
        unsubscribe = auth.onAuthChange((newUser) => {
          if (!mounted) return;
          console.log('[AuthGuard] Auth state changed:', newUser ? 'logged in' : 'logged out');
          setUser(newUser);
          setAuthLoading(false);
        });
        
      } catch (err) {
        console.error('[AuthGuard] Auth initialization failed:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setAuthInitialized(true); // Set as initialized even on error to prevent infinite loading
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initAuth, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth, toolName]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await auth.loginWithGoogle();
      // OAuth redirect will handle the rest
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Google login failed. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await auth.loginWithGitHub();
      // OAuth redirect will handle the rest
    } catch (err) {
      console.error('GitHub login failed:', err);
      setError('GitHub login failed. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await auth.logout();
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed. Please try again.');
      setAuthLoading(false);
    }
  };

  // Don't require auth - but still wait for auth initialization
  if (!requireAuth) {
    if (!authInitialized) {
      return (
        <Container width={1} padding={4}>
          <Flex align="center" justify="center" direction="column" gap={3}>
            <Spinner muted />
            <Text muted>Initializing...</Text>
          </Flex>
        </Container>
      );
    }
    return <>{children}</>;
  }

  // Loading state - wait for full auth initialization
  if (loading || !authInitialized) {
    return (
      <Container width={1} padding={4}>
        <Flex align="center" justify="center" direction="column" gap={3}>
          <Spinner muted />
          <Text muted>Checking authentication...</Text>
          <Text size={0} muted>Tool: {toolName}</Text>
        </Flex>
      </Container>
    );
  }

  // User is authenticated - show the tool
  if (user) {
    return (
      <>
        {/* Auth status bar - show only if requested */}
        {showAuthStatus && (
          <Card padding={3} radius={2} shadow={1} tone="positive" marginBottom={3}>
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={2}>
                <User size={16} />
                <Text size={1} weight="medium">
                  Logged in as: {user.name || user.email}
                </Text>
                {user.emailVerification && (
                  <Badge tone="positive" mode="outline">Verified</Badge>
                )}
              </Flex>
              <Button
                mode="ghost"
                tone="critical"
                icon={LogOut}
                text="Logout"
                fontSize={1}
                padding={2}
                onClick={handleLogout}
                disabled={authLoading}
              />
            </Flex>
          </Card>
        )}

        {/* Tool content without additional container */}
        {children}
      </>
    );
  }

  // User is not authenticated - show login screen
  return (
    <Container width={1} padding={4}>
      <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
        <Card padding={4} radius={3} shadow={2} style={{ maxWidth: '400px', width: '100%' }}>
          <Stack space={4}>
            {/* Header */}
            <Flex align="center" justify="center" direction="column" gap={2}>
              <LogIn size={32} />
              <Text size={3} weight="bold" align="center">
                Authentication Required
              </Text>
              <Text size={1} muted align="center">
                Please log in to access the <strong>{toolName}</strong> tool
              </Text>
            </Flex>

            {/* Error message */}
            {error && (
              <Card padding={3} tone="critical" border>
                <Flex align="center" gap={2}>
                  <AlertCircle size={16} />
                  <Text size={1}>{error}</Text>
                </Flex>
              </Card>
            )}

            {/* Login buttons */}
            <Stack space={3}>
              <Button
                mode="default"
                tone="primary"
                width="fill"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                loading={authLoading}
              >
                <Flex align="center" justify="center" gap={2}>
                  <FaGoogle size={16} />
                  <Text>Continue with Google</Text>
                </Flex>
              </Button>
              
              <Button
                mode="default"
                tone="default"
                width="fill"
                onClick={handleGitHubLogin}
                disabled={authLoading}
                loading={authLoading}
              >
                <Flex align="center" justify="center" gap={2}>
                  <FaGithub size={16} />
                  <Text>Continue with GitHub</Text>
                </Flex>
              </Button>
            </Stack>

            {/* Info */}
            <Text size={0} muted align="center">
              Your data is securely managed by Appwrite. We only access basic profile information.
            </Text>
          </Stack>
        </Card>
      </Flex>
    </Container>
  );
};

export default AuthGuard;