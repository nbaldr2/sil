const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateBillingLicense() {
  console.log('🔄 Activating Billing Manager license...');

  try {
    // Find the billing-manager module
    const billingModule = await prisma.module.findUnique({
      where: { name: 'billing-manager' }
    });

    if (!billingModule) {
      console.error('❌ Billing Manager module not found!');
      return;
    }

    // Update the license status
    const license = await prisma.moduleLicense.updateMany({
      where: {
        moduleId: billingModule.id
      },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    if (license.count > 0) {
      console.log('✅ Successfully activated Billing Manager license!');
      console.log('Updated licenses:', license.count);
      
      // Get the updated license details
      const updatedLicense = await prisma.moduleLicense.findFirst({
        where: {
          moduleId: billingModule.id
        }
      });
      
      if (updatedLicense) {
        console.log('License Status:', updatedLicense.status);
        console.log('Activated At:', updatedLicense.activatedAt);
        console.log('Expires At:', updatedLicense.expiresAt);
      }
    } else {
      console.log('❌ No licenses found to update');
    }

  } catch (error) {
    console.error('❌ Error activating license:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the activation
activateBillingLicense();