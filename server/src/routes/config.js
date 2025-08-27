const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const si = require('systeminformation');
const osu = require('node-os-utils');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

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
  body('decimalPlaces').isInt({ min: 0, max: 4 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('sessionTimeout').optional().isInt({ min: 5, max: 480 }),
  body('passwordExpiry').optional().isInt({ min: 1, max: 365 }),
  body('maxLoginAttempts').optional().isInt({ min: 1, max: 10 }),
  body('hl7Port').optional().isInt({ min: 1024, max: 65535 })
];

// Get system configuration
router.get('/', async (req, res) => {
  try {
    let config = await prisma.systemConfig.findFirst();

    if (!config) {
      // Create default configuration with all new fields
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
          taxRate: 20.0,
          autoprint: true,
          defaultPrinter: '',
          printLogo: true,
          smsNotifications: true,
          emailNotifications: true,
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          qcEnabled: true,
          qcFrequency: 'DAILY',
          qcRetentionDays: 365,
          autoBackup: false,
          backupFrequency: 'WEEKLY',
          backupRetentionDays: 30,
          sessionTimeout: 30,
          passwordExpiry: 90,
          maxLoginAttempts: 5,
          hl7Enabled: false,
          hl7Port: 2575,
          lisIntegration: false
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

    // Extract all possible fields from request body
    const updateData = {};
    const allowedFields = [
      'labName', 'labCode', 'address', 'phone', 'email', 'website', 'fax',
      'directorName', 'directorTitle', 'directorSignature',
      'accreditationNumber', 'accreditationBody', 'accreditationExpiry', 'licenseNumber',
      'currencySymbol', 'currencyCode', 'currencyPosition', 'decimalPlaces', 'taxRate',
      'autoprint', 'defaultPrinter', 'printLogo', 'logoUrl', 'reportHeader', 'reportFooter',
      'smsNotifications', 'emailNotifications', 'smsProvider', 'smsApiKey', 'emailProvider', 'emailApiKey',
      'language', 'timezone', 'dateFormat', 'timeFormat',
      'qcEnabled', 'qcFrequency', 'qcRetentionDays',
      'autoBackup', 'backupFrequency', 'backupRetentionDays',
      'sessionTimeout', 'passwordExpiry', 'maxLoginAttempts',
      'hl7Enabled', 'hl7Port', 'lisIntegration',
      'customSettings'
    ];

    // Only include fields that are present in the request
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    let config = await prisma.systemConfig.findFirst();

    if (config) {
      // Update existing config
      config = await prisma.systemConfig.update({
        where: { id: config.id },
        data: updateData
      });
    } else {
      // Create new config with defaults for missing fields
      const defaultData = {
        labName: 'SIL Laboratory',
        address: '123 Main Street, City, Country',
        phone: '+1234567890',
        email: 'info@sil.lab',
        currencySymbol: '€',
        currencyCode: 'EUR',
        currencyPosition: 'AFTER',
        decimalPlaces: 2,
        taxRate: 20.0,
        autoprint: true,
        printLogo: true,
        smsNotifications: true,
        emailNotifications: true,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        qcEnabled: true,
        qcFrequency: 'DAILY',
        qcRetentionDays: 365,
        autoBackup: false,
        backupFrequency: 'WEEKLY',
        backupRetentionDays: 30,
        sessionTimeout: 30,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        hl7Enabled: false,
        hl7Port: 2575,
        lisIntegration: false,
        ...updateData
      };

      config = await prisma.systemConfig.create({
        data: defaultData
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

// Get comprehensive server information
router.get('/server-info', async (req, res) => {
  try {
    // Basic system information using built-in Node.js modules
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(2);

    // Database statistics
    const dbStats = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.analysis.count(),
      prisma.request.count(),
      prisma.result.count(),
      prisma.systemConfig.count()
    ]);

    // Calculate database size (approximate)
    let dbSize = 0;
    try {
      const dbPath = process.env.DATABASE_URL || '';
      if (dbPath.includes('sqlite')) {
        const sqlitePath = dbPath.replace('file:', '');
        const stats = await fs.stat(sqlitePath);
        dbSize = stats.size;
      }
    } catch (error) {
      console.log('Could not determine database size:', error.message);
    }

    // Node.js process information
    const processInfo = {
      pid: process.pid,
      ppid: process.ppid,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd(),
      execPath: process.execPath,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '5001',
        TZ: process.env.TZ || 'UTC'
      }
    };

    // Application statistics
    const appStats = {
      serverStartTime: new Date(Date.now() - process.uptime() * 1000),
      serverUptime: process.uptime(),
      totalRequests: dbStats[3], // request count
      totalPatients: dbStats[0],
      totalDoctors: dbStats[1],
      totalAnalyses: dbStats[2],
      totalResults: dbStats[4],
      configRecords: dbStats[5]
    };

    // Basic system info using os module
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      release: os.release(),
      uptime: os.uptime(),
      type: os.type(),
      cpus: os.cpus(),
      networkInterfaces: os.networkInterfaces(),
      tmpdir: os.tmpdir(),
      homedir: os.homedir(),
      endianness: os.endianness(),
      loadavg: os.loadavg()
    };

    // Memory information
    const memoryInfo = {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usage: parseFloat(memUsage)
    };

    // Simple performance metrics
    const performanceInfo = {
      cpu: {
        count: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        speed: os.cpus()[0]?.speed || 0,
        loadAverage: os.loadavg()
      },
      memory: {
        ...memoryInfo,
        layout: [] // Default empty array for memory layout
      },
      graphics: [] // Default empty array for graphics
    };

    const serverInfo = {
      timestamp: new Date().toISOString(),
      system: {
        platform: systemInfo.platform,
        arch: systemInfo.arch,
        hostname: systemInfo.hostname,
        release: systemInfo.release,
        uptime: systemInfo.uptime,
        type: systemInfo.type
      },
      os: {
        platform: systemInfo.platform,
        arch: systemInfo.arch,
        hostname: systemInfo.hostname,
        release: systemInfo.release,
        uptime: systemInfo.uptime,
        type: systemInfo.type,
        tmpdir: systemInfo.tmpdir,
        homedir: systemInfo.homedir,
        endianness: systemInfo.endianness
      },
      runtime: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      process: processInfo,
      application: appStats,
      performance: {
        cpu: {
          brand: performanceInfo.cpu.model,
          speed: performanceInfo.cpu.speed / 1000, // Convert to GHz
          cores: performanceInfo.cpu.count,
          currentLoad: 0 // We'll calculate this differently later
        },
        memory: performanceInfo.memory,
        graphics: performanceInfo.graphics || []
      },
      network: {
        hostname: systemInfo.hostname,
        interfaces: Object.entries(systemInfo.networkInterfaces)
          .filter(([_, addrs]) => addrs && addrs.length > 0)
          .map(([name, addrs]) => ({
            iface: name,
            ip4: addrs?.find(addr => addr.family === 'IPv4' && !addr.internal)?.address || 'N/A',
            ip6: addrs?.find(addr => addr.family === 'IPv6' && !addr.internal)?.address || 'N/A',
            mac: addrs?.[0]?.mac || 'N/A',
            type: addrs?.[0]?.internal ? 'internal' : 'external',
            speed: 0
          })),
        externalIP: { ok: false, outAddr: 'Not available' },
        internetConnectivity: null
      },
      security: {
        users: [], // Default empty array
        processes: {
          total: 0,
          running: 0,
          blocked: 0,
          sleeping: 0
        },
        services: 0
      },
      database: {
        type: process.env.DATABASE_URL?.includes('sqlite') ? 'SQLite' : 
              process.env.DATABASE_URL?.includes('postgres') ? 'PostgreSQL' : 
              process.env.DATABASE_URL?.includes('mysql') ? 'MySQL' : 'Unknown',
        size: dbSize,
        tables: {
          patients: dbStats[0],
          doctors: dbStats[1],
          analyses: dbStats[2],
          requests: dbStats[3],
          results: dbStats[4],
          configs: dbStats[5]
        }
      },
      storage: [
        {
          device: 'main',
          type: 'unknown',
          size: 0,
          used: 0,
          available: 0,
          usePercent: 0,
          mount: '/'
        }
      ],
      battery: null
    };

    res.json({ serverInfo });

  } catch (error) {
    console.error('Get server info error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router; 