const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function clearUsers() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Connecting to Supabase...");
    
    // We cannot use DELETE without a filter easily unless configured, so we fetch and delete.
    const { data, error } = await supabase.from('users').select('id');
    if (error) {
      console.error("Error fetching users:", error);
    } else if (data && data.length > 0) {
      console.log(`Found ${data.length} users. Deleting...`);
      const { error: delError } = await supabase.from('users').delete().in('id', data.map(u => u.id));
      if (delError) {
        console.error("Delete error:", delError);
      } else {
        console.log("Successfully deleted users from Supabase.");
      }
      
      // Also truncate pin data just in case? The user said "since i changed the webapp previous logins are no longer relevant". 
      // I will only clear the `users` table as requested.
    } else {
      console.log("No users found in Supabase.");
    }
  }

  // Clear local stats.json
  const statsPath = path.join(__dirname, 'src', 'data', 'stats.json');
  if (fs.existsSync(statsPath)) {
    fs.writeFileSync(statsPath, JSON.stringify({ users: [] }, null, 2));
    console.log("Cleared local stats.json");
  }
}

clearUsers();
