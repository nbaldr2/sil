const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();
const staticModules = require('../utils/staticModules');

// Get all available modules
router.get('/', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      where: { isActive: true },
      include: {
        licenses: {
          where: {
            status: { in: ['ACTIVE', 'TRIAL'] },
            expiresAt: { gte: new Date() }
          },
          take: 1
        }
      }
    });

    // Add installation status and days remaining
    const modulesWithStatus = modules.map(module => {
      const activeLicense = module.licenses[0];
      const isInstalled = !!activeLicense;
      const daysRemaining = activeLicense 
        ? Math.ceil((new Date(activeLicense.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...module,
        isInstalled,
        daysRemaining: Math.max(0, daysRemaining),
        licenseStatus: activeLicense?.status || null,
        expiresAt: activeLicense?.expiresAt || null
      };
    });

    // Merge static modules that may not be seeded in the DB (keep DB entries first)
    const staticFallback = staticModules.filter(sm => !modulesWithStatus.some(m => m.name === sm.name || m.id === sm.id));
    const merged = modulesWithStatus.concat(staticFallback.map(sm => ({
      ...sm,
      // make shape compatible with moduleService expectations
      displayName: sm.displayName || sm.name,
      isInstalled: false,
      daysRemaining: 0,
      licenseStatus: null,
      expiresAt: null
    })));

    res.json(merged);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get installed modules with license info
router.get('/installed', async (req, res) => {
  try {
    const installedModules = await prisma.moduleLicense.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        expiresAt: { gte: new Date() }
      },
      include: {
        module: true
      }
    });

    const modulesWithDays = installedModules.map(license => {
      const daysRemaining = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        // License information
        id: license.id, // This is the license ID, not module ID
        licenseKey: license.licenseKey,
        status: license.status,
        expiresAt: license.expiresAt,
        daysRemaining: Math.max(0, daysRemaining),
        organizationName: license.organizationName,
        maxUsers: license.maxUsers,
        activatedAt: license.activatedAt,
        
        // Module information
        moduleId: license.module.id,
        name: license.module.name,
        displayName: license.module.displayName,
        description: license.module.description,
        version: license.module.version,
        author: license.module.author,
        category: license.module.category,
        price: license.module.price,
        features: license.features || license.module.features
      };
    });

    res.json(modulesWithDays);
  } catch (error) {
    console.error('Error fetching installed modules:', error);
    res.status(500).json({ error: 'Failed to fetch installed modules' });
  }
});

// Install/Activate module with license key
router.post('/install', [
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('licenseKey').notEmpty().withMessage('License key is required'),
  body('organizationName').optional().isString(),
  body('contactEmail').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, licenseKey, organizationName, contactEmail } = req.body;

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if license key is already used
    const existingLicense = await prisma.moduleLicense.findUnique({
      where: { licenseKey }
    });

    if (existingLicense) {
      return res.status(400).json({ error: 'License key already in use' });
    }

    // Validate license key format (simple validation)
    if (!isValidLicenseKey(licenseKey, module.name)) {
      return res.status(400).json({ error: 'Invalid license key format' });
    }

    // Create license entry
    const license = await prisma.moduleLicense.create({
      data: {
        moduleId,
        licenseKey,
        organizationName,
        contactEmail,
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUsers: 10, // Default for paid licenses
        features: module.features
      },
      include: {
        module: true
      }
    });

    const daysRemaining = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

    res.status(201).json({
      ...license,
      daysRemaining
    });
  } catch (error) {
    console.error('Error installing module:', error);
    res.status(500).json({ error: 'Failed to install module' });
  }
});

// Start trial for a module
router.post('/trial', [
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('organizationName').optional().isString(),
  body('contactEmail').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, organizationName, contactEmail } = req.body;

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if trial already exists
    const existingTrial = await prisma.moduleLicense.findFirst({
      where: {
        moduleId,
        status: 'TRIAL'
      }
    });

    if (existingTrial) {
      return res.status(400).json({ error: 'Trial already started for this module' });
    }

    // Generate trial license key
    const trialLicenseKey = generateTrialLicenseKey(module.name);

    // Create trial license
    const license = await prisma.moduleLicense.create({
      data: {
        moduleId,
        licenseKey: trialLicenseKey,
        organizationName,
        contactEmail,
        status: 'TRIAL',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxUsers: 3, // Limited users for trial
        features: module.features
      },
      include: {
        module: true
      }
    });

    const daysRemaining = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

    res.status(201).json({
      ...license,
      daysRemaining
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Check module access (used by frontend to show/hide features)
router.get('/access/:moduleName', async (req, res) => {
  try {
    const { moduleName } = req.params;

    const module = await prisma.module.findUnique({
      where: { name: moduleName },
      include: {
        licenses: {
          where: {
            status: { in: ['ACTIVE', 'TRIAL'] },
            expiresAt: { gte: new Date() }
          },
          take: 1
        }
      }
    });

    if (!module || !module.licenses.length) {
      return res.json({
        hasAccess: false,
        daysRemaining: 0,
        status: null
      });
    }

    const license = module.licenses[0];
    const daysRemaining = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      hasAccess: true,
      daysRemaining: Math.max(0, daysRemaining),
      status: license.status,
      expiresAt: license.expiresAt,
      features: license.features
    });
  } catch (error) {
    console.error('Error checking module access:', error);
    res.status(500).json({ error: 'Failed to check module access' });
  }
});

// Deactivate/Uninstall module
router.delete('/:licenseId', async (req, res) => {
  try {
    const { licenseId } = req.params;

    const license = await prisma.moduleLicense.update({
      where: { id: licenseId },
      data: { status: 'SUSPENDED' },
      include: { module: true }
    });

    res.json({ message: 'Module deactivated successfully', license });
  } catch (error) {
    console.error('Error deactivating module:', error);
    res.status(500).json({ error: 'Failed to deactivate module' });
  }
});

// Helper functions
function isValidLicenseKey(licenseKey, moduleName) {
  // Simple validation - in production, use proper cryptographic validation
  const expectedPrefix = moduleName.substring(0, 3).toUpperCase();
  return licenseKey.startsWith(expectedPrefix) && licenseKey.length >= 20;
}

function generateTrialLicenseKey(moduleName) {
  const prefix = moduleName.substring(0, 3).toUpperCase();
  const randomPart = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `${prefix}-TRIAL-${randomPart}`;
}

function generateLicenseKey(moduleName) {
  const prefix = moduleName.substring(0, 3).toUpperCase();
  const randomPart = crypto.randomBytes(12).toString('hex').toUpperCase();
  return `${prefix}-${randomPart.match(/.{4}/g).join('-')}`;
}

module.exports = router;