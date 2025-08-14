const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const analysisValidation = [
  body('code').isLength({ min: 2 }).trim(),
  body('nom').isLength({ min: 2 }).trim(),
  body('category').isLength({ min: 2 }).trim(),
  body('price').isFloat({ min: 0 }),
  body('tva').isFloat({ min: 0, max: 100 }).optional()
];

// Get all analyses
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { requestAnalyses: true }
          }
        }
      }),
      prisma.analysis.count({ where: whereClause })
    ]);

    res.json({
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analysis by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        requestAnalyses: {
          include: {
            request: {
              include: {
                patient: true,
                doctor: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create analysis
router.post('/', analysisValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, nom, category, price, tva = 20, cost } = req.body;

    // Check if analysis with same code already exists
    const existingAnalysis = await prisma.analysis.findUnique({
      where: { code }
    });

    if (existingAnalysis) {
      return res.status(400).json({ error: 'Analysis with this code already exists' });
    }

    const analysis = await prisma.analysis.create({
      data: {
        code,
        nom,
        category,
        price,
        tva,
        cost
      }
    });

    res.status(201).json({ analysis });

  } catch (error) {
    console.error('Create analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update analysis
router.put('/:id', analysisValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { code, nom, category, price, tva, cost } = req.body;

    // Check if analysis exists
    const existingAnalysis = await prisma.analysis.findUnique({
      where: { id }
    });

    if (!existingAnalysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check if code is being changed and if it already exists
    if (code !== existingAnalysis.code) {
      const analysisWithSameCode = await prisma.analysis.findUnique({
        where: { code }
      });

      if (analysisWithSameCode) {
        return res.status(400).json({ error: 'Analysis with this code already exists' });
      }
    }

    const analysis = await prisma.analysis.update({
      where: { id },
      data: {
        code,
        nom,
        category,
        price,
        tva,
        cost
      }
    });

    res.json({ analysis });

  } catch (error) {
    console.error('Update analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete analysis
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if analysis exists
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        _count: {
          select: { requestAnalyses: true }
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check if analysis has requests
    if (analysis._count.requestAnalyses > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete analysis with existing requests',
        requestCount: analysis._count.requestAnalyses
      });
    }

    await prisma.analysis.delete({
      where: { id }
    });

    res.json({ message: 'Analysis deleted successfully' });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analysis categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.analysis.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    const categoryList = categories.map(cat => cat.category);

    res.json({ categories: categoryList });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search analyses for autocomplete
router.get('/search/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ analyses: [] });
    }

    const analyses = await prisma.analysis.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { nom: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        code: true,
        nom: true,
        category: true,
        price: true,
        tva: true
      },
      take: 10,
      orderBy: { nom: 'asc' }
    });

    res.json({ analyses });

  } catch (error) {
    console.error('Search analyses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update prices
router.put('/prices/bulk', async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const results = [];

    for (const update of updates) {
      const { id, price, tva } = update;

      if (!id || typeof price !== 'number' || price < 0) {
        results.push({ id, success: false, error: 'Invalid data' });
        continue;
      }

      try {
        const analysis = await prisma.analysis.update({
          where: { id },
          data: {
            price,
            tva: tva || 20
          }
        });
        results.push({ id, success: true, analysis });
      } catch (error) {
        results.push({ id, success: false, error: 'Update failed' });
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Bulk update prices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analysis statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalAnalyses, totalCategories, totalRevenue, topAnalyses] = await Promise.all([
      prisma.analysis.count(),
      prisma.analysis.findMany({
        select: { category: true },
        distinct: ['category']
      }).then(cats => cats.length),
      prisma.requestAnalysis.aggregate({
        _sum: {
          price: true
        }
      }),
      prisma.analysis.findMany({
        select: {
          id: true,
          code: true,
          nom: true,
          category: true,
          price: true,
          _count: {
            select: { requestAnalyses: true }
          }
        },
        orderBy: {
          requestAnalyses: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Calculate revenue by category
    const revenueByCategory = await prisma.analysis.groupBy({
      by: ['category'],
      _sum: {
        price: true
      },
      _count: {
        requestAnalyses: true
      }
    });

    res.json({
      totalAnalyses,
      totalCategories,
      totalRevenue: totalRevenue._sum.price || 0,
      topAnalyses,
      revenueByCategory
    });

  } catch (error) {
    console.error('Get analysis stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 