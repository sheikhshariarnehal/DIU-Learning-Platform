#!/usr/bin/env node

/**
 * Admin Authentication Backup Verification Script
 * Generated: 2025-08-30
 * Purpose: Verify the integrity and completeness of admin authentication backup
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Main verification function
async function verifyBackup() {
  log('\n🔍 Admin Authentication Backup Verification', 'bold');
  log('=' .repeat(50), 'blue');
  
  let totalChecks = 0;
  let passedChecks = 0;
  
  // Define expected backup files
  const backupFiles = [
    {
      name: 'Database Schema Backup',
      path: 'database/admin_auth_backup_2025-08-30.sql',
      requiredContent: [
        'CREATE TABLE IF NOT EXISTS public.admin_users',
        'CREATE TABLE IF NOT EXISTS public.admin_sessions',
        'ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY',
        'CREATE POLICY "Service role full access admin_users"',
        'CREATE INDEX IF NOT EXISTS idx_admin_users_email'
      ]
    },
    {
      name: 'API Logic Backup',
      path: 'database/admin_auth_api_backup_2025-08-30.md',
      requiredContent: [
        'middleware.ts',
        'app/api/auth/login/route.ts',
        'app/api/auth/me/route.ts',
        'bcrypt.compare',
        'jwt.sign'
      ]
    },
    {
      name: 'Supabase Configuration Backup',
      path: 'database/supabase_config_backup_2025-08-30.ts',
      requiredContent: [
        'createClient',
        'getSupabaseConfig',
        'AdminUser',
        'AdminSession',
        'validateAdminSession'
      ]
    },
    {
      name: 'Restoration Guide',
      path: 'database/ADMIN_AUTH_RESTORATION_GUIDE.md',
      requiredContent: [
        'Database Restoration',
        'API Routes Restoration',
        'Configuration Restoration',
        'Verification Steps',
        'Troubleshooting'
      ]
    }
  ];

  // Check backup files
  log('\n📁 Checking Backup Files:', 'yellow');
  
  for (const file of backupFiles) {
    totalChecks++;
    log(`\n  Checking: ${file.name}`, 'blue');
    
    if (!fileExists(file.path)) {
      log(`    ❌ File not found: ${file.path}`, 'red');
      continue;
    }
    
    log(`    ✅ File exists: ${file.path}`, 'green');
    
    const content = readFile(file.path);
    if (!content) {
      log(`    ❌ Could not read file content`, 'red');
      continue;
    }
    
    // Check required content
    let contentChecks = 0;
    let contentPassed = 0;
    
    for (const requiredText of file.requiredContent) {
      contentChecks++;
      if (content.includes(requiredText)) {
        contentPassed++;
        log(`    ✅ Contains: ${requiredText}`, 'green');
      } else {
        log(`    ❌ Missing: ${requiredText}`, 'red');
      }
    }
    
    if (contentPassed === contentChecks) {
      passedChecks++;
      log(`    ✅ Content verification passed (${contentPassed}/${contentChecks})`, 'green');
    } else {
      log(`    ❌ Content verification failed (${contentPassed}/${contentChecks})`, 'red');
    }
  }

  // Check project structure
  log('\n🏗️  Checking Project Structure:', 'yellow');
  
  const projectFiles = [
    'middleware.ts',
    'app/api/auth/login/route.ts',
    'app/api/auth/me/route.ts',
    'app/api/admin/users/route.ts',
    'lib/supabase.ts',
    'package.json'
  ];

  for (const file of projectFiles) {
    totalChecks++;
    if (fileExists(file)) {
      passedChecks++;
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} (missing)`, 'red');
    }
  }

  // Check environment variables template
  log('\n🔧 Checking Environment Configuration:', 'yellow');
  
  const envTemplate = `
# Required Environment Variables for Admin Authentication:
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
`;

  totalChecks++;
  if (fileExists('.env.local') || fileExists('.env.example')) {
    passedChecks++;
    log('  ✅ Environment file exists', 'green');
  } else {
    log('  ❌ No environment file found (.env.local or .env.example)', 'red');
    log('  💡 Create .env.local with the following variables:', 'yellow');
    log(envTemplate, 'blue');
  }

  // Check package.json dependencies
  log('\n📦 Checking Dependencies:', 'yellow');
  
  const packageJsonPath = 'package.json';
  if (fileExists(packageJsonPath)) {
    const packageContent = readFile(packageJsonPath);
    if (packageContent) {
      const packageJson = JSON.parse(packageContent);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = [
        '@supabase/supabase-js',
        'bcryptjs',
        'jsonwebtoken',
        'next'
      ];

      for (const dep of requiredDeps) {
        totalChecks++;
        if (dependencies[dep]) {
          passedChecks++;
          log(`  ✅ ${dep}: ${dependencies[dep]}`, 'green');
        } else {
          log(`  ❌ ${dep} (missing)`, 'red');
        }
      }
    }
  }

  // Generate verification report
  log('\n📊 Verification Report:', 'bold');
  log('=' .repeat(30), 'blue');
  
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  log(`Total Checks: ${totalChecks}`, 'blue');
  log(`Passed: ${passedChecks}`, passedChecks === totalChecks ? 'green' : 'yellow');
  log(`Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks === 0 ? 'green' : 'red');
  log(`Success Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

  if (passedChecks === totalChecks) {
    log('\n🎉 Backup verification completed successfully!', 'green');
    log('✅ All admin authentication components are properly backed up.', 'green');
  } else {
    log('\n⚠️  Backup verification completed with issues.', 'yellow');
    log('❌ Some components may be missing or incomplete.', 'red');
    log('📖 Check the restoration guide for troubleshooting steps.', 'blue');
  }

  // Generate backup summary
  log('\n📋 Backup Summary:', 'bold');
  log('=' .repeat(20), 'blue');
  log('The following components have been backed up:', 'blue');
  log('• Database schema (tables, constraints, indexes)', 'green');
  log('• RLS policies for security', 'green');
  log('• API routes and middleware logic', 'green');
  log('• Supabase configuration and helpers', 'green');
  log('• Complete restoration guide', 'green');
  log('• Verification script (this file)', 'green');

  log('\n🔄 Next Steps:', 'bold');
  log('1. Review any failed checks above', 'blue');
  log('2. Follow the restoration guide if needed', 'blue');
  log('3. Test the authentication system thoroughly', 'blue');
  log('4. Keep these backup files in a secure location', 'blue');

  log('\n📞 Support:', 'bold');
  log('If you encounter issues:', 'blue');
  log('• Check database/ADMIN_AUTH_RESTORATION_GUIDE.md', 'blue');
  log('• Verify environment variables are correct', 'blue');
  log('• Test database connectivity separately', 'blue');
  log('• Review Supabase logs for detailed errors', 'blue');

  return passedChecks === totalChecks;
}

// Run verification if script is executed directly
if (require.main === module) {
  verifyBackup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n💥 Verification script error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { verifyBackup };
