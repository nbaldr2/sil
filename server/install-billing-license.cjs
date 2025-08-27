const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function installBillingLicense() {
  console.log('🧪 Installing Billing Manager module license...');

  try {
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
        moduleId: billingModule.id
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
        licenseKey: `BM-2024-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'ACTIVE',
        organizationName: 'SIL Laboratory',
        contactEmail: 'admin@sil-lab.com',
        maxUsers: 50,
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
        activatedAt: new Date(),
        metadata: {
          installedBy: 'development-script',
          installationDate: new Date().toISOString(),
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