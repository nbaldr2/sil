// Debug Authentication Script
// Run this in the browser console to check authentication status

console.log('=== SIL Lab Authentication Debug ===');

// Check localStorage
const token = localStorage.getItem('sil_lab_token');
const user = localStorage.getItem('sil_lab_user');

console.log('1. LocalStorage Check:');
console.log('   Token exists:', !!token);
console.log('   Token length:', token?.length || 0);
console.log('   Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
console.log('   User data exists:', !!user);

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('   User data:', userData);
  } catch (e) {
    console.log('   User data parse error:', e.message);
  }
}

// Test API call
console.log('\n2. Testing API Authentication:');
if (token) {
  fetch('http://localhost:5001/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('   Auth test response status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('   Auth test success:', data);
  })
  .catch(error => {
    console.log('   Auth test failed:', error.message);
  });

  // Test modules endpoint
  fetch('http://localhost:5001/api/modules/installed', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('   Modules test response status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('   Modules test success:', data);
  })
  .catch(error => {
    console.log('   Modules test failed:', error.message);
  });
} else {
  console.log('   No token found - cannot test API calls');
}

console.log('\n3. Recommendations:');
if (!token) {
  console.log('   - User needs to log in');
} else {
  console.log('   - Check server logs for authentication errors');
  console.log('   - Verify JWT_SECRET is set correctly on server');
  console.log('   - Check if token has expired');
}