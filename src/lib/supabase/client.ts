import { createBrowserClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import { type SupabaseClient } from '@supabase/supabase-js';
import { mockSupabase, shouldUseMockClient } from './mockClient';

export function createClient(): SupabaseClient {
  // Use mock client for development if configured
  if (shouldUseMockClient()) {
    logger.info('Using mock Supabase client');
    return mockSupabase as unknown as SupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Create a singleton instance for client-side usage
export const supabase = createClient(); 