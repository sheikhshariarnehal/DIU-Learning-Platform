/**
 * Script to create authentication tables for DIU Learning Platform
 * Run this script to set up admin_users and admin_sessions tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file for:');
  console.error('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthTables() {
  try {
    console.log('🚀 Setting up authentication tables...');

    // Create admin_users table
    const createAdminUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'moderator', 'content_creator')) DEFAULT 'admin',
        department VARCHAR(100),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
        CONSTRAINT positive_login_count CHECK (login_count >= 0)
      );
    `;

    // Create admin_sessions table
    const createAdminSessionsTable = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT future_expiry CHECK (expires_at > created_at)
      );
    `;

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
      CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);
    `;

    console.log('📋 Checking if admin_users table exists...');

    // Try to query the table to see if it exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST205') {
      console.log('❌ admin_users table does not exist in the database');
      console.log('');
      console.log('🔧 Please create the tables manually in Supabase:');
      console.log('');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the following SQL:');
      console.log('');
      console.log(createAdminUsersTable);
      console.log('');
      console.log(createAdminSessionsTable);
      console.log('');
      console.log(createIndexes);
      console.log('');
      console.log('4. Then run: node scripts/create-admin-user.js');
      process.exit(1);
    } else if (checkError) {
      console.error('❌ Error checking admin_users table:', checkError);
      process.exit(1);
    } else {
      console.log('✅ admin_users table already exists');
    }

    // Check admin_sessions table
    const { data: existingSessions, error: sessionCheckError } = await supabase
      .from('admin_sessions')
      .select('id')
      .limit(1);

    if (sessionCheckError && sessionCheckError.code === 'PGRST205') {
      console.log('❌ admin_sessions table does not exist');
      console.log('Please create it manually using the SQL above');
      process.exit(1);
    } else if (sessionCheckError) {
      console.error('❌ Error checking admin_sessions table:', sessionCheckError);
      process.exit(1);
    } else {
      console.log('✅ admin_sessions table already exists');
    }

    console.log('✅ Authentication tables created successfully!');
    console.log('');
    console.log('📊 Tables Created:');
    console.log('   • admin_users (admin user accounts)');
    console.log('   • admin_sessions (session management)');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('   1. Run: node scripts/create-admin-user.js');
    console.log('   2. Access admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

// Run the script
setupAuthTables();
