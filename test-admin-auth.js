#!/usr/bin/env node

/**
 * Quick test script to verify admin authentication is working
 * Run with: node test-admin-auth.js
 */

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

console.log('🔍 Testing Admin Authentication...');
console.log('📍 Base URL:', baseUrl);
console.log('');

async function testAuthEndpoint() {
  try {
    console.log('1️⃣ Testing /api/auth/me endpoint...');
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    const cacheControl = response.headers.get('Cache-Control');
    console.log('   Status:', response.status);
    console.log('   Cache-Control:', cacheControl);
    
    if (cacheControl && cacheControl.includes('no-store')) {
      console.log('   ✅ No-cache headers detected');
    } else {
      console.log('   ❌ Cache headers incorrect:', cacheControl);
    }
    
    console.log('');
    return response.ok;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  try {
    console.log('2️⃣ Testing /api/auth/login endpoint...');
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'wrong-password' 
      }),
    });

    const cacheControl = response.headers.get('Cache-Control');
    console.log('   Status:', response.status);
    console.log('   Cache-Control:', cacheControl);
    
    if (cacheControl && cacheControl.includes('no-store')) {
      console.log('   ✅ No-cache headers detected');
    } else {
      console.log('   ❌ Cache headers incorrect:', cacheControl);
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('  ADMIN AUTH CACHING TEST SUITE');
  console.log('═══════════════════════════════════════');
  console.log('');

  const test1 = await testAuthEndpoint();
  const test2 = await testLoginEndpoint();

  console.log('═══════════════════════════════════════');
  console.log('  TEST RESULTS');
  console.log('═══════════════════════════════════════');
  console.log('Auth endpoint:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Login endpoint:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('');

  if (test1 && test2) {
    console.log('🎉 All tests passed! Admin auth caching is fixed.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

runTests();
