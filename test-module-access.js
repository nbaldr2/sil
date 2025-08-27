// Test Module Access
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api';

async function testModuleAccess() {
  console.log('🧪 Testing Module Access...\n');

  // Step 1: Test login
  console.log('1️⃣ Testing login...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sil-lab.com',
        password: 'admin123' // Common default password
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('   User:', loginData.user.name, '-', loginData.user.role);
      
      const token = loginData.token;
      
      // Step 2: Test modules API
      console.log('\n2️⃣ Testing modules API...');
      
      const modulesResponse = await fetch(`${API_BASE}/modules/installed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (modulesResponse.ok) {
        const modules = await modulesResponse.json();
        console.log('✅ Modules API accessible!');
        console.log('   Installed modules:', modules.length);
        
        modules.forEach(module => {
          console.log(`   - ${module.displayName} (${module.name}): ${module.status} - ${module.daysRemaining} days`);
        });

        // Step 3: Test billing module specifically
        console.log('\n3️⃣ Testing billing module access...');
        
        const billingAccess = await fetch(`${API_BASE}/modules/access/billing-manager`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (billingAccess.ok) {
          const accessData = await billingAccess.json();
          console.log('✅ Billing module access check:');
          console.log('   Has Access:', accessData.hasAccess);
          console.log('   Status:', accessData.status);
          console.log('   Days Remaining:', accessData.daysRemaining);
          
          if (accessData.hasAccess) {
            console.log('\n🎉 BILLING MODULE IS ACCESSIBLE!');
            console.log('   ✅ License is active');
            console.log('   ✅ User has permission');
            console.log('   ✅ Frontend should show the module');
            console.log('\n💡 To access: http://localhost:5173/modules/billing-manager');
            console.log('   (Must be logged in as ADMIN or SECRETARY)');
          } else {
            console.log('\n❌ Billing module not accessible');
            console.log('   Check license status and permissions');
          }
        } else {
          console.log('❌ Failed to check billing access:', billingAccess.status);
        }

      } else {
        console.log('❌ Modules API failed:', modulesResponse.status);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.status);
      console.log('   Try different credentials or check user exists');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testModuleAccess();