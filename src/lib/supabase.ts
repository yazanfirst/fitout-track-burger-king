
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate the environment variables with more robust error handling
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  throw new Error('Supabase URL is required. Please connect to Supabase using the green Supabase button in the top right corner.');
}

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Supabase Anon Key is required. Please connect to Supabase using the green Supabase button in the top right corner.');
}

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
