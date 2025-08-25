const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const requestValidation = [
  body('patientId').notEmpty().withMessage('Patient ID is required').isLength({ min: 1 }),
  body('doctorId').optional().isLength({ min: 1 }),
  body('appointmentDate').optional().isISO8601().withMessage('Valid date format required (YYYY-MM-DD)'),
  body('appointmentTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('sampleType').optional().isIn(['BLOOD', 'URINE', 'SALIVA', 'STOOL', 'SPUTUM', 'CEREBROSPINAL_FLUID', 'SYNOVIAL_FLUID', 'PLEURAL_FLUID', 'PERITONEAL_FLUID', 'OTHER']),
  body('tubeType').optional().isIn(['EDTA', 'CITRATE', 'HEPARIN', 'SERUM', 'PLAIN', 'FLUORIDE', 'OTHER']),
  body('analyses').isArray({ min: 1 }).withMessage('At least one analysis is required'),
  body('analyses.*.analysisId').isLength({ min: 1 }).withMessage('Analysis ID is required'),
  body('analyses.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      urgent, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { cnssNumber: { contains: search, mode: 'insensitive' } } },
        { doctor: { firstName: { contains: search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (urgent !== undefined) {
      whereClause.urgent = urgent === 'true';
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
          },
          requestAnalyses: {
            include: {
              analysis: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: { requestAnalyses: true }
          }
        }
      }),
      prisma.request.count({ where: whereClause })
    ]);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get request by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
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
        },
        requestAnalyses: {
          include: {
            analysis: {
              select: {
                id: true,
                name: true,
                code: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create request
router.post('/', requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      patientId, 
      doctorId, 
      appointmentDate, 
      appointmentTime, 
      sampleType = 'BLOOD',
      tubeType,
      urgent = false,
      discount = 0,
      advancePayment = 0,
      notes,
      analyses 
    } = req.body;

    // Validate that patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Validate that doctor exists (if provided)
    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
      });
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    analyses.forEach(analysis => {
      totalAmount += analysis.price;
    });

    const amountDue = totalAmount - advancePayment;

    // Create request with analyses in a transaction
    const request = await prisma.$transaction(async (tx) => {
      // Create the request
      const newRequest = await tx.request.create({
        data: {
          patientId,
          doctorId,
          collectionDate: appointmentDate ? new Date(appointmentDate) : null,
          collectionTime: appointmentTime,
          sampleType,
          tubeType,
          priority: urgent ? 'URGENT' : 'NORMAL',
          discount,
          advancePayment,
          totalAmount,
          amountDue,
          notes,
          // Add createdBy relation using the authenticated user
          createdById: req.user.id
        }
      });

      // Create request analyses
      const requestAnalyses = await Promise.all(
        analyses.map(analysis => {
          // Remove tva field if it exists since it's not in the database schema
          const { tva, ...analysisData } = analysis;
          
          return tx.requestAnalysis.create({
            data: {
              requestId: newRequest.id,
              analysisId: analysis.analysisId,
              price: analysis.price
            }
          });
        })
      );

      // Create result records for each analysis (for biologist validation)
      const results = await Promise.all(
        analyses.map(analysis => 
          tx.result.create({
            data: {
              requestId: newRequest.id,
              analysisId: analysis.analysisId,
              status: 'PENDING', // Default status for biologist validation
              value: null,
              unit: null,
              reference: null,
              notes: null
            }
          })
        )
      );

      return { ...newRequest, requestAnalyses, results };
    });

    // Get the complete request with relations
    const completeRequest = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        patient: true,
        doctor: true,
        requestAnalyses: {
          include: {
            analysis: true
          }
        }
      }
    });

    res.status(201).json({ request: completeRequest });

  } catch (error) {
    console.error('Create request error:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update request status
router.patch('/:id/status', [
  body('status').isIn(['CREATED', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Check if request exists
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = await prisma.request.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
        requestAnalyses: {
          include: {
            analysis: true
          }
        }
      }
    });

    res.json({ request });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request
router.put('/:id', requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { 
      patientId, 
      doctorId, 
      appointmentDate, 
      appointmentTime, 
      urgent,
      discount,
      advancePayment,
      notes,
      analyses 
    } = req.body;

    // Check if request exists
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Calculate totals
    let subtotal = 0;
    let tvaTotal = 0;

    analyses.forEach(analysis => {
      subtotal += analysis.price;
      tvaTotal += analysis.price * (analysis.tva / 100);
    });

    const totalBeforeDiscount = subtotal + tvaTotal;
    const discountAmount = totalBeforeDiscount * (discount / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;
    const amountDue = totalAfterDiscount - advancePayment;

    // Update request with analyses in a transaction
    const request = await prisma.$transaction(async (tx) => {
      // Update the request
      const updatedRequest = await tx.request.update({
        where: { id },
        data: {
          patientId,
          doctorId,
          appointmentDate,
          appointmentTime,
          urgent,
          discount,
          advancePayment,
          subtotal,
          tvaTotal,
          totalBeforeDiscount,
          discountAmount,
          totalAfterDiscount,
          amountDue,
          notes
        }
      });

      // Delete existing request analyses
      await tx.requestAnalysis.deleteMany({
        where: { requestId: id }
      });

      // Create new request analyses
      const requestAnalyses = await Promise.all(
        analyses.map(analysis => 
          tx.requestAnalysis.create({
            data: {
              requestId: id,
              analysisId: analysis.analysisId,
              price: analysis.price,
              tva: analysis.tva
            }
          })
        )
      );

      return { ...updatedRequest, requestAnalyses };
    });

    // Get the complete request with relations
    const completeRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        requestAnalyses: {
          include: {
            analysis: true
          }
        }
      }
    });

    res.json({ request: completeRequest });

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const request = await prisma.request.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete request (cascade will handle requestAnalyses)
    await prisma.request.delete({
      where: { id }
    });

    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { gte: weekAgo };
        break;
      case 'month':
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        };
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        dateFilter = { gte: quarterStart };
        break;
      case 'year':
        dateFilter = {
          gte: new Date(now.getFullYear(), 0, 1)
        };
        break;
    }

    const [
      totalRequests,
      pendingRequests,
      completedRequests,
      urgentRequests,
      totalRevenue,
      averageRevenue
    ] = await Promise.all([
      prisma.request.count({ where: { createdAt: dateFilter } }),
      prisma.request.count({ 
        where: { 
          createdAt: dateFilter,
          status: { in: ['CREATED', 'PENDING', 'PROCESSING'] }
        } 
      }),
      prisma.request.count({ 
        where: { 
          createdAt: dateFilter,
          status: 'COMPLETED'
        } 
      }),
      prisma.request.count({ 
        where: { 
          createdAt: dateFilter,
          urgent: true
        } 
      }),
      prisma.request.aggregate({
        where: { createdAt: dateFilter },
        _sum: { amountDue: true }
      }),
      prisma.request.aggregate({
        where: { createdAt: dateFilter },
        _avg: { amountDue: true }
      })
    ]);

    // Get status distribution
    const statusDistribution = await prisma.request.groupBy({
      by: ['status'],
      where: { createdAt: dateFilter },
      _count: { status: true }
    });

    // Get revenue by month (last 12 months)
    const revenueByMonth = await prisma.request.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(now.getFullYear() - 1, now.getMonth(), 1)
        }
      },
      _sum: { amountDue: true }
    });

    res.json({
      totalRequests,
      pendingRequests,
      completedRequests,
      urgentRequests,
      totalRevenue: totalRevenue._sum.amountDue || 0,
      averageRevenue: averageRevenue._avg.amountDue || 0,
      statusDistribution,
      revenueByMonth
    });

  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark request as delivered (simplified version)
router.patch('/:id/deliver', [
  body('deliveredBy').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { deliveredBy } = req.body;

    const request = await prisma.request.update({
      where: { id },
      data: {
        status: 'COMPLETED' // Use COMPLETED instead of VALIDATED for now
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            cnssNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ request });

  } catch (error) {
    console.error('Mark request as delivered error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 