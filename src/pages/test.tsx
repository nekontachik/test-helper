// This file uses the Pages Router, not the App Router
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userData: string | null;
  sessionId: string | null;
}

export default function TestPage(): JSX.Element {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [cookieInfo, setCookieInfo] = useState<string[]>([]);

  useEffect(() => {
    // Check localStorage
    if (typeof window !== 'undefined') {
      const authData = {
        token: localStorage.getItem('authToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: localStorage.getItem('userData'),
        sessionId: localStorage.getItem('sessionId')
      };
      setAuthState(authData);
      
      // Get cookies
      setCookieInfo(document.cookie.split(';').map(c => c.trim()));
    }
  }, []);

  const clearAuth = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionId');
    
    // Clear cookies
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Refresh state
    setAuthState({
      token: null,
      refreshToken: null,
      userData: null,
      sessionId: null
    });
    
    setCookieInfo(document.cookie.split(';').map(c => c.trim()));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Auth Test Page</title>
      </Head>
      
      <h1>Authentication Test Page</h1>
      <p>This page is for diagnosing authentication issues.</p>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Local Storage Auth State</h2>
        <pre>{JSON.stringify(authState, null, 2)}</pre>
      </div>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Cookies</h2>
        <ul>
          {cookieInfo.map((cookie, i) => (
            <li key={i}>{cookie}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={clearAuth}
          style={{ padding: '10px 15px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
        >
          Clear Auth Data
        </button>
        
        <button 
          onClick={() => router.push('/auth/signin')}
          style={{ padding: '10px 15px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
        >
          Go to Sign In
        </button>
        
        <button 
          onClick={() => router.push('/dashboard?bypass=true')}
          style={{ padding: '10px 15px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Dashboard (Bypass Auth)
        </button>
      </div>
    </div>
  );
} 