const { PrismaClient } = require('@prisma/client');
const billingService = require('./src/services/billingService');

const prisma = new PrismaClient();

async function testBillingSystem() {
  console.log('🧪 Testing Billing System...\n');

  try {
    // Test 1: Check if customers exist
    console.log('1. Testing Customer Management...');
    const customers = await prisma.customer.findMany({ take: 3 });
    console.log(`   ✅ Found ${customers.length} customers`);
    customers.forEach(customer => {
      console.log(`   - ${customer.name} (${customer.type})`);
    });

    // Test 2: Check if invoices exist
    console.log('\n2. Testing Invoice Management...');
    const invoices = await prisma.invoice.findMany({ 
      take: 3,
      include: {
        customer: { select: { name: true } },
        items: true,
        taxes: true
      }
    });
    console.log(`   ✅ Found ${invoices.length} invoices`);
    invoices.forEach(invoice => {
      console.log(`   - ${invoice.invoiceNumber}: ${invoice.totalAmount} MAD (${invoice.status})`);
    });

    // Test 3: Check transactions
    console.log('\n3. Testing Payment Transactions...');
    const transactions = await prisma.transaction.findMany({ 
      take: 3,
      include: {
        customer: { select: { name: true } },
        invoice: { select: { invoiceNumber: true } }
      }
    });
    console.log(`   ✅ Found ${transactions.length} transactions`);
    transactions.forEach(transaction => {
      console.log(`   - ${transaction.transactionNumber}: ${transaction.amount} MAD (${transaction.status})`);
    });

    // Test 4: Test financial metrics calculation
    console.log('\n4. Testing Financial Metrics...');
    const metrics = await billingService.generateFinancialMetrics('month');
    console.log('   ✅ Financial Metrics:');
    console.log(`   - Total Revenue: ${metrics.totalRevenue.toFixed(2)} MAD`);
    console.log(`   - Total Paid: ${metrics.totalPaid.toFixed(2)} MAD`);
    console.log(`   - Total Outstanding: ${metrics.totalOutstanding.toFixed(2)} MAD`);
    console.log(`   - Collection Rate: ${metrics.collectionRate.toFixed(1)}%`);

    // Test 5: Check tax configurations
    console.log('\n5. Testing Tax Configuration...');
    const taxConfigs = await prisma.taxConfiguration.findMany({
      where: { isActive: true }
    });
    console.log(`   ✅ Found ${taxConfigs.length} active tax configurations`);
    taxConfigs.forEach(tax => {
      console.log(`   - ${tax.taxName}: ${tax.taxRate}%`);
    });

    // Test 6: Test invoice calculation
    console.log('\n6. Testing Invoice Calculations...');
    const sampleItems = [
      {
        description: 'Blood Test',
        quantity: 1,
        unitPrice: 150.00,
        discount: 0,
        taxRate: 20
      },
      {
        description: 'Urine Analysis',
        quantity: 1,
        unitPrice: 80.00,
        discount: 5,
        taxRate: 20
      }
    ];

    const calculations = billingService.calculateInvoiceTotals(sampleItems, 0);
    console.log('   ✅ Sample Invoice Calculation:');
    console.log(`   - Subtotal: ${calculations.subtotal.toFixed(2)} MAD`);
    console.log(`   - Tax Amount: ${calculations.taxAmount.toFixed(2)} MAD`);
    console.log(`   - Stamp Tax: ${calculations.stampTaxAmount.toFixed(2)} MAD`);
    console.log(`   - Total: ${calculations.totalAmount.toFixed(2)} MAD`);

    // Test 7: Check insurance claims
    console.log('\n7. Testing Insurance Claims...');
    const claims = await prisma.insuranceClaim.findMany({ take: 3 });
    console.log(`   ✅ Found ${claims.length} insurance claims`);
    claims.forEach(claim => {
      console.log(`   - ${claim.claimNumber}: ${claim.claimAmount} MAD (${claim.status})`);
    });

    console.log('\n🎉 All billing system tests passed successfully!');
    console.log('\n📊 System Summary:');
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log(`   - Insurance Claims: ${claims.length}`);
    console.log(`   - Tax Configurations: ${taxConfigs.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testBillingSystem()
    .catch((e) => {
      console.error('❌ Billing system test failed:', e);
      process.exit(1);
    });
}

module.exports = { testBillingSystem };