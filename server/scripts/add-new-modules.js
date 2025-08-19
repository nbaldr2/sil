const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addNewModules() {
  console.log('🔄 Adding new modules to the database...\n');

  try {
    // Backup Manager Module
    const backupModule = await prisma.module.upsert({
      where: { name: 'backup-manager' },
      update: {},
      create: {
        name: 'backup-manager',
        displayName: 'Backup Manager',
        description: 'Complete backup and restore system with automatic reminders and settings management',
        version: '1.0.0',
        author: 'SIL Lab Team',
        category: 'system',
        price: 0, // Free module
        features: [
          'Manual and automatic backup creation',
          'Import/Export backup files',
          'Complete system restoration',
          'Smart dashboard reminders',
          'Backup statistics and monitoring',
          'Retention settings configuration',
          'File validation and compression',
          'Real-time progress tracking'
        ],
        requirements: {
          minVersion: '1.0.0',
          permissions: ['ADMIN'],
          dependencies: []
        },
        isActive: true
      }
    });

    console.log('✅ Backup Manager module added:', backupModule.id);

    // Quality Control Module
    const qualityModule = await prisma.module.upsert({
      where: { name: 'quality-control' },
      update: {},
      create: {
        name: 'quality-control',
        displayName: 'Quality Control',
        description: 'Complete quality control system with control sample management, result validation and compliance reporting',
        version: '1.0.0',
        author: 'SIL Lab Team',
        category: 'laboratory',
        price: 299.99, // Premium module
        features: [
          'Control sample management',
          'Automatic result validation',
          'Statistical control charts',
          'Compliance reporting',
          'Quality drift alerts',
          'Complete traceability',
          'Reference standards',
          'Audit and certification'
        ],
        requirements: {
          minVersion: '1.0.0',
          permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN'],
          dependencies: []
        },
        isActive: true
      }
    });

    console.log('✅ Quality Control module added:', qualityModule.id);

    // Create demo licenses for testing
    console.log('\n🔑 Creating demo licenses...');

    // Demo license for Backup Manager (free module)
    const backupLicense = await prisma.moduleLicense.create({
      data: {
        moduleId: backupModule.id,
        licenseKey: 'BACKUP-DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        organizationName: 'Demo Organization',
        contactEmail: 'demo@sil-lab.ma',
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        maxUsers: 100,
        features: [
          'Manual and automatic backup creation',
          'Import/Export backup files',
          'Complete system restoration',
          'Smart dashboard reminders',
          'Backup statistics and monitoring',
          'Retention settings configuration',
          'File validation and compression',
          'Real-time progress tracking'
        ]
      }
    });

    console.log('✅ Backup Manager demo license:', backupLicense.licenseKey);

    // Demo license for Quality Control (trial)
    const qualityLicense = await prisma.moduleLicense.create({
      data: {
        moduleId: qualityModule.id,
        licenseKey: 'QUALITY-TRIAL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        organizationName: 'Demo Organization',
        contactEmail: 'demo@sil-lab.ma',
        status: 'TRIAL',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxUsers: 10,
        features: [
          'Control sample management',
          'Automatic result validation',
          'Statistical control charts',
          'Compliance reporting',
          'Quality drift alerts',
          'Complete traceability'
        ]
      }
    });

    console.log('✅ Quality Control trial license:', qualityLicense.licenseKey);

    console.log('\n🎉 New modules added successfully!');
    console.log('\n📋 Module Summary:');
    console.log('1. Backup Manager (Free) - Fully activated');
    console.log('2. Quality Control (Premium) - 30-day trial');
    
    console.log('\n🌐 Access URLs:');
    console.log('- Module Store: http://localhost:5175/modules');
    console.log('- Backup Manager: http://localhost:5175/config/backup');
    console.log('- Quality Control: http://localhost:5175/quality-control');

  } catch (error) {
    console.error('❌ Error adding modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewModules();