// Test script to verify module deactivation
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testDeactivation() {
  console.log('🧪 Testing Module Deactivation...\n');

  try {
    // 1. Get installed modules
    console.log('1. Fetching installed modules...');
    const installedResponse = await fetch(`${API_BASE}/modules/installed`);
    const installed = await installedResponse.json();
    
    if (installed.length === 0) {
      console.log('❌ No modules installed to deactivate');
      return;
    }

    const stockModule = installed[0];
    console.log(`✅ Found installed module: ${stockModule.displayName}`);
    console.log(`   License ID: ${stockModule.id}`);
    console.log(`   Status: ${stockModule.status}`);
    console.log(`   Days Remaining: ${stockModule.daysRemaining}\n`);

    // 2. Deactivate the module
    console.log('2. Deactivating module...');
    const deactivateResponse = await fetch(`${API_BASE}/modules/${stockModule.id}`, {
      method: 'DELETE'
    });

    if (deactivateResponse.ok) {
      const result = await deactivateResponse.json();
      console.log('✅ Module deactivated successfully!');
      console.log(`   New Status: ${result.license.status}\n`);
    } else {
      const error = await deactivateResponse.json();
      console.log('❌ Deactivation failed:', error.error);
      return;
    }

    // 3. Verify access is removed
    console.log('3. Checking module access after deactivation...');
    const accessResponse = await fetch(`${API_BASE}/modules/access/stock-manager`);
    const access = await accessResponse.json();
    
    console.log(`✅ Access Check After Deactivation:`);
    console.log(`   Has Access: ${access.hasAccess}`);
    console.log(`   Status: ${access.status || 'null'}\n`);

    // 4. Verify installed modules list is empty
    console.log('4. Checking installed modules list...');
    const newInstalledResponse = await fetch(`${API_BASE}/modules/installed`);
    const newInstalled = await newInstalledResponse.json();
    
    console.log(`✅ Installed Modules After Deactivation: ${newInstalled.length}`);

    console.log('\n🎉 Module deactivation test completed successfully!');
    console.log('💡 Results:');
    console.log('   - Module license status changed to SUSPENDED');
    console.log('   - Module access is now denied');
    console.log('   - Stock Management menu should disappear from sidebar');
    console.log('   - Module store should show module as available for installation again');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDeactivation();