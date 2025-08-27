const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function installBillingLicense() {
  console.log('🧪 Installing Billing Manager module license...');

  try {
    // First, let's find or create an admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@sil-lab.com',
          name: 'Admin User',
          role: 'ADMIN',
          passwordHash: '$2b$10$example.hash.for.testing', // This is a dummy hash for testing
          isActive: true
        }
      });
      console.log('✅ Created admin user:', adminUser.id);
    } else {
      console.log('✅ Found admin user:', adminUser.id);
    }

    // Find the billing-manager module
    const billingModule = await prisma.module.findUnique({
      where: { name: 'billing-manager' }
    });

    if (!billingModule) {
      console.error('❌ Billing Manager module not found! Run seed-modules.js first.');
      return;
    }

    console.log('✅ Found billing module:', billingModule.id);

    // Check if license already exists
    const existingLicense = await prisma.moduleLicense.findFirst({
      where: {
        moduleId: billingModule.id,
        userId: adminUser.id
      }
    });

    if (existingLicense) {
      console.log('✅ License already exists:', existingLicense.id);
      console.log('Status:', existingLicense.status);
      console.log('Expires:', existingLicense.expiresAt);
      return;
    }

    // Create module license
    const license = await prisma.moduleLicense.create({
      data: {
        moduleId: billingModule.id,
        userId: adminUser.id,
        licenseKey: `BM-2024-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'ACTIVE',
        licenseType: 'PREMIUM',
        features: [
          'invoice-generation',
          'insurance-management',
          'payment-tracking',
          'financial-reporting',
          'tax-management',
          'multi-currency',
          'client-portal',
          'accounting-integration'
        ],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        issuedAt: new Date(),
        metadata: {
          installedBy: 'development-script',
          installationDate: new Date().toISOString(),
          maxUsers: 50,
          supportLevel: 'premium'
        }
      }
    });

    console.log('🎉 Successfully installed Billing Manager license!');
    console.log('License ID:', license.id);
    console.log('License Key:', license.licenseKey);
    console.log('Status:', license.status);
    console.log('Expires:', license.expiresAt);
    console.log('Features:', license.features);

  } catch (error) {
    console.error('❌ Error installing license:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the installation
installBillingLicense();