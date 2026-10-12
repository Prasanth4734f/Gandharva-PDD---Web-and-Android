const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false
    }
  });
} else {
  // Graceful dummy interface if credentials are missing
  supabase = {
    auth: {
      signInWithOtp: async () => ({ error: new Error('Supabase not configured') }),
      verifyOtp: async () => ({ error: new Error('Supabase not configured') })
    }
  };
}

module.exports = { supabase };
