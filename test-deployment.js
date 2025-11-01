// Test script to verify admin dashboard deployment
// Run with: node test-deployment.js <your-vercel-url>

const url = process.argv[2] || 'http://localhost:3000';

async function testDeployment() {
  console.log('🧪 Testing Admin Dashboard Deployment\n');
  console.log(`Target URL: ${url}\n`);

  const tests = [];

  // Test 1: Health Check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const response = await fetch(`${url}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      console.log('   ✅ Health check passed');
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Database: ${data.services?.database || 'unknown'}`);
      tests.push({ name: 'Health Check', status: 'PASS' });
    } else {
      console.log('   ❌ Health check failed');
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Database: ${data.services?.database || 'unknown'}`);
      tests.push({ name: 'Health Check', status: 'FAIL', error: data });
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
    tests.push({ name: 'Health Check', status: 'ERROR', error: error.message });
  }

  console.log('');

  // Test 2: Login Page
  console.log('2️⃣ Testing login page...');
  try {
    const response = await fetch(`${url}/login`);
    
    if (response.ok) {
      console.log('   ✅ Login page accessible');
      tests.push({ name: 'Login Page', status: 'PASS' });
    } else {
      console.log('   ❌ Login page returned:', response.status);
      tests.push({ name: 'Login Page', status: 'FAIL', error: response.status });
    }
  } catch (error) {
    console.log('   ❌ Login page error:', error.message);
    tests.push({ name: 'Login Page', status: 'ERROR', error: error.message });
  }

  console.log('');

  // Test 3: Auth API
  console.log('3️⃣ Testing auth API...');
  try {
    const response = await fetch(`${url}/api/auth/me`);
    
    if (response.status === 401 || response.status === 200) {
      console.log('   ✅ Auth API responding correctly');
      tests.push({ name: 'Auth API', status: 'PASS' });
    } else {
      console.log('   ❌ Auth API unexpected status:', response.status);
      tests.push({ name: 'Auth API', status: 'FAIL', error: response.status });
    }
  } catch (error) {
    console.log('   ❌ Auth API error:', error.message);
    tests.push({ name: 'Auth API', status: 'ERROR', error: error.message });
  }

  console.log('');

  // Test 4: Admin Page (Should redirect or show login)
  console.log('4️⃣ Testing admin page...');
  try {
    const response = await fetch(`${url}/admin`, { redirect: 'manual' });
    
    if (response.status === 307 || response.status === 200) {
      console.log('   ✅ Admin page accessible');
      if (response.status === 307) {
        console.log('   - Redirecting to login (expected)');
      }
      tests.push({ name: 'Admin Page', status: 'PASS' });
    } else {
      console.log('   ❌ Admin page returned:', response.status);
      tests.push({ name: 'Admin Page', status: 'FAIL', error: response.status });
    }
  } catch (error) {
    console.log('   ❌ Admin page error:', error.message);
    tests.push({ name: 'Admin Page', status: 'ERROR', error: error.message });
  }

  console.log('');

  // Test 5: Static Assets
  console.log('5️⃣ Testing static assets...');
  try {
    const response = await fetch(`${url}/favicon.ico`);
    
    if (response.ok) {
      console.log('   ✅ Static assets loading');
      tests.push({ name: 'Static Assets', status: 'PASS' });
    } else {
      console.log('   ⚠️  Favicon not found (not critical)');
      tests.push({ name: 'Static Assets', status: 'WARN' });
    }
  } catch (error) {
    console.log('   ⚠️  Static assets test failed (not critical)');
    tests.push({ name: 'Static Assets', status: 'WARN' });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY\n');

  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const errors = tests.filter(t => t.status === 'ERROR').length;
  const warnings = tests.filter(t => t.status === 'WARN').length;

  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : 
                 test.status === 'FAIL' ? '❌' : 
                 test.status === 'ERROR' ? '🔥' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status}`);
  });

  console.log('');
  console.log(`Total: ${tests.length} tests`);
  console.log(`Passed: ${passed} | Failed: ${failed} | Errors: ${errors} | Warnings: ${warnings}`);

  if (failed === 0 && errors === 0) {
    console.log('\n🎉 All critical tests passed! Deployment looks good.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('\n📖 For troubleshooting, see:');
    console.log('   - QUICK_FIX_GUIDE.md');
    console.log('   - ADMIN_DASHBOARD_DEPLOYMENT_FIX.md');
    console.log(`   - ${url}/admin/diagnostics`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { passed, failed, errors, warnings, tests };
}

// Run tests
testDeployment()
  .then(results => {
    process.exit(results.failed + results.errors > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
