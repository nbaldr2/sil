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

// Get all automates
router.get('/', async (req, res) => {
  try {
    const automates = await prisma.automate.findMany({
      include: {
        driverCodes: true,
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

module.exports = router; 