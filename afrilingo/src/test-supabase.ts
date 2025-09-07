import { supabase } from './lib/supabase';

export async function testSupabaseConnection() {
  try {
    // Test 1: Check connection
    const { data, error } = await supabase
      .from('languages')
      .select('*');
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('✅ Connected to Supabase!');
    console.log('Languages found:', data);
    
    // Test 2: Check auth
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user || 'Not logged in');
    
    return true;
  } catch (err) {
    console.error('Test failed:', err);
    return false;
  }
}

// Run the test
testSupabaseConnection();