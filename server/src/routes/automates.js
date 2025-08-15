const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const automateValidation = [
  body('name').isLength({ min: 1 }),
  body('type').isLength({ min: 1 }),
  body('manufacturer').isLength({ min: 1 }),
  body('protocol').isIn(['ASTM', 'HL7', 'LIS2-A2']),
  body('connection').isIn(['tcp', 'serial', 'ftp']),
  body('config').isObject()
];

const codeMappingValidation = [
  body('codeAutomate').isLength({ min: 1 }),
  body('silTestName').isLength({ min: 1 }),
  body('sampleType').isLength({ min: 1 })
];

// Get all QC results (across all automates) - must be before parameterized routes
router.get('/qc-results/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, level, testName, automateId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (status) where.status = status;
    if (level) where.level = level;
    if (testName) where.testName = { contains: testName, mode: 'insensitive' };
    if (automateId) where.automateId = automateId;

    const qcResults = await prisma.qualityControlResult.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        automate: {
          select: {
            name: true,
            type: true,
            manufacturer: true
          }
        }
      }
    });

    const total = await prisma.qualityControlResult.count({ where });

    res.json({
      qcResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all QC results:', error);
    res.status(500).json({ error: 'Failed to fetch QC results' });
  }
});

// Get all automates
router.get('/', async (req, res) => {
  try {
    const automates = await prisma.automate.findMany({
      include: {
        driverCodes: true,
        transferLogs: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        _count: {
          select: {
            driverCodes: true,
            transferLogs: true,
            qcResults: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ automates });
  } catch (error) {
    console.error('Error fetching automates:', error);
    res.status(500).json({ error: 'Failed to fetch automates' });
  }
});

// Get single automate
router.get('/:id', async (req, res) => {
  try {
    const automate = await prisma.automate.findUnique({
      where: { id: req.params.id },
      include: {
        driverCodes: true,
        transferLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        },
        qcResults: {
          orderBy: { timestamp: 'desc' },
          take: 20
        }
      }
    });

    if (!automate) {
      return res.status(404).json({ error: 'Automate not found' });
    }

    res.json({ automate });
  } catch (error) {
    console.error('Error fetching automate:', error);
    res.status(500).json({ error: 'Failed to fetch automate' });
  }
});

// Create new automate
router.post('/', automateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      manufacturer,
      protocol,
      connection,
      config,
      enabled = true
    } = req.body;

    const automate = await prisma.automate.create({
      data: {
        name,
        type,
        manufacturer,
        protocol,
        connection,
        config,
        enabled,
        status: 'offline'
      },
      include: {
        driverCodes: true
      }
    });

    res.status(201).json({ automate });
  } catch (error) {
    console.error('Error creating automate:', error);
    res.status(500).json({ error: 'Failed to create automate' });
  }
});

// Update automate
router.put('/:id', automateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      manufacturer,
      protocol,
      connection,
      config,
      enabled
    } = req.body;

    const automate = await prisma.automate.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
        manufacturer,
        protocol,
        connection,
        config,
        enabled
      },
      include: {
        driverCodes: true
      }
    });

    res.json({ automate });
  } catch (error) {
    console.error('Error updating automate:', error);
    res.status(500).json({ error: 'Failed to update automate' });
  }
});

// Delete automate
router.delete('/:id', async (req, res) => {
  try {
    await prisma.automate.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Automate deleted successfully' });
  } catch (error) {
    console.error('Error deleting automate:', error);
    res.status(500).json({ error: 'Failed to delete automate' });
  }
});

// Add code mapping
router.post('/:id/codes', codeMappingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      codeAutomate,
      silTestName,
      sampleType,
      unit,
      refRangeLow,
      refRangeHigh
    } = req.body;

    const mapping = await prisma.automateCodeMapping.create({
      data: {
        automateId: req.params.id,
        codeAutomate,
        silTestName,
        sampleType,
        unit,
        refRangeLow,
        refRangeHigh
      }
    });

    res.status(201).json({ mapping });
  } catch (error) {
    console.error('Error creating code mapping:', error);
    res.status(500).json({ error: 'Failed to create code mapping' });
  }
});

// Update code mapping
router.put('/:id/codes/:mappingId', codeMappingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      codeAutomate,
      silTestName,
      sampleType,
      unit,
      refRangeLow,
      refRangeHigh
    } = req.body;

    const mapping = await prisma.automateCodeMapping.update({
      where: { id: req.params.mappingId },
      data: {
        codeAutomate,
        silTestName,
        sampleType,
        unit,
        refRangeLow,
        refRangeHigh
      }
    });

    res.json({ mapping });
  } catch (error) {
    console.error('Error updating code mapping:', error);
    res.status(500).json({ error: 'Failed to update code mapping' });
  }
});

// Delete code mapping
router.delete('/:id/codes/:mappingId', async (req, res) => {
  try {
    await prisma.automateCodeMapping.delete({
      where: { id: req.params.mappingId }
    });

    res.json({ message: 'Code mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting code mapping:', error);
    res.status(500).json({ error: 'Failed to delete code mapping' });
  }
});

// Get transfer logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await prisma.automateTransferLog.findMany({
      where: { automateId: req.params.id },
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.automateTransferLog.count({
      where: { automateId: req.params.id }
    });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transfer logs:', error);
    res.status(500).json({ error: 'Failed to fetch transfer logs' });
  }
});

// Add transfer log
router.post('/:id/logs', async (req, res) => {
  try {
    const { type, status, duration, errorMsg } = req.body;

    const log = await prisma.automateTransferLog.create({
      data: {
        automateId: req.params.id,
        type,
        status,
        duration,
        errorMsg
      }
    });

    res.status(201).json({ log });
  } catch (error) {
    console.error('Error creating transfer log:', error);
    res.status(500).json({ error: 'Failed to create transfer log' });
  }
});

// Update automate status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, lastSync } = req.body;

    const automate = await prisma.automate.update({
      where: { id: req.params.id },
      data: {
        status,
        lastSync: lastSync ? new Date(lastSync) : null
      }
    });

    res.json({ automate });
  } catch (error) {
    console.error('Error updating automate status:', error);
    res.status(500).json({ error: 'Failed to update automate status' });
  }
});

// Quality Control Results endpoints

// Get QC results for an automate
router.get('/:id/qc-results', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, level, testName } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { automateId: req.params.id };
    
    if (status) where.status = status;
    if (level) where.level = level;
    if (testName) where.testName = { contains: testName, mode: 'insensitive' };

    const qcResults = await prisma.qualityControlResult.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        automate: {
          select: {
            name: true,
            type: true,
            manufacturer: true
          }
        }
      }
    });

    const total = await prisma.qualityControlResult.count({ where });

    res.json({
      qcResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching QC results:', error);
    res.status(500).json({ error: 'Failed to fetch QC results' });
  }
});

// Create QC result
router.post('/:id/qc-results', async (req, res) => {
  try {
    const {
      testName,
      level,
      value,
      expected,
      deviation,
      status
    } = req.body;

    const qcResult = await prisma.qualityControlResult.create({
      data: {
        automateId: req.params.id,
        testName,
        level,
        value: parseFloat(value),
        expected: parseFloat(expected),
        deviation: parseFloat(deviation),
        status
      },
      include: {
        automate: {
          select: {
            name: true,
            type: true,
            manufacturer: true
          }
        }
      }
    });

    res.status(201).json({ qcResult });
  } catch (error) {
    console.error('Error creating QC result:', error);
    res.status(500).json({ error: 'Failed to create QC result' });
  }
});

// Update QC result
router.put('/qc-results/:qcId', async (req, res) => {
  try {
    const {
      testName,
      level,
      value,
      expected,
      deviation,
      status
    } = req.body;

    const qcResult = await prisma.qualityControlResult.update({
      where: { id: req.params.qcId },
      data: {
        testName,
        level,
        value: parseFloat(value),
        expected: parseFloat(expected),
        deviation: parseFloat(deviation),
        status
      },
      include: {
        automate: {
          select: {
            name: true,
            type: true,
            manufacturer: true
          }
        }
      }
    });

    res.json({ qcResult });
  } catch (error) {
    console.error('Error updating QC result:', error);
    res.status(500).json({ error: 'Failed to update QC result' });
  }
});

// Delete QC result
router.delete('/qc-results/:qcId', async (req, res) => {
  try {
    await prisma.qualityControlResult.delete({
      where: { id: req.params.qcId }
    });

    res.json({ message: 'QC result deleted successfully' });
  } catch (error) {
    console.error('Error deleting QC result:', error);
    res.status(500).json({ error: 'Failed to delete QC result' });
  }
});

// Get QC statistics
router.get('/:id/qc-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await prisma.qualityControlResult.groupBy({
      by: ['status'],
      where: {
        automateId: req.params.id,
        timestamp: {
          gte: startDate
        }
      },
      _count: {
        status: true
      }
    });

    const totalResults = await prisma.qualityControlResult.count({
      where: {
        automateId: req.params.id,
        timestamp: {
          gte: startDate
        }
      }
    });

    const testStats = await prisma.qualityControlResult.groupBy({
      by: ['testName', 'status'],
      where: {
        automateId: req.params.id,
        timestamp: {
          gte: startDate
        }
      },
      _count: {
        testName: true
      }
    });

    res.json({
      statusStats: stats,
      totalResults,
      testStats,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching QC statistics:', error);
    res.status(500).json({ error: 'Failed to fetch QC statistics' });
  }
});

module.exports = router; 