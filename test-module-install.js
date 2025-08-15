// Test script to install Stock Manager module with trial license
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testModuleInstallation() {
  console.log('🧪 Testing Module Installation...\n');

  try {
    // 1. Get available modules
    console.log('1. Fetching available modules...');
    const modulesResponse = await fetch(`${API_BASE}/modules`);
    const modules = await modulesResponse.json();
    
    const stockModule = modules.find(m => m.name === 'stock-manager');
    if (!stockModule) {
      console.log('❌ Stock Manager module not found');
      return;
    }
    
    console.log(`✅ Found Stock Manager module: ${stockModule.displayName} v${stockModule.version}`);
    console.log(`   Price: $${stockModule.price}`);
    console.log(`   Features: ${stockModule.features.slice(0, 3).join(', ')}...\n`);

    // 2. Start trial for Stock Manager
    console.log('2. Starting trial for Stock Manager...');
    const trialResponse = await fetch(`${API_BASE}/modules/trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moduleId: stockModule.id,
        organizationName: 'Demo Lab',
        contactEmail: 'demo@lab.com'
      })
    });

    if (trialResponse.ok) {
      const trialResult = await trialResponse.json();
      console.log('✅ Trial started successfully!');
      console.log(`   License Key: ${trialResult.licenseKey}`);
      console.log(`   Status: ${trialResult.status}`);
      console.log(`   Days Remaining: ${trialResult.daysRemaining}`);
      console.log(`   Expires: ${new Date(trialResult.expiresAt).toLocaleDateString()}\n`);
    } else {
      const error = await trialResponse.json();
      console.log('❌ Trial failed:', error.error);
      return;
    }

    // 3. Check module access
    console.log('3. Checking module access...');
    const accessResponse = await fetch(`${API_BASE}/modules/access/stock-manager`);
    const access = await accessResponse.json();
    
    console.log(`✅ Module Access Check:`);
    console.log(`   Has Access: ${access.hasAccess}`);
    console.log(`   Days Remaining: ${access.daysRemaining}`);
    console.log(`   Status: ${access.status}`);
    console.log(`   Features: ${access.features?.length || 0} features enabled\n`);

    // 4. Get installed modules
    console.log('4. Fetching installed modules...');
    const installedResponse = await fetch(`${API_BASE}/modules/installed`);
    const installed = await installedResponse.json();
    
    console.log(`✅ Installed Modules: ${installed.length}`);
    installed.forEach(module => {
      console.log(`   📦 ${module.displayName}`);
      console.log(`      Status: ${module.status}`);
      console.log(`      Days Left: ${module.daysRemaining}`);
      console.log(`      License: ${module.licenseKey}`);
    });

    console.log('\n🎉 Module installation test completed successfully!');
    console.log('💡 Now you can:');
    console.log('   - Visit http://localhost:5174/config/modules to see the module store');
    console.log('   - Check the sidebar - Stock Management should now be visible');
    console.log('   - The stock menu will show days remaining when < 30 days');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testModuleInstallation();