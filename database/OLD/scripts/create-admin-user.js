/**
 * Script to create the initial admin user for DIU Learning Platform
 * Run this script after setting up the database to create the first admin user
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

async function createAdminUser() {
  try {
    console.log('🚀 Creating initial admin user...');

    // Default admin user credentials
    const adminData = {
      email: 'admin@diu.edu.bd',
      password: 'admin123', // Change this in production!
      full_name: 'System Administrator',
      role: 'admin',
      department: 'IT Department',
      phone: '+880-1234-567890'
    };

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', adminData.email)
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists:', adminData.email);
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password: admin123 (please change this!)');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const { data: newUser, error } = await supabase
      .from('admin_users')
      .insert({
        email: adminData.email,
        password_hash,
        full_name: adminData.full_name,
        role: adminData.role,
        department: adminData.department,
        phone: adminData.phone,
        is_active: true,
        login_count: 0
      })
      .select('id, email, full_name, role')
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin User Details:');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Name:', newUser.full_name);
    console.log('   Role:', newUser.role);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('');
    console.log('🌐 Access the admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
