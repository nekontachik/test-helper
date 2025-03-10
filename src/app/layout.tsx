import { Providers } from '@/components/providers/Providers';
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Create a script to prevent flash of unstyled content
function createNoFlashScript(): string {
  return `
    (function() {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
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
        
        // Add a class to indicate JS is enabled
        document.documentElement.classList.add('js-enabled');
      } catch (e) {
        console.warn('Error in theme initialization script:', e);
        // Default to light theme in case of error
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      }
    })();
  `;
}

export const metadata: Metadata = {
  title: 'Test Management Tool',
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
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <main id="main-content">
            {children}
          </main>
          {/* The HighContrastIndicator will be rendered by the ThemeProvider */}
        </Providers>
      </body>
    </html>
  );
}
