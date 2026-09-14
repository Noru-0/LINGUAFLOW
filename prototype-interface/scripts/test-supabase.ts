import { supabase } from '../lib/db/supabase';

async function testSupabase() {
  console.log('Testing Supabase query on cards table...');
  const { data, error } = await supabase.from('cards').select('*').limit(1);
  if (error) {
    console.error('Supabase error:', error.message);
  } else {
    console.log('Cards table columns:', data.length > 0 ? Object.keys(data[0]) : 'Table is empty');
  }
}

testSupabase();
