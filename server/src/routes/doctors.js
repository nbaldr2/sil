const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const doctorValidation = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 2 }).trim(),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 2 }).trim(),
  body('specialty').notEmpty().withMessage('Specialty is required').isLength({ min: 2 }).trim(),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isLength({ min: 8 }).withMessage('Phone must be at least 8 characters'),
  body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('orderNumber').notEmpty().withMessage('Order number is required').isLength({ min: 1 })
];

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.statut = status;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { requests: true }
          }
        }
      }),
      prisma.doctor.count({ where: whereClause })
    ]);

    res.json({
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        requests: {
          include: {
            patient: true,
            requestAnalyses: {
              include: {
                analysis: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ doctor });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create doctor
router.post('/', doctorValidation, async (req, res) => {
  try {
    console.log('Creating doctor with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      specialty, 
      email, 
      phone, 
      address, 
      orderNumber, 
      notes 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !specialty || !orderNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'specialty', 'orderNumber']
      });
    }

    // Check for existing email or order number
    const existing = await prisma.doctor.findFirst({
      where: {
        OR: [
          { email: email },
          { orderNumber: orderNumber }
        ]
      }
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: 'Doctor already exists with this email or order number' 
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        firstName,
        lastName,
        specialty,
        email,
        phone,
        orderNumber,
        // Note: address field doesn't exist in schema, removing it
        // notes field doesn't exist in schema, removing it
      }
    });

    res.status(201).json({ 
      doctor,
      message: 'Doctor created successfully' 
    });

  } catch (error) {
    console.error('Doctor creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create doctor',
      details: error.message 
    });
  }
});

// Update doctor
router.put('/:id', doctorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      specialty, 
      email, 
      phone, 
      orderNumber, 
      status,
      // Support both French and English field names for backward compatibility
      nom, 
      prenom, 
      specialite, 
      telephone, 
      numeroOrdre, 
      statut 
    } = req.body;

    // Use English names first, fall back to French names
    const finalFirstName = firstName || prenom;
    const finalLastName = lastName || nom;
    const finalSpecialty = specialty || specialite;
    const finalPhone = phone || telephone;
    const finalOrderNumber = orderNumber || numeroOrdre;
    const finalStatus = status || statut;

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!existingDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if email is being changed and if it already exists
    if (email !== existingDoctor.email) {
      const doctorWithSameEmail = await prisma.doctor.findUnique({
        where: { email }
      });

      if (doctorWithSameEmail) {
        return res.status(400).json({ error: 'Doctor with this email already exists' });
      }
    }

    // Check if order number is being changed and if it already exists
    if (finalOrderNumber && finalOrderNumber !== existingDoctor.orderNumber) {
      const doctorWithSameOrder = await prisma.doctor.findUnique({
        where: { orderNumber: finalOrderNumber }
      });

      if (doctorWithSameOrder) {
        return res.status(400).json({ error: 'Doctor with this order number already exists' });
      }
    }

    const updateData = {
      firstName: finalFirstName,
      lastName: finalLastName,
      specialty: finalSpecialty,
      email,
      phone: finalPhone,
      orderNumber: finalOrderNumber
    };

    // Only add status if it's provided and valid
    if (finalStatus && ['ACTIVE', 'INACTIVE'].includes(finalStatus)) {
      updateData.status = finalStatus;
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData
    });

    res.json({ doctor });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { requests: true }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if doctor has requests
    if (doctor._count.requests > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete doctor with existing requests',
        requestCount: doctor._count.requests
      });
    }

    await prisma.doctor.delete({
      where: { id }
    });

    res.json({ message: 'Doctor deleted successfully' });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalDoctors, activeDoctors, inactiveDoctors, doctorsWithRequests] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { statut: 'ACTIF' } }),
      prisma.doctor.count({ where: { statut: 'INACTIF' } }),
      prisma.doctor.count({
        where: {
          requests: {
            some: {}
          }
        }
      })
    ]);

    // Get top doctors by request count
    const topDoctors = await prisma.doctor.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        specialite: true,
        _count: {
          select: { requests: true }
        }
      },
      orderBy: {
        requests: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json({
      totalDoctors,
      activeDoctors,
      inactiveDoctors,
      doctorsWithRequests,
      doctorsWithoutRequests: totalDoctors - doctorsWithRequests,
      topDoctors
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search doctors for autocomplete
router.get('/search/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ doctors: [] });
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { prenom: { contains: q, mode: 'insensitive' } },
          { specialite: { contains: q, mode: 'insensitive' } }
        ],
        statut: 'ACTIF'
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        specialite: true,
        email: true,
        telephone: true
      },
      take: 10,
      orderBy: { nom: 'asc' }
    });

    res.json({ doctors });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 