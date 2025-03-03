
import { createClient } from '@supabase/supabase-js';
import { isSupabaseInitialized } from './supabase';

export async function submitSupportComment(comment, email = null) {
  if (!isSupabaseInitialized()) {
    throw new Error('Supabase client is not initialized. Check your environment variables.');
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('support_comments')
    .insert([
      { 
        comment: comment,
        email: email
      }
    ]);

  if (error) throw error;
  return data;
}
