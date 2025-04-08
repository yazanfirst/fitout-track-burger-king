
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrl = "https://zpwuusvgaehisdnxcild.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3V1c3ZnYWVoaXNkbnhjaWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDg4NDEsImV4cCI6MjA1OTY4NDg0MX0.SA9hXvxAS9-Mygv1ImWqlxGxvE0GBQrPdZbwlqz_hJQ";

// Validate the environment variables with more robust error handling
if (!supabaseUrl) {
  console.error('Missing Supabase URL');
  throw new Error('Supabase URL is required. Please connect to Supabase using the green Supabase button in the top right corner.');
}

if (!supabaseKey) {
  console.error('Missing Supabase Anon Key');
  throw new Error('Supabase Anon Key is required. Please connect to Supabase using the green Supabase button in the top right corner.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase as default };
