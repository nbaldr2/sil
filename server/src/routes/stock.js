const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get stock dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProducts,
      totalValue,
      expiringSoon,
      lowStock
    ] = await Promise.all([
      prisma.product.count({
        where: { isActive: true }
      }),
      prisma.stockEntry.aggregate({
        _sum: {
          quantity: true
        }
      }),
      prisma.stockEntry.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            gte: new Date()
          }
        }
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stockEntries: {
            some: {
              quantity: {
                lte: 10 // Low stock threshold
              }
            }
          }
        }
      })
    ]);

    res.json({
      totalProducts,
      totalValue: totalValue._sum.quantity || 0,
      expiringSoon,
      lowStock
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get all products with stock levels
router.get('/products', async (req, res) => {
  try {
    const { search = '', category = '', status = '', limit = 50 } = req.query;
    
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        stockEntries: {
          select: {
            quantity: true,
            expiryDate: true,
            location: true
          }
        }
      },
      take: parseInt(limit)
    });

    // Calculate current stock levels
    const productsWithStock = products.map(product => {
      const totalStock = product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      const expiringStock = product.stockEntries
        .filter(entry => entry.expiryDate && new Date(entry.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, entry) => sum + entry.quantity, 0);
      
      let stockStatus = 'AVAILABLE';
      if (totalStock === 0) stockStatus = 'OUT_OF_STOCK';
      else if (totalStock <= 10) stockStatus = 'LOW_STOCK';
      else if (expiringStock > 0) stockStatus = 'EXPIRED';

      return {
        ...product,
        currentStock: totalStock,
        expiringStock,
        stockStatus,
        hasExpiryDate: true // Default to true for existing products
      };
    });

    // Filter by status if provided
    const filteredProducts = status ? 
      productsWithStock.filter(p => p.stockStatus === status) : 
      productsWithStock;

    res.json(filteredProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Create new product
router.post('/products', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('code').notEmpty().withMessage('Product code is required'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Prepare product data, excluding hasExpiryDate if it doesn't exist in schema
    const productData = {
      name: req.body.name,
      code: req.body.code,
      category: req.body.category,
      description: req.body.description || null,
      unit: req.body.unit || 'pcs',
      minStock: parseInt(req.body.minQuantity) || 0,
      maxStock: parseInt(req.body.maxQuantity) || null
    };

    const product = await prisma.product.create({
      data: productData
    });

    // Add hasExpiryDate field to response for frontend compatibility
    const productWithExpiry = {
      ...product,
      hasExpiryDate: req.body.hasExpiryDate !== false // Default to true if not specified
    };

    res.status(201).json(productWithExpiry);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { search = '', limit = 50 } = req.query;
    
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const suppliers = await prisma.supplier.findMany({
      where,
      take: parseInt(limit),
      orderBy: { name: 'asc' }
    });

    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to get suppliers' });
  }
});

// Create new supplier
router.post('/suppliers', [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('code').notEmpty().withMessage('Supplier code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await prisma.supplier.create({
      data: req.body
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Update supplier
router.put('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: req.body
    });

    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Supplier deactivated successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { search = '', status = '', limit = 50 } = req.query;
    
    const where = {
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(status && { status })
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        supplier: {
          select: {
            name: true,
            code: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Create new order
router.post('/orders', [
  body('supplierId').notEmpty().withMessage('Supplier is required'),
  body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderItems, ...orderData } = req.body;
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        totalAmount,
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        supplier: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderItems, ...orderData } = req.body;
    
    // Calculate total amount if orderItems provided
    if (orderItems) {
      orderData.totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const order = await prisma.order.update({
      where: { id },
      data: orderData,
      include: {
        supplier: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Add stock entry
router.post('/stock-in', [
  body('productId').notEmpty().withMessage('Product is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Transform the data to handle date conversion
    const stockData = {
      ...req.body,
      quantity: parseInt(req.body.quantity),
      unitCost: parseFloat(req.body.unitCost || 0),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null
    };

    const stockEntry = await prisma.stockEntry.create({
      data: stockData,
      include: {
        product: true,
        supplier: true
      }
    });

    res.status(201).json(stockEntry);
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ 
      error: 'Failed to add stock',
      details: error.message,
      code: error.code
    });
  }
});

// Use stock (stock out)
router.post('/stock-out', [
  body('productId').notEmpty().withMessage('Product is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if enough stock is available
    const currentStock = await prisma.stockEntry.aggregate({
      where: { productId: req.body.productId },
      _sum: { quantity: true }
    });

    const availableStock = currentStock._sum.quantity || 0;
    if (availableStock < req.body.quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    // Get stock entries ordered by expiry date (FIFO - First In, First Out)
    const stockEntries = await prisma.stockEntry.findMany({
      where: { 
        productId: req.body.productId,
        quantity: { gt: 0 } // Only entries with positive quantity
      },
      orderBy: [
        { expiryDate: 'asc' }, // Use oldest expiry first
        { receivedAt: 'asc' }   // Then oldest received first
      ]
    });

    let remainingQuantity = req.body.quantity;
    const updates = [];

    // Reduce stock using FIFO method
    for (const entry of stockEntries) {
      if (remainingQuantity <= 0) break;

      const quantityToReduce = Math.min(entry.quantity, remainingQuantity);
      const newQuantity = entry.quantity - quantityToReduce;
      remainingQuantity -= quantityToReduce;

      updates.push(
        prisma.stockEntry.update({
          where: { id: entry.id },
          data: { quantity: newQuantity }
        })
      );
    }

    // Create the stock out record
    const stockOutData = {
      ...req.body,
      quantity: req.body.quantity - remainingQuantity // Actual quantity used
    };

    updates.push(
      prisma.stockOut.create({
        data: stockOutData,
        include: {
          product: true
        }
      })
    );

    // Execute all updates in a transaction
    const results = await prisma.$transaction(updates);
    const stockOut = results[results.length - 1]; // Last result is the stock out record

    res.status(201).json(stockOut);
  } catch (error) {
    console.error('Use stock error:', error);
    res.status(500).json({ 
      error: 'Failed to use stock',
      details: error.message,
      code: error.code
    });
  }
});

// Transfer stock
router.post('/transfer', [
  body('productId').notEmpty().withMessage('Product is required'),
  body('fromLocation').notEmpty().withMessage('From location is required'),
  body('toLocation').notEmpty().withMessage('To location is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if enough stock is available in source location
    const sourceStock = await prisma.stockEntry.aggregate({
      where: { 
        productId: req.body.productId,
        location: req.body.fromLocation
      },
      _sum: { quantity: true }
    });

    const availableStock = sourceStock._sum.quantity || 0;
    if (availableStock < req.body.quantity) {
      return res.status(400).json({ error: 'Insufficient stock in source location' });
    }

    // Get stock entries from source location ordered by expiry date (FIFO)
    const sourceEntries = await prisma.stockEntry.findMany({
      where: { 
        productId: req.body.productId,
        location: req.body.fromLocation,
        quantity: { gt: 0 }
      },
      orderBy: [
        { expiryDate: 'asc' },
        { receivedAt: 'asc' }
      ]
    });

    let remainingQuantity = req.body.quantity;
    const updates = [];

    // Reduce stock from source location using FIFO method
    for (const entry of sourceEntries) {
      if (remainingQuantity <= 0) break;

      const quantityToTransfer = Math.min(entry.quantity, remainingQuantity);
      const newQuantity = entry.quantity - quantityToTransfer;
      remainingQuantity -= quantityToTransfer;

      updates.push(
        prisma.stockEntry.update({
          where: { id: entry.id },
          data: { quantity: newQuantity }
        })
      );
    }

    // Add stock to destination location
    updates.push(
      prisma.stockEntry.create({
        data: {
          productId: req.body.productId,
          quantity: req.body.quantity - remainingQuantity,
          location: req.body.toLocation,
          lotNumber: `TRANSFER-${Date.now()}`,
          notes: `Transferred from ${req.body.fromLocation}`,
          receivedBy: req.body.transferredBy || 'System'
        }
      })
    );

    // Create the transfer record
    const transferData = {
      ...req.body,
      quantity: req.body.quantity - remainingQuantity // Actual quantity transferred
    };

    updates.push(
      prisma.stockTransfer.create({
        data: transferData,
        include: {
          product: true
        }
      })
    );

    // Execute all updates in a transaction
    const results = await prisma.$transaction(updates);
    const transfer = results[results.length - 1]; // Last result is the transfer record

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Transfer stock error:', error);
    res.status(500).json({ 
      error: 'Failed to transfer stock',
      details: error.message,
      code: error.code
    });
  }
});

// Adjust inventory
router.post('/adjust', [
  body('productId').notEmpty().withMessage('Product is required'),
  body('newQuantity').isInt({ min: 0 }).withMessage('New quantity must be non-negative'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get current stock
    const currentStock = await prisma.stockEntry.aggregate({
      where: { productId: req.body.productId },
      _sum: { quantity: true }
    });

    const oldQuantity = currentStock._sum.quantity || 0;
    const difference = req.body.newQuantity - oldQuantity;

    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        ...req.body,
        oldQuantity,
        difference
      },
      include: {
        product: true
      }
    });

    res.status(201).json(adjustment);
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

// Get comprehensive stock activity report
router.get('/activities', async (req, res) => {
  try {
    const { productId, startDate, endDate, type, limit = 200 } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get stock entries (additions)
    const stockEntries = await prisma.stockEntry.findMany({
      where: {
        ...(productId && { productId }),
        ...(Object.keys(dateFilter).length > 0 && { receivedAt: dateFilter })
      },
      include: {
        product: {
          select: {
            name: true,
            code: true,
            category: true
          }
        },
        supplier: {
          select: {
            name: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { receivedAt: 'desc' }
    });

    // Get stock outs (usage)
    const stockOuts = await prisma.stockOut.findMany({
      where: {
        ...(productId && { productId }),
        ...(Object.keys(dateFilter).length > 0 && { usedAt: dateFilter })
      },
      include: {
        product: {
          select: {
            name: true,
            code: true,
            category: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { usedAt: 'desc' }
    });

    // Get stock transfers
    const stockTransfers = await prisma.stockTransfer.findMany({
      where: {
        ...(productId && { productId }),
        ...(Object.keys(dateFilter).length > 0 && { transferredAt: dateFilter })
      },
      include: {
        product: {
          select: {
            name: true,
            code: true,
            category: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { transferredAt: 'desc' }
    });

    // Get inventory adjustments
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: {
        ...(productId && { productId }),
        ...(Object.keys(dateFilter).length > 0 && { adjustedAt: dateFilter })
      },
      include: {
        product: {
          select: {
            name: true,
            code: true,
            category: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { adjustedAt: 'desc' }
    });

    // Combine and format all activities
    const activities = [
      // Stock entries (additions)
      ...stockEntries.map(entry => ({
        id: entry.id,
        type: 'STOCK_IN',
        productId: entry.productId,
        productName: entry.product.name,
        productCode: entry.product.code,
        category: entry.product.category,
        quantity: entry.quantity,
        location: entry.location,
        lotNumber: entry.lotNumber,
        expiryDate: entry.expiryDate,
        unitCost: entry.unitCost,
        supplier: entry.supplier?.name,
        performedBy: entry.receivedBy,
        date: entry.receivedAt,
        notes: entry.notes,
        description: `Added ${entry.quantity} ${entry.product.name} to ${entry.location}`
      })),

      // Stock outs (usage)
      ...stockOuts.map(out => ({
        id: out.id,
        type: 'STOCK_OUT',
        productId: out.productId,
        productName: out.product.name,
        productCode: out.product.code,
        category: out.product.category,
        quantity: -out.quantity, // Negative to show reduction
        location: 'N/A',
        lotNumber: 'N/A',
        expiryDate: null,
        unitCost: 0,
        supplier: null,
        performedBy: out.usedBy,
        date: out.usedAt,
        notes: out.notes,
        department: out.department,
        purpose: out.purpose,
        description: `Used ${out.quantity} ${out.product.name} for ${out.purpose || 'general use'}`
      })),

      // Stock transfers
      ...stockTransfers.map(transfer => ({
        id: transfer.id,
        type: 'TRANSFER',
        productId: transfer.productId,
        productName: transfer.product.name,
        productCode: transfer.product.code,
        category: transfer.product.category,
        quantity: transfer.quantity,
        fromLocation: transfer.fromLocation,
        toLocation: transfer.toLocation,
        location: `${transfer.fromLocation} → ${transfer.toLocation}`,
        lotNumber: 'N/A',
        expiryDate: null,
        unitCost: 0,
        supplier: null,
        performedBy: transfer.transferredBy,
        date: transfer.transferredAt,
        notes: transfer.notes,
        description: `Transferred ${transfer.quantity} ${transfer.product.name} from ${transfer.fromLocation} to ${transfer.toLocation}`
      })),

      // Inventory adjustments
      ...adjustments.map(adjustment => ({
        id: adjustment.id,
        type: 'ADJUSTMENT',
        productId: adjustment.productId,
        productName: adjustment.product.name,
        productCode: adjustment.product.code,
        category: adjustment.product.category,
        quantity: adjustment.difference,
        oldQuantity: adjustment.oldQuantity,
        newQuantity: adjustment.newQuantity,
        location: 'N/A',
        lotNumber: 'N/A',
        expiryDate: null,
        unitCost: 0,
        supplier: null,
        performedBy: adjustment.adjustedBy,
        date: adjustment.adjustedAt,
        notes: adjustment.notes,
        reason: adjustment.reason,
        description: `Adjusted ${adjustment.product.name} from ${adjustment.oldQuantity} to ${adjustment.newQuantity} (${adjustment.difference > 0 ? '+' : ''}${adjustment.difference})`
      }))
    ];

    // Sort by date (newest first) and apply type filter
    let filteredActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }

    // Apply limit
    filteredActivities = filteredActivities.slice(0, parseInt(limit));

    res.json({
      activities: filteredActivities,
      summary: {
        total: filteredActivities.length,
        stockIn: filteredActivities.filter(a => a.type === 'STOCK_IN').length,
        stockOut: filteredActivities.filter(a => a.type === 'STOCK_OUT').length,
        transfers: filteredActivities.filter(a => a.type === 'TRANSFER').length,
        adjustments: filteredActivities.filter(a => a.type === 'ADJUSTMENT').length
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ 
      error: 'Failed to get activities',
      details: error.message
    });
  }
});

// Get stock history (legacy endpoint)
router.get('/history', async (req, res) => {
  try {
    const { productId, type, limit = 100 } = req.query;
    
    const where = {
      ...(productId && { productId }),
      ...(type && { action: type })
    };

    const history = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Export stock report
router.get('/export', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        stockEntries: {
          select: {
            quantity: true,
            expiryDate: true,
            location: true
          }
        }
      }
    });

    const report = products.map(product => {
      const totalStock = product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      
      // Get expiring entries (within next 30 days)
      const expiringEntries = product.stockEntries
        .filter(entry => entry.expiryDate && new Date(entry.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      const expiringStock = expiringEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      
      // Find earliest expiry date from expiring entries
      let earliestExpiryDate = null;
      if (expiringEntries.length > 0) {
        earliestExpiryDate = expiringEntries
          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0].expiryDate;
      }
      
      return {
        code: product.code,
        name: product.name,
        category: product.category,
        currentStock: totalStock,
        expiringStock,
        unit: product.unit,
        minStock: product.minStock,
        earliestExpiryDate // Add this field
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

module.exports = router;