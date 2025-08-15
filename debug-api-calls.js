// Debug script to test all API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function debugAllEndpoints() {
  console.log('🔍 Debugging All Module API Endpoints...\n');

  const endpoints = [
    { method: 'GET', path: '/modules', description: 'Get available modules' },
    { method: 'GET', path: '/modules/installed', description: 'Get installed modules' },
    { method: 'GET', path: '/modules/access/stock-manager', description: 'Check stock manager access' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      
      const response = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        const errorText = await response.text();
        console.log(`  ❌ Error: ${errorText}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`  💥 Network Error: ${error.message}\n`);
    }
  }

  // Test POST endpoints with sample data
  console.log('Testing POST endpoints...\n');

  // Test trial endpoint with invalid data to see what 400 errors look like
  try {
    console.log('Testing POST /modules/trial with invalid data');
    const response = await fetch(`${API_BASE}/modules/trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing required fields to trigger 400
      })
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`  Expected 400 Error: ${JSON.stringify(errorData)}`);
    }
    
  } catch (error) {
    console.log(`  Network Error: ${error.message}`);
  }

  console.log('\n🎯 Summary:');
  console.log('- If all GET endpoints return 200, the API is working correctly');
  console.log('- If you see 400 errors on GET requests, there might be a server issue');
  console.log('- If you see network errors, check if the server is running');
  console.log('- The frontend 400 error might be from a POST request with invalid data');
}

// Run the debug
debugAllEndpoints();