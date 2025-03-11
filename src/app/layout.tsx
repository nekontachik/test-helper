import './globals.css';
import { Inter } from 'next/font/google';
import { DesignSystemProvider } from '@/design-system';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

// Add type declaration for the __THEME_INITIALIZED__ property
declare global {
  interface Window {
    __THEME_INITIALIZED__?: boolean;
  }
}

// Create a script to prevent flash of unstyled content
function createNoFlashScript(): string {
  return `
    (function() {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        // Check if already initialized to prevent duplicate initialization
        if (window.__THEME_INITIALIZED__) return;
        
        // Mark as initialized immediately
        window.__THEME_INITIALIZED__ = true;
        
        // Apply theme immediately before any React code runs
        var storedTheme = null;
        try {
          storedTheme = localStorage.getItem('theme');
        } catch (storageError) {
          console.warn('Error accessing localStorage:', storageError);
        }
        
        if (storedTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
        }
        
        // Force all elements to be visible
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        
        // Add a class to indicate JS is enabled
        document.documentElement.classList.add('js-enabled');
        
        // Disable all transitions during initial load
        var style = document.createElement('style');
        style.textContent = '* { transition: none !important; }';
        document.head.appendChild(style);
        
        // Remove the style after a short delay to re-enable transitions
        setTimeout(function() {
          document.head.removeChild(style);
        }, 100);
      } catch (e) {
        console.warn('Error in theme initialization script:', e);
        // Default to light theme in case of error
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
          document.documentElement.style.visibility = 'visible';
          document.documentElement.style.opacity = '1';
          document.documentElement.classList.add('js-enabled');
        }
      }
    })();
  `;
}

// Create a script to ensure styles are properly applied after load
function createPostLoadScript(): string {
  return `
    (function() {
      try {
        // Wait for the page to fully load
        window.addEventListener('load', function() {
          // Force a repaint to ensure all styles are applied
          document.body.style.display = 'none';
          setTimeout(function() {
            document.body.style.display = '';
          }, 0);
          
          // Add a class to indicate the page is fully loaded
          document.documentElement.classList.add('page-loaded');
          
          // Re-enable transitions
          setTimeout(function() {
            document.documentElement.classList.add('transitions-enabled');
          }, 100);
        });
      } catch (e) {
        console.warn('Error in post-load script:', e);
      }
    })();
  `;
}

export const metadata: Metadata = {
  title: 'Testing Buddy',
  description: 'A comprehensive test case management solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: createNoFlashScript() }} />
        <script dangerouslySetInnerHTML={{ __html: createPostLoadScript() }} />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <DesignSystemProvider>
          <main id="main-content">
            <div className="content-container">
              {children}
            </div>
          </main>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
