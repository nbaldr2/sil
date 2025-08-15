const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedModules() {
  console.log('🌱 Seeding modules...');

  try {
    // Stock Manager Module
    const stockModule = await prisma.module.upsert({
      where: { name: 'stock-manager' },
      update: {},
      create: {
        name: 'stock-manager',
        displayName: 'Stock Manager',
        description: 'Complete inventory management system with product tracking, stock movements, supplier management, and comprehensive reporting.',
        version: '2.1.0',
        author: 'SIL Lab Systems',
        category: 'inventory',
        price: 299.99,
        features: [
          'Product Management',
          'Stock Tracking',
          'Supplier Management',
          'Purchase Orders',
          'Stock Reports',
          'Expiry Alerts',
          'Barcode Support',
          'Multi-location Support'
        ],
        requirements: {
          minVersion: '1.0.0',
          dependencies: [],
          permissions: ['ADMIN', 'TECHNICIAN']
        },
        isActive: true
      }
    });

    // Billing Module
    const billingModule = await prisma.module.upsert({
      where: { name: 'billing-manager' },
      update: {},
      create: {
        name: 'billing-manager',
        displayName: 'Billing Manager',
        description: 'Advanced billing and invoicing system with insurance integration, payment tracking, and financial reporting.',
        version: '1.8.0',
        author: 'SIL Lab Systems',
        category: 'finance',
        price: 199.99,
        features: [
          'Invoice Generation',
          'Insurance Claims',
          'Payment Tracking',
          'Financial Reports',
          'Tax Management',
          'Multi-currency Support',
          'Automated Billing',
          'Payment Reminders'
        ],
        requirements: {
          minVersion: '1.0.0',
          dependencies: [],
          permissions: ['ADMIN', 'SECRETARY']
        },
        isActive: true
      }
    });

    // Analytics Module
    const analyticsModule = await prisma.module.upsert({
      where: { name: 'analytics-pro' },
      update: {},
      create: {
        name: 'analytics-pro',
        displayName: 'Analytics Pro',
        description: 'Advanced analytics and business intelligence with custom dashboards, KPI tracking, and predictive insights.',
        version: '3.0.0',
        author: 'SIL Lab Systems',
        category: 'analytics',
        price: 399.99,
        features: [
          'Custom Dashboards',
          'KPI Tracking',
          'Predictive Analytics',
          'Data Visualization',
          'Export Reports',
          'Automated Insights',
          'Performance Metrics',
          'Trend Analysis'
        ],
        requirements: {
          minVersion: '1.0.0',
          dependencies: [],
          permissions: ['ADMIN', 'BIOLOGIST']
        },
        isActive: true
      }
    });

    // Quality Control Module
    const qcModule = await prisma.module.upsert({
      where: { name: 'quality-control' },
      update: {},
      create: {
        name: 'quality-control',
        displayName: 'Quality Control',
        description: 'Comprehensive quality control system with automated QC checks, statistical analysis, and compliance reporting.',
        version: '2.5.0',
        author: 'SIL Lab Systems',
        category: 'quality',
        price: 249.99,
        features: [
          'QC Sample Tracking',
          'Statistical Analysis',
          'Control Charts',
          'Compliance Reports',
          'Alert System',
          'Calibration Management',
          'Audit Trail',
          'ISO 15189 Support'
        ],
        requirements: {
          minVersion: '1.0.0',
          dependencies: [],
          permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
        },
        isActive: true
      }
    });

    // Automate Integration Module
    const automateModule = await prisma.module.upsert({
      where: { name: 'automate-integration' },
      update: {},
      create: {
        name: 'automate-integration',
        displayName: 'Automate Integration',
        description: 'Connect and manage laboratory instruments with bidirectional communication, result import, and worklist management.',
        version: '1.9.0',
        author: 'SIL Lab Systems',
        category: 'integration',
        price: 499.99,
        features: [
          'Instrument Connectivity',
          'Bidirectional Communication',
          'Result Import',
          'Worklist Management',
          'Protocol Support (HL7, ASTM)',
          'Real-time Monitoring',
          'Error Handling',
          'Multi-instrument Support'
        ],
        requirements: {
          minVersion: '1.0.0',
          dependencies: [],
          permissions: ['ADMIN', 'TECHNICIAN']
        },
        isActive: true
      }
    });

    console.log('✅ Modules seeded successfully!');
    console.log(`📦 Stock Manager: ${stockModule.id}`);
    console.log(`💰 Billing Manager: ${billingModule.id}`);
    console.log(`📊 Analytics Pro: ${analyticsModule.id}`);
    console.log(`🔬 Quality Control: ${qcModule.id}`);
    console.log(`🔌 Automate Integration: ${automateModule.id}`);

  } catch (error) {
    console.error('❌ Error seeding modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedModules();