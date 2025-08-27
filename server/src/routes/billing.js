const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../services/auditService');
const pdfService = require('../services/pdfService');

const prisma = new PrismaClient();

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

// Get all customers
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type })
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              invoices: true,
              transactions: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer
router.post('/customers', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body
    });

    await auditLog(req.user.id, 'CREATE_CUSTOMER', `Created customer: ${customer.name}`, req.ip);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/customers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.update({
      where: { id },
      data: req.body
    });

    await auditLog(req.user.id, 'UPDATE_CUSTOMER', `Updated customer: ${customer.name}`, req.ip);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

// Get all invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      type, 
      customerId,
      dateFrom,
      dateTo 
    } = req.query;
    
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { patientName: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status }),
      ...(type && { type }),
      ...(customerId && { customerId }),
      ...(dateFrom && dateTo && {
        issueDate: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      })
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, type: true }
          },
          items: {
            include: {
              analysis: {
                select: { name: true, code: true }
              }
            }
          },
          taxes: true,
          transactions: {
            where: { status: 'COMPLETED' },
            select: { amount: true, paymentDate: true, paymentMethod: true }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        patient: {
          select: { id: true, firstName: true, lastName: true, dateOfBirth: true }
        },
        request: {
          select: { id: true, priority: true, sampleType: true }
        },
        items: {
          include: {
            analysis: {
              select: { name: true, code: true, category: true }
            }
          }
        },
        taxes: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        claims: {
          include: {
            customer: {
              select: { name: true, insuranceCode: true }
            }
          }
        },
        reminders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const {
      customerId,
      requestId,
      patientId,
      type = 'STANDARD',
      items,
      discountPercent = 0,
      notes,
      dueDate
    } = req.body;

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get patient info if provided
    let patient = null;
    if (patientId) {
      patient = await prisma.patient.findUnique({
        where: { id: patientId }
      });
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      subtotal += lineTotal;
      
      processedItems.push({
        ...item,
        lineTotal
      });
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * 0.20; // 20% TVA
    const stampTaxAmount = taxableAmount * 0.001; // 0.1% stamp tax
    const totalAmount = taxableAmount + taxAmount + stampTaxAmount;

    // Create invoice with items and taxes
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type,
        customerId,
        customerName: customer.name,
        customerAddress: customer.address,
        customerTaxId: customer.taxId,
        requestId,
        patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : null,
        subtotal,
        discountAmount,
        discountPercent,
        taxAmount,
        stampTaxAmount,
        totalAmount,
        balanceAmount: totalAmount,
        dueDate: new Date(dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        notes,
        createdById: req.user.id,
        items: {
          create: processedItems
        },
        taxes: {
          create: [
            {
              taxType: 'TVA',
              taxName: 'TVA 20%',
              taxRate: 20,
              taxableAmount,
              taxAmount
            },
            {
              taxType: 'STAMP_TAX',
              taxName: 'Timbre 0.1%',
              taxRate: 0.1,
              taxableAmount,
              taxAmount: stampTaxAmount
            }
          ]
        }
      },
      include: {
        items: true,
        taxes: true,
        customer: true
      }
    });

    await auditLog(req.user.id, 'CREATE_INVOICE', `Created invoice: ${invoiceNumber}`, req.ip);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice status
router.patch('/invoices/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status,
        ...(status === 'PAID' && { paidDate: new Date() })
      }
    });

    await auditLog(req.user.id, 'UPDATE_INVOICE_STATUS', `Updated invoice ${invoice.invoiceNumber} status to ${status}`, req.ip);
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// ============================================================================
// PAYMENT TRANSACTIONS
// ============================================================================

// Get transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, invoiceId, customerId, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(invoiceId && { invoiceId }),
      ...(customerId && { customerId }),
      ...(status && { status })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: { invoiceNumber: true, totalAmount: true }
          },
          customer: {
            select: { name: true, type: true }
          },
          processedBy: {
            select: { name: true }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create payment transaction
router.post('/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      invoiceId,
      customerId,
      amount,
      paymentMethod,
      paymentReference,
      description,
      notes
    } = req.body;

    // Generate transaction number
    const transactionCount = await prisma.transaction.count();
    const transactionNumber = `TXN-${new Date().getFullYear()}-${String(transactionCount + 1).padStart(6, '0')}`;

    const transaction = await prisma.$transaction(async (prisma) => {
      // Create transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          transactionNumber,
          type: 'PAYMENT',
          status: 'COMPLETED',
          amount: parseFloat(amount),
          paymentMethod,
          paymentReference,
          invoiceId,
          customerId,
          description,
          notes,
          processedById: req.user.id
        }
      });

      // Update invoice if provided
      if (invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId }
        });

        if (invoice) {
          const newPaidAmount = invoice.paidAmount + parseFloat(amount);
          const newBalanceAmount = invoice.totalAmount - newPaidAmount;
          
          let newStatus = invoice.status;
          if (newBalanceAmount <= 0) {
            newStatus = 'PAID';
          } else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL_PAID';
          }

          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              paidAmount: newPaidAmount,
              balanceAmount: newBalanceAmount,
              status: newStatus,
              ...(newStatus === 'PAID' && { paidDate: new Date() })
            }
          });
        }
      }

      return newTransaction;
    });

    await auditLog(req.user.id, 'CREATE_PAYMENT', `Created payment: ${transactionNumber} - ${amount} MAD`, req.ip);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

// Get dashboard metrics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = {
          gte: weekStart,
          lt: new Date()
        };
        break;
      case 'month':
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        };
        break;
      case 'year':
        dateFilter = {
          gte: new Date(now.getFullYear(), 0, 1),
          lt: new Date(now.getFullYear() + 1, 0, 1)
        };
        break;
    }

    const [
      totalInvoices,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      recentTransactions,
      topCustomers
    ] = await Promise.all([
      // Total invoices
      prisma.invoice.count({
        where: { issueDate: dateFilter }
      }),
      
      // Total revenue
      prisma.invoice.aggregate({
        where: { issueDate: dateFilter },
        _sum: { totalAmount: true }
      }),
      
      // Paid invoices
      prisma.invoice.count({
        where: { 
          status: 'PAID',
          issueDate: dateFilter
        }
      }),
      
      // Overdue invoices
      prisma.invoice.count({
        where: {
          status: { in: ['SENT', 'PARTIAL_PAID'] },
          dueDate: { lt: new Date() }
        }
      }),
      
      // Recent transactions
      prisma.transaction.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: dateFilter
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: { select: { invoiceNumber: true } },
          customer: { select: { name: true } }
        }
      }),
      
      // Top customers by revenue
      prisma.customer.findMany({
        take: 5,
        include: {
          invoices: {
            where: { issueDate: dateFilter },
            select: { totalAmount: true }
          }
        }
      })
    ]);

    // Calculate top customers revenue
    const customersWithRevenue = topCustomers.map(customer => ({
      ...customer,
      totalRevenue: customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      metrics: {
        totalInvoices,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        paidInvoices,
        overdueInvoices,
        collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices * 100).toFixed(1) : 0
      },
      recentTransactions,
      topCustomers: customersWithRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Generate financial report
router.get('/reports/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    const dateFilter = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };

    let reportData = {};

    switch (type) {
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter);
        break;
      case 'aging':
        reportData = await generateAgingReport();
        break;
      case 'customer':
        reportData = await generateCustomerReport(dateFilter);
        break;
      case 'tax':
        reportData = await generateTaxReport(dateFilter);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    if (format === 'pdf') {
      // TODO: Generate PDF report
      return res.status(501).json({ error: 'PDF export not implemented yet' });
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Helper functions for reports
async function generateRevenueReport(dateFilter) {
  const invoices = await prisma.invoice.findMany({
    where: { issueDate: dateFilter },
    include: {
      customer: { select: { name: true, type: true } },
      items: { include: { analysis: { select: { category: true } } } }
    }
  });

  const summary = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    totalOutstanding: invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0)
  };

  const byCustomerType = invoices.reduce((acc, inv) => {
    const type = inv.customer.type;
    if (!acc[type]) acc[type] = { count: 0, revenue: 0 };
    acc[type].count++;
    acc[type].revenue += inv.totalAmount;
    return acc;
  }, {});

  const byCategory = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const category = item.analysis?.category || 'Other';
      if (!byCategory[category]) byCategory[category] = { count: 0, revenue: 0 };
      byCategory[category].count++;
      byCategory[category].revenue += item.lineTotal;
    });
  });

  return { summary, byCustomerType, byCategory, invoices };
}

async function generateAgingReport() {
  const now = new Date();
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PARTIAL_PAID'] },
      balanceAmount: { gt: 0 }
    },
    include: {
      customer: { select: { name: true, type: true } }
    }
  });

  const aging = {
    current: [],
    days30: [],
    days60: [],
    days90: [],
    over90: []
  };

  invoices.forEach(inv => {
    const daysPastDue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24));
    
    if (daysPastDue <= 0) {
      aging.current.push(inv);
    } else if (daysPastDue <= 30) {
      aging.days30.push(inv);
    } else if (daysPastDue <= 60) {
      aging.days60.push(inv);
    } else if (daysPastDue <= 90) {
      aging.days90.push(inv);
    } else {
      aging.over90.push(inv);
    }
  });

  const summary = {
    current: aging.current.reduce((sum, inv) => sum + inv.balanceAmount, 0),
    days30: aging.days30.reduce((sum, inv) => sum + inv.balanceAmount, 0),
    days60: aging.days60.reduce((sum, inv) => sum + inv.balanceAmount, 0),
    days90: aging.days90.reduce((sum, inv) => sum + inv.balanceAmount, 0),
    over90: aging.over90.reduce((sum, inv) => sum + inv.balanceAmount, 0)
  };

  return { aging, summary };
}

async function generateCustomerReport(dateFilter) {
  const customers = await prisma.customer.findMany({
    include: {
      invoices: {
        where: { issueDate: dateFilter }
      },
      transactions: {
        where: { 
          createdAt: dateFilter,
          status: 'COMPLETED'
        }
      }
    }
  });

  return customers.map(customer => ({
    ...customer,
    totalInvoices: customer.invoices.length,
    totalRevenue: customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalPaid: customer.transactions.reduce((sum, txn) => sum + txn.amount, 0),
    averageInvoiceValue: customer.invoices.length > 0 
      ? customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / customer.invoices.length 
      : 0
  }));
}

async function generateTaxReport(dateFilter) {
  const taxes = await prisma.invoiceTax.findMany({
    where: {
      invoice: { issueDate: dateFilter }
    },
    include: {
      invoice: { select: { invoiceNumber: true, issueDate: true, status: true } }
    }
  });

  const summary = taxes.reduce((acc, tax) => {
    if (!acc[tax.taxType]) {
      acc[tax.taxType] = { taxableAmount: 0, taxAmount: 0, count: 0 };
    }
    acc[tax.taxType].taxableAmount += tax.taxableAmount;
    acc[tax.taxType].taxAmount += tax.taxAmount;
    acc[tax.taxType].count++;
    return acc;
  }, {});

  return { taxes, summary };
}

// ============================================================================
// PDF GENERATION
// ============================================================================

// Generate invoice PDF
router.get('/invoices/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        patient: {
          select: { id: true, firstName: true, lastName: true }
        },
        items: {
          include: {
            analysis: {
              select: { name: true, code: true, category: true }
            }
          }
        },
        taxes: true,
        transactions: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const pdfBuffer = await pdfService.generateInvoicePDF(invoice);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);

    await auditLog(req.user.id, 'DOWNLOAD_INVOICE_PDF', `Downloaded PDF for invoice ${invoice.invoiceNumber}`, req.ip);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate payment receipt PDF
router.get('/transactions/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: { name: true, type: true }
        },
        invoice: {
          select: { invoiceNumber: true, totalAmount: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const pdfBuffer = await pdfService.generatePaymentReceiptPDF(transaction);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${transaction.transactionNumber}.pdf"`);
    res.send(pdfBuffer);

    await auditLog(req.user.id, 'DOWNLOAD_RECEIPT_PDF', `Downloaded receipt PDF for transaction ${transaction.transactionNumber}`, req.ip);
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate receipt PDF' });
  }
});

// ============================================================================
// INVOICE FROM REQUEST
// ============================================================================

// Generate invoice from request
router.post('/invoices/from-request', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const billingService = require('../services/billingService');
    
    const invoice = await billingService.generateInvoiceFromRequest(requestId, req.user.id);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error generating invoice from request:', error);
    res.status(500).json({ error: error.message || 'Failed to generate invoice from request' });
  }
});

// ============================================================================
// RECURRING INVOICES
// ============================================================================

// Set up recurring invoice
router.post('/invoices/:id/recurring', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { recurrenceType, recurrenceEnd } = req.body;
    
    const billingService = require('../services/billingService');
    await billingService.createRecurringInvoice(id, { recurrenceType, recurrenceEnd }, req.user.id);
    
    res.json({ success: true, message: 'Recurring invoice set up successfully' });
  } catch (error) {
    console.error('Error setting up recurring invoice:', error);
    res.status(500).json({ error: 'Failed to set up recurring invoice' });
  }
});

// Cancel recurring invoice
router.delete('/invoices/:id/recurring', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.invoice.update({
      where: { id },
      data: {
        recurrenceType: 'NONE',
        recurrenceEnd: null
      }
    });

    await auditLog(req.user.id, 'CANCEL_RECURRING_INVOICE', `Cancelled recurring invoice: ${id}`, req.ip);
    res.json({ success: true, message: 'Recurring invoice cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling recurring invoice:', error);
    res.status(500).json({ error: 'Failed to cancel recurring invoice' });
  }
});

// ============================================================================
// INSURANCE CLAIMS
// ============================================================================

// Get all claims
router.get('/claims', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, insuranceCode } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(insuranceCode && { insuranceCode })
    };

    const [claims, total] = await Promise.all([
      prisma.insuranceClaim.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, insuranceCode: true, contractNumber: true }
          },
          invoice: {
            select: { invoiceNumber: true, totalAmount: true, issueDate: true }
          },
          createdBy: {
            select: { name: true }
          }
        }
      }),
      prisma.insuranceClaim.count({ where })
    ]);

    res.json({
      claims,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Create insurance claim
router.post('/claims', authenticateToken, async (req, res) => {
  try {
    const {
      invoiceId,
      customerId,
      insuranceCode,
      contractNumber,
      claimAmount,
      documents
    } = req.body;

    // Validate invoice exists and belongs to customer
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, customerId }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or does not belong to customer' });
    }

    // Generate claim number
    const claimCount = await prisma.insuranceClaim.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(claimCount + 1).padStart(6, '0')}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber,
        customerId,
        insuranceCode,
        contractNumber,
        invoiceId,
        claimAmount: parseFloat(claimAmount),
        documents,
        createdById: req.user.id
      },
      include: {
        customer: { select: { name: true } },
        invoice: { select: { invoiceNumber: true } }
      }
    });

    await auditLog(req.user.id, 'CREATE_CLAIM', `Created insurance claim: ${claimNumber}`, req.ip);
    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
});

// Update claim status
router.patch('/claims/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedAmount, rejectionReason } = req.body;

    const updateData = {
      status,
      ...(status === 'APPROVED' && { 
        approvedAmount: parseFloat(approvedAmount),
        approvedDate: new Date()
      }),
      ...(status === 'REJECTED' && { rejectionReason }),
      ...(status === 'SUBMITTED' && { submittedDate: new Date() }),
      ...(status === 'PAID' && { paidDate: new Date() })
    };

    const claim = await prisma.insuranceClaim.update({
      where: { id },
      data: updateData
    });

    await auditLog(req.user.id, 'UPDATE_CLAIM_STATUS', `Updated claim ${claim.claimNumber} status to ${status}`, req.ip);
    res.json(claim);
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: 'Failed to update claim status' });
  }
});

// ============================================================================
// TAX CONFIGURATION
// ============================================================================

// Get tax configurations
router.get('/tax-config', authenticateToken, async (req, res) => {
  try {
    const { active = true } = req.query;
    
    const taxConfigs = await prisma.taxConfiguration.findMany({
      where: {
        ...(active === 'true' && { isActive: true })
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    res.json(taxConfigs);
  } catch (error) {
    console.error('Error fetching tax configurations:', error);
    res.status(500).json({ error: 'Failed to fetch tax configurations' });
  }
});

// Create tax configuration
router.post('/tax-config', authenticateToken, async (req, res) => {
  try {
    const {
      taxType,
      taxName,
      taxRate,
      effectiveFrom,
      effectiveTo,
      isDefault,
      applicableToServices,
      applicableToProducts
    } = req.body;

    // If setting as default, remove default from others of same type
    if (isDefault) {
      await prisma.taxConfiguration.updateMany({
        where: { taxType, isDefault: true },
        data: { isDefault: false }
      });
    }

    const taxConfig = await prisma.taxConfiguration.create({
      data: {
        taxType,
        taxName,
        taxRate: parseFloat(taxRate),
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isDefault: Boolean(isDefault),
        applicableToServices: Boolean(applicableToServices),
        applicableToProducts: Boolean(applicableToProducts)
      }
    });

    await auditLog(req.user.id, 'CREATE_TAX_CONFIG', `Created tax configuration: ${taxName}`, req.ip);
    res.status(201).json(taxConfig);
  } catch (error) {
    console.error('Error creating tax configuration:', error);
    res.status(500).json({ error: 'Failed to create tax configuration' });
  }
});

// Update tax configuration
router.put('/tax-config/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle numeric fields
    if (updateData.taxRate) {
      updateData.taxRate = parseFloat(updateData.taxRate);
    }
    
    // Handle date fields
    if (updateData.effectiveFrom) {
      updateData.effectiveFrom = new Date(updateData.effectiveFrom);
    }
    if (updateData.effectiveTo) {
      updateData.effectiveTo = new Date(updateData.effectiveTo);
    }

    // If setting as default, remove default from others of same type
    if (updateData.isDefault) {
      const currentConfig = await prisma.taxConfiguration.findUnique({ where: { id } });
      if (currentConfig) {
        await prisma.taxConfiguration.updateMany({
          where: { 
            taxType: currentConfig.taxType, 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
    }

    const taxConfig = await prisma.taxConfiguration.update({
      where: { id },
      data: updateData
    });

    await auditLog(req.user.id, 'UPDATE_TAX_CONFIG', `Updated tax configuration: ${taxConfig.taxName}`, req.ip);
    res.json(taxConfig);
  } catch (error) {
    console.error('Error updating tax configuration:', error);
    res.status(500).json({ error: 'Failed to update tax configuration' });
  }
});

// Delete/deactivate tax configuration
router.delete('/tax-config/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting isActive to false
    const taxConfig = await prisma.taxConfiguration.update({
      where: { id },
      data: { isActive: false }
    });

    await auditLog(req.user.id, 'DELETE_TAX_CONFIG', `Deactivated tax configuration: ${taxConfig.taxName}`, req.ip);
    res.json({ success: true, message: 'Tax configuration deactivated successfully' });
  } catch (error) {
    console.error('Error deleting tax configuration:', error);
    res.status(500).json({ error: 'Failed to delete tax configuration' });
  }
});

// ============================================================================
// PAYMENT REMINDERS
// ============================================================================

// Send payment reminder
router.post('/invoices/:id/reminder', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { method = 'EMAIL' } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Cannot send reminder for paid invoice' });
    }

    // Create reminder record
    const reminder = await prisma.paymentReminder.create({
      data: {
        invoiceId: id,
        reminderLevel: 1, // TODO: Calculate based on existing reminders
        dueDate: invoice.dueDate,
        amount: invoice.balanceAmount,
        method,
        status: 'SENT'
      }
    });

    // TODO: Implement actual email/SMS sending logic here
    console.log(`Payment reminder sent for invoice ${invoice.invoiceNumber} via ${method}`);

    await auditLog(req.user.id, 'SEND_PAYMENT_REMINDER', `Sent payment reminder for invoice ${invoice.invoiceNumber}`, req.ip);
    res.json({ success: true, reminder });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({ error: 'Failed to send payment reminder' });
  }
});

// Get payment reminders for invoice
router.get('/invoices/:id/reminders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const reminders = await prisma.paymentReminder.findMany({
      where: { invoiceId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching payment reminders:', error);
    res.status(500).json({ error: 'Failed to fetch payment reminders' });
  }
});

module.exports = router;