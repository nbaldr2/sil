const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const doctorValidation = [
  body('firstName').isLength({ min: 2 }).trim(),
  body('lastName').isLength({ min: 2 }).trim(),
  body('specialty').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 8 }),
  body('address').isLength({ min: 5 }),
  body('orderNumber').isLength({ min: 1 })
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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

    // Check if doctor with same email already exists
    const existingDoctorByEmail = await prisma.doctor.findUnique({
      where: { email }
    });

    if (existingDoctorByEmail) {
      return res.status(400).json({ error: 'Doctor with this email already exists' });
    }

    // Check if doctor with same order number already exists
    const existingDoctorByOrder = await prisma.doctor.findUnique({
      where: { orderNumber }
    });

    if (existingDoctorByOrder) {
      return res.status(400).json({ error: 'Doctor with this order number already exists' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        firstName,
        lastName,
        specialty,
        email,
        phone,
        address,
        orderNumber,
        notes
      }
    });

    res.status(201).json({ doctor });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      nom, 
      prenom, 
      specialite, 
      email, 
      telephone, 
      adresse, 
      numeroOrdre, 
      notes,
      statut 
    } = req.body;

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
    if (numeroOrdre !== existingDoctor.numeroOrdre) {
      const doctorWithSameOrder = await prisma.doctor.findUnique({
        where: { numeroOrdre }
      });

      if (doctorWithSameOrder) {
        return res.status(400).json({ error: 'Doctor with this order number already exists' });
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        nom,
        prenom,
        specialite,
        email,
        telephone,
        adresse,
        numeroOrdre,
        notes,
        statut
      }
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