const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

/**
 * @openapi
 * tags:
 *   - name: Patients
 *     description: Patient management endpoints
 * 
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for patients
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 * 
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @openapi
 * tags:
 *   - name: Patients
 *     description: Patient management endpoints
 * 
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - dateOfBirth
 *         - gender
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated patient ID
 *         firstName:
 *           type: string
 *           description: Patient's first name
 *         lastName:
 *           type: string
 *           description: Patient's last name
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Patient's date of birth
 *         gender:
 *           type: string
 *           enum: [M, F]
 *           description: Patient's gender
 *         cnssNumber:
 *           type: string
 *           description: Patient's CNSS number (optional)
 */

/**
 * @openapi
 * /patients:
 *   get:
 *     summary: Get all patients with pagination
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering patients
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of patients with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */

// Validation middleware
const patientValidation = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 2 }).trim(),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 2 }).trim(),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Valid date format required (YYYY-MM-DD)'),
  body('gender').notEmpty().withMessage('Gender is required').isIn(['M', 'F']).withMessage('Gender must be M or F'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('phone').optional({ nullable: true, checkFalsy: true }).isString().withMessage('Phone must be a string'),
  body('cnssNumber').optional({ nullable: true, checkFalsy: true }).isString().withMessage('CNSS number must be a string')
];

// Get all patients
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { cnssNumber: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
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
      prisma.patient.count({ where: whereClause })
    ]);

    res.json({
      patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details with their requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     cnssNumber:
 *                       type: string
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           doctor:
 *                             type: object
 *                           requestAnalyses:
 *                             type: array
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        requests: {
          include: {
            doctor: true,
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

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });

  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create patient
router.post('/', patientValidation, async (req, res) => {
  try {
    console.log('Creating patient with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, dateOfBirth, cnssNumber, gender, address, phone, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'dateOfBirth', 'gender']
      });
    }

    // Check for existing CNSS or email
    if (cnssNumber || email) {
      const whereConditions = [];
      if (cnssNumber) whereConditions.push({ cnssNumber });
      if (email) whereConditions.push({ email });
      
      const existing = await prisma.patient.findFirst({
        where: {
          OR: whereConditions
        }
      });
      
      if (existing) {
        return res.status(409).json({ 
          error: 'Patient already exists with this CNSS number or email' 
        });
      }
    }

    // Convert dateOfBirth to proper DateTime format
    const dateOfBirthFormatted = new Date(dateOfBirth);
    if (isNaN(dateOfBirthFormatted.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format for dateOfBirth. Use YYYY-MM-DD format.' 
      });
    }

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirthFormatted,
        cnssNumber,
        gender,
        address,
        phone,
        email
      }
    });

    res.status(201).json({ 
      patient,
      message: 'Patient created successfully' 
    });

  } catch (error) {
    console.error('Patient creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create patient',
      details: error.message 
    });
  }
});

// Update patient
router.put('/:id', patientValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, cnssNumber, gender, address, phone, email } = req.body;

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if CNSS number is being changed and if it already exists
    if (cnssNumber && cnssNumber !== existingPatient.cnssNumber) {
      const patientWithSameCNSS = await prisma.patient.findUnique({
        where: { cnssNumber }
      });

      if (patientWithSameCNSS) {
        return res.status(400).json({ error: 'Patient with this CNSS number already exists' });
      }
    }

    // Convert dateOfBirth to proper DateTime format if provided
    const updateData = {
      firstName,
      lastName,
      cnssNumber,
      gender,
      address,
      phone,
      email
    };

    if (dateOfBirth) {
      const dateOfBirthFormatted = new Date(dateOfBirth);
      if (isNaN(dateOfBirthFormatted.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format for dateOfBirth. Use YYYY-MM-DD format.' 
        });
      }
      updateData.dateOfBirth = dateOfBirthFormatted;
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData
    });

    res.json({ patient });

  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        _count: {
          select: { requests: true }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if patient has requests
    if (patient._count.requests > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete patient with existing requests',
        requestCount: patient._count.requests
      });
    }

    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: 'Patient deleted successfully' });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalPatients, newPatientsThisMonth, patientsWithRequests] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.patient.count({
        where: {
          requests: {
            some: {}
          }
        }
      })
    ]);

    res.json({
      totalPatients,
      newPatientsThisMonth,
      patientsWithRequests,
      patientsWithoutRequests: totalPatients - patientsWithRequests
    });

  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 