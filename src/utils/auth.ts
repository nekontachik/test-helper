/**
 * Authentication utility functions
 */

/**
 * Redirects to signin page with the current URL as callback
 */
export function redirectToSignin(currentPath?: string): void {
  if (typeof window !== 'undefined') {
    const callbackUrl = currentPath || window.location.pathname;
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
}

/**
 * Alias for redirectToSignin - backward compatibility
 */
export function redirectToLogin(currentPath?: string): void {
  redirectToSignin(currentPath);
}

/**
 * Redirects to dashboard or specified callback URL
 */
export function redirectToDashboard(callbackUrl?: string): void {
  if (typeof window !== 'undefined') {
    window.location.href = callbackUrl || '/dashboard';
  }
}

/**
 * Clears authentication state from local storage and session storage
 */
export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Add any other auth-related items to clear here
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('next-auth') || name.includes('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
}

/**
 * Handles logout by clearing state and redirecting to signin
 */
export function handleLogout(): void {
  clearAuthState();
  redirectToSignin();
}

/**
 * Checks if the current path is a public path that doesn't require authentication
 */
export function isPublicPath(path: string): boolean {
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/register',
    '/auth/reset-password',
    '/auth/verify',
  ];
  
  return publicPaths.some(publicPath => path.startsWith(publicPath));
} 