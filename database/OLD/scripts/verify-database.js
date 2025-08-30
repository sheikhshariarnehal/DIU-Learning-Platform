/**
 * Database verification script for DIU Learning Platform
 * This script checks if all required tables and columns exist in Supabase
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

const requiredTables = {
  semesters: ['id', 'title', 'description', 'section', 'has_midterm', 'has_final', 'created_at', 'updated_at'],
  courses: ['id', 'title', 'course_code', 'teacher_name', 'semester_id', 'created_at', 'updated_at'],
  topics: ['id', 'title', 'description', 'course_id', 'order_index', 'created_at', 'updated_at'],
  slides: ['id', 'title', 'google_drive_url', 'topic_id', 'order_index', 'created_at', 'updated_at'],
  videos: ['id', 'title', 'youtube_url', 'topic_id', 'order_index', 'created_at', 'updated_at'],
  study_tools: ['id', 'title', 'type', 'content_url', 'course_id', 'exam_type', 'created_at', 'updated_at'],
  admin_users: ['id', 'email', 'password_hash', 'full_name', 'role', 'is_active', 'last_login', 'created_at', 'updated_at'],
  admin_sessions: ['id', 'user_id', 'session_token', 'expires_at', 'created_at']
};

// Expected data types for critical columns
const columnTypes = {
  semesters: {
    description: 'text',
    section: 'character varying',
    has_midterm: 'boolean',
    has_final: 'boolean'
  },
  topics: {
    description: 'text',
    order_index: 'integer'
  },
  study_tools: {
    type: 'character varying',
    exam_type: 'character varying'
  }
};

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false; // Table doesn't exist
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error && error.message.includes(`column "${columnName}" does not exist`)) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying database schema...\n');
  
  let allGood = true;
  
  for (const [tableName, columns] of Object.entries(requiredTables)) {
    console.log(`📋 Checking table: ${tableName}`);
    
    const tableExists = await checkTableExists(tableName);
    if (!tableExists) {
      console.log(`  ❌ Table '${tableName}' does not exist`);
      allGood = false;
      continue;
    }
    
    console.log(`  ✅ Table '${tableName}' exists`);
    
    for (const columnName of columns) {
      const columnExists = await checkColumnExists(tableName, columnName);
      if (!columnExists) {
        console.log(`    ❌ Column '${columnName}' missing in '${tableName}'`);
        allGood = false;
      } else {
        console.log(`    ✅ Column '${columnName}' exists`);
      }
    }
    console.log('');
  }
  
  if (allGood) {
    console.log('🎉 All tables and columns exist! Database schema is correct.');
  } else {
    console.log('⚠️  Database schema issues found.');
    console.log('\n📝 To fix these issues:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the complete-database-setup.sql script (RECOMMENDED)');
    console.log('   OR run setup-database.sql for schema only');
    console.log('4. Or run the individual SQL files in order:');
    console.log('   - 01-create-tables.sql');
    console.log('   - 02-seed-data.sql');
    console.log('   - 03-admin-tables.sql');
    console.log('   - 04-alter-topics-add-description.sql');
    console.log('\n🔧 Quick fix for missing description column:');
    console.log('   ALTER TABLE semesters ADD COLUMN IF NOT EXISTS description TEXT;');
  }
}

async function testSemesterInsert() {
  console.log('\n🧪 Testing semester creation...');
  
  try {
    const testSemester = {
      title: 'Test Semester',
      description: 'Test description',
      section: 'TEST',
      has_midterm: true,
      has_final: true
    };
    
    const { data, error } = await supabase
      .from('semesters')
      .insert([testSemester])
      .select()
      .single();
    
    if (error) {
      console.log(`❌ Failed to create test semester: ${error.message}`);
      return false;
    }
    
    console.log('✅ Test semester created successfully');
    
    // Clean up - delete the test semester
    await supabase
      .from('semesters')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test semester cleaned up');
    return true;
  } catch (error) {
    console.log(`❌ Error testing semester creation: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    await verifyDatabase();
    await testSemesterInsert();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyDatabase, testSemesterInsert };
