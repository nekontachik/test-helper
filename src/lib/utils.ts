import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getURL(path: string = ''): string {
  // Check if we have an environment variable for the URL
  const url = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Join the URL with the path, ensuring no double slashes
  return `${url.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
