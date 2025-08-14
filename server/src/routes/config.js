const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const configValidation = [
  body('labName').isLength({ min: 2 }).trim(),
  body('address').isLength({ min: 5 }).trim(),
  body('phone').isLength({ min: 8 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('currencySymbol').isLength({ min: 1, max: 5 }).trim(),
  body('currencyCode').isLength({ min: 3, max: 3 }).trim(),
  body('currencyPosition').isIn(['BEFORE', 'AFTER']),
  body('decimalPlaces').isInt({ min: 0, max: 4 })
];

// Get system configuration
router.get('/', async (req, res) => {
  try {
    let config = await prisma.systemConfig.findFirst();

    if (!config) {
      // Create default configuration
      config = await prisma.systemConfig.create({
        data: {
          labName: 'SIL Laboratory',
          address: '123 Main Street, City, Country',
          phone: '+1234567890',
          email: 'info@sil.lab',
          currencySymbol: '€',
          currencyCode: 'EUR',
          currencyPosition: 'AFTER',
          decimalPlaces: 2,
          autoprint: true,
          defaultPrinter: '',
          smsNotifications: true,
          emailNotifications: true
        }
      });
    }

    res.json({ config });

  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update system configuration
router.put('/', configValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      labName,
      address,
      phone,
      email,
      currencySymbol,
      currencyCode,
      currencyPosition,
      decimalPlaces,
      autoprint,
      defaultPrinter,
      smsNotifications,
      emailNotifications
    } = req.body;

    let config = await prisma.systemConfig.findFirst();

    if (config) {
      // Update existing config
      config = await prisma.systemConfig.update({
        where: { id: config.id },
        data: {
          labName,
          address,
          phone,
          email,
          currencySymbol,
          currencyCode,
          currencyPosition,
          decimalPlaces,
          autoprint,
          defaultPrinter,
          smsNotifications,
          emailNotifications
        }
      });
    } else {
      // Create new config
      config = await prisma.systemConfig.create({
        data: {
          labName,
          address,
          phone,
          email,
          currencySymbol,
          currencyCode,
          currencyPosition,
          decimalPlaces,
          autoprint,
          defaultPrinter,
          smsNotifications,
          emailNotifications
        }
      });
    }

    res.json({ config });

  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAnalyses,
      totalRequests,
      totalResults,
      totalRevenue
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.analysis.count(),
      prisma.request.count(),
      prisma.result.count(),
      prisma.request.aggregate({
        _sum: { amountDue: true }
      })
    ]);

    // Get recent activity
    const recentRequests = await prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            nom: true,
            prenom: true
          }
        },
        doctor: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    // Get pending results
    const pendingResults = await prisma.result.count({
      where: { status: 'PENDING' }
    });

    // Get urgent requests
    const urgentRequests = await prisma.request.count({
      where: { urgent: true, status: { not: 'COMPLETED' } }
    });

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAnalyses,
        totalRequests,
        totalResults,
        totalRevenue: totalRevenue._sum.amountDue || 0,
        pendingResults,
        urgentRequests
      },
      recentActivity: recentRequests
    });

  } catch (error) {
    console.error('Get config stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export system data
router.get('/export', async (req, res) => {
  try {
    const { type } = req.query;

    let data = {};

    switch (type) {
      case 'patients':
        data = await prisma.patient.findMany({
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'doctors':
        data = await prisma.doctor.findMany({
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'analyses':
        data = await prisma.analysis.findMany({
          orderBy: { nom: 'asc' }
        });
        break;
      case 'requests':
        data = await prisma.request.findMany({
          include: {
            patient: true,
            doctor: true,
            requestAnalyses: {
              include: {
                analysis: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'results':
        data = await prisma.result.findMany({
          include: {
            request: {
              include: {
                patient: true
              }
            },
            analysis: true
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.json({ data, type, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backup system data
router.post('/backup', async (req, res) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      patients: await prisma.patient.findMany(),
      doctors: await prisma.doctor.findMany(),
      analyses: await prisma.analysis.findMany(),
      requests: await prisma.request.findMany({
        include: {
          requestAnalyses: {
            include: {
              analysis: true
            }
          }
        }
      }),
      results: await prisma.result.findMany(),
      config: await prisma.systemConfig.findFirst()
    };

    res.json({ 
      backup,
      message: 'Backup created successfully',
      size: JSON.stringify(backup).length
    });

  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 