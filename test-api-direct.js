// Direct API test to debug the 500 error
const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('Testing API directly...');
    
    const response = await fetch('http://localhost:3000/api/test-connection');
    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi();
