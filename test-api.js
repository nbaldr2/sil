// Simple test script to verify API functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Testing SIL Lab API...\n');

  try {
    // Test 1: Get products
    console.log('1. Testing GET /stock/products...');
    const productsResponse = await fetch(`${API_BASE}/stock/products`);
    const products = await productsResponse.json();
    console.log(`✅ Products endpoint working. Found ${products.length || 0} products\n`);

    // Test 2: Add stock entry
    console.log('2. Testing POST /stock/stock-in...');
    const stockData = {
      productId: products[0]?.id || 'test-product-id',
      quantity: 10,
      lotNumber: 'TEST-LOT-001',
      location: 'Main Storage',
      unitCost: 25.50,
      notes: 'Test stock entry from API',
      receivedBy: 'Test User',
      receivedAt: new Date().toISOString(),
      type: 'stock_in'
    };

    const stockResponse = await fetch(`${API_BASE}/stock/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData)
    });

    if (stockResponse.ok) {
      const result = await stockResponse.json();
      console.log('✅ Stock entry created successfully!');
      console.log(`   Product: ${result.product?.name || 'Unknown'}`);
      console.log(`   Quantity: ${result.quantity}`);
      console.log(`   Lot: ${result.lotNumber}\n`);
    } else {
      const error = await stockResponse.json();
      console.log('❌ Stock entry failed:', error);
    }

    // Test 3: Get dashboard data
    console.log('3. Testing GET /stock/dashboard...');
    const dashboardResponse = await fetch(`${API_BASE}/stock/dashboard`);
    const dashboard = await dashboardResponse.json();
    console.log('✅ Dashboard endpoint working');
    console.log(`   Total Products: ${dashboard.totalProducts}`);
    console.log(`   Total Stock: ${dashboard.totalValue}`);
    console.log(`   Expiring Soon: ${dashboard.expiringSoon}`);
    console.log(`   Low Stock: ${dashboard.lowStock}\n`);

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

// Run the test
testAPI();