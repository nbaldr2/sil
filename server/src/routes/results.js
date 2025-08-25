const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware for creating results
const createResultValidation = [
  body('requestId').isLength({ min: 1 }),
  body('analysisId').isLength({ min: 1 }),
  body('value').isLength({ min: 1 }),
  body('status').isIn(['PENDING', 'VALIDATED', 'REJECTED'])
];

// Validation middleware for updating results (partial updates)
const updateResultValidation = [
  body('value').optional().isLength({ min: 1 }),
  body('unit').optional().isString(),
  body('reference').optional().isString(),
  body('status').optional().isIn(['PENDING', 'VALIDATED', 'REJECTED']),
  body('notes').optional().isString()
];

// Get all results
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { request: { patient: { firstName: { contains: search, mode: 'insensitive' } } } },
        { request: { patient: { lastName: { contains: search, mode: 'insensitive' } } } },
        { analysis: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          request: {
            include: {
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  cnssNumber: true
                }
              }
            }
          },
          analysis: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true
            }
          }
        }
      }),
      prisma.result.count({ where: whereClause })
    ]);

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get result by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                gender: true,
                cnssNumber: true
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true
              }
            }
          }
        },
        analysis: true
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ result });

  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create result
router.post('/', createResultValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      requestId, 
      analysisId, 
      value, 
      unit, 
      reference, 
      status = 'PENDING',
      notes 
    } = req.body;

    const result = await prisma.result.create({
      data: {
        requestId,
        analysisId,
        value,
        unit,
        reference,
        status,
        notes
      },
      include: {
        request: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                gender: true,
                cnssNumber: true
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true
              }
            }
          }
        },
        analysis: true
      }
    });

    res.status(201).json({ result });

  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update result
router.put('/:id', updateResultValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { 
      value, 
      unit, 
      reference, 
      status, 
      notes 
    } = req.body;

    // Check if result exists
    const existingResult = await prisma.result.findUnique({
      where: { id }
    });

    if (!existingResult) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const result = await prisma.result.update({
      where: { id },
      data: {
        value,
        unit,
        reference,
        status,
        notes,
        validatedAt: status === 'VALIDATED' ? new Date() : null,
        validatedBy: status === 'VALIDATED' ? 'system-update' : null
      },
      include: {
        request: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                gender: true,
                cnssNumber: true
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true
              }
            }
          }
        },
        analysis: true
      }
    });

    // If the status was changed to VALIDATED, update the request status
    if (status === 'VALIDATED') {
      await updateRequestStatusBasedOnResults(result.request.id);
    }

    res.json({ result });

  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check and update request status
async function updateRequestStatusBasedOnResults(requestId) {
  try {
    // Get all results for this request
    const results = await prisma.result.findMany({
      where: { requestId }
    });
    
    // If there are no results, don't change the status
    if (results.length === 0) return;
    
    // Check if all results are validated
    const allValidated = results.every(result => result.status === 'VALIDATED');
    
    // If all results are validated, update the request status to COMPLETED
    if (allValidated) {
      await prisma.request.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' }
      });
      console.log(`Request ${requestId} status updated to COMPLETED`);
    }
  } catch (error) {
    console.error(`Error updating request status: ${error}`);
  }
}

// Validate result
router.patch('/:id/validate', [
  body('validatedBy').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { validatedBy } = req.body;

    const result = await prisma.result.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        validatedBy,
        validatedAt: new Date()
      },
      include: {
        request: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                gender: true,
                cnssNumber: true
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true
              }
            }
          }
        },
        analysis: true
      }
    });

    // Update the request status if all results are validated
    await updateRequestStatusBasedOnResults(result.request.id);

    res.json({ result });

  } catch (error) {
    console.error('Validate result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get results by request
router.get('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const results = await prisma.result.findMany({
      where: { requestId },
      include: {
        analysis: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ results });

  } catch (error) {
    console.error('Get results by request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get result statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalResults, pendingResults, validatedResults, rejectedResults] = await Promise.all([
      prisma.result.count(),
      prisma.result.count({ where: { status: 'PENDING' } }),
      prisma.result.count({ where: { status: 'VALIDATED' } }),
      prisma.result.count({ where: { status: 'REJECTED' } })
    ]);

    // Get results by analysis category
    const resultsByCategory = await prisma.result.groupBy({
      by: ['analysis'],
      where: {
        analysis: {
          category: { not: null }
        }
      },
      _count: { id: true }
    });

    res.json({
      totalResults,
      pendingResults,
      validatedResults,
      rejectedResults,
      resultsByCategory
    });

  } catch (error) {
    console.error('Get result stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 