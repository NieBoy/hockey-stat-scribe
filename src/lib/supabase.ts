
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://imcsyufojrvzddovvmpn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY3N5dWZvanJ2emRkb3Z2bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDcxMTksImV4cCI6MjA2MDQyMzExOX0.gUNRz-OXuFlUGC7zuygyjGFqFZKzY-yxunFeCp7vnuY";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'hockey-stats-auth-storage'
  }
});
