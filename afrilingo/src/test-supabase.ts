import { supabase } from './lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check connection
    const { data, error } = await supabase
      .from('languages')
      .select('*');
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('✓ Connected to Supabase!');
    console.log('Languages found:', data);
    
    // Test 2: Check auth
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user || 'Not logged in');
    
    // Test 3: Check tables
    const tables = ['profiles', 'languages', 'lessons', 'exercises'];
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.error(`✗ Error accessing ${table}:`, tableError.message);
      } else {
        console.log(`✓ Table ${table} is accessible`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Test failed:', err);
    return false;
  }
}

// Helper function to setup initial data
export async function setupInitialData() {
  try {
    console.log('Setting up initial data...');
    
    // Check if languages exist
    const { data: languages } = await supabase
      .from('languages')
      .select('*');
    
    if (!languages || languages.length === 0) {
      // Insert initial languages
      const { error } = await supabase
        .from('languages')
        .insert([
          { code: 'yo', name: 'Yoruba', native_name: 'Yorùbá' },
          { code: 'ig', name: 'Igbo', native_name: 'Igbo' },
          { code: 'ha', name: 'Hausa', native_name: 'Hausa' }
        ]);
      
      if (error) {
        console.error('Error inserting languages:', error);
      } else {
        console.log('✓ Languages inserted successfully');
      }
    } else {
      console.log('✓ Languages already exist');
    }
    
    return true;
  } catch (err) {
    console.error('Setup failed:', err);
    return false;
  }
}

// Run the test
console.log('=== AfriLingo Database Test ===\n');
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n✓ All tests passed!');
    setupInitialData();
  } else {
    console.log('\n✗ Tests failed. Please check your configuration.');
  }
});