const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

// Using asyncHandler to automatically catch errors
const getPlugins = asyncHandler(async (req, res) => {
  // Sample plugins data (in production, this would come from your database)
  const plugins = [
    {
      id: '1',
      name: 'Advanced Analytics',
      description: 'Enhanced data analytics and visualization tools for lab results',
      version: '1.0.0',
      author: 'SIL Labs',
      rating: 4.5,
      downloads: 1250,
      installed: false,
      isCompatible: true,
      tags: ['analytics', 'reports'],
      lastUpdated: '2025-08-01',
      installedAt: null,
      updatedAt: null
    },
    {
      id: '2',
      name: 'PDF Report Generator',
      description: 'Generate professional PDF reports with custom templates',
      version: '2.1.0',
      author: 'MedTech Solutions',
      rating: 4.8,
      downloads: 3000,
      installed: true,
      isCompatible: true,
      tags: ['reports', 'export'],
      lastUpdated: '2025-07-28',
      installedAt: '2025-08-01',
      updatedAt: '2025-08-01'
    },
    {
      id: '3',
      name: 'HL7 Integration',
      description: 'Seamless integration with HL7 compatible systems',
      version: '1.2.0',
      author: 'Healthcare Integration Labs',
      rating: 4.2,
      downloads: 850,
      installed: false,
      isCompatible: true,
      tags: ['integration'],
      lastUpdated: '2025-07-15',
      installedAt: null,
      updatedAt: null
    }
  ];

  // Log informational message
  logger.info('Plugins fetched successfully', {
    count: plugins.length,
    userId: req.user?.id
  });

  res.json(plugins);
});

const installPlugin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // In a real application, you would:
  // 1. Download the plugin
  // 2. Verify its integrity
  // 3. Install it in the proper directory
  // 4. Update the database
  
  await prisma.plugin.update({
    where: { id },
    data: {
      installed: true,
      installedAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Log successful installation
  logger.info('Plugin installed successfully', {
    pluginId: id,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Plugin installed successfully' });
});

const uninstallPlugin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // In a real application, you would:
  // 1. Deactivate the plugin
  // 2. Remove its files
  // 3. Clean up any data if necessary
  // 4. Update the database
  
  await prisma.plugin.update({
    where: { id },
    data: {
      installed: false,
      installedAt: null,
      updatedAt: new Date()
    }
  });

  // Log successful uninstallation
  logger.info('Plugin uninstalled successfully', {
    pluginId: id,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Plugin uninstalled successfully' });
});

module.exports = {
  getPlugins,
  installPlugin,
  uninstallPlugin
};
