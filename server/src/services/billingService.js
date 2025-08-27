const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const { auditLog } = require('./auditService');

const prisma = new PrismaClient();

class BillingService {
  constructor() {
    this.initializeScheduledTasks();
  }

  // ============================================================================
  // INVOICE GENERATION
  // ============================================================================

  async generateInvoiceFromRequest(requestId, userId) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          patient: true,
          requestAnalyses: {
            include: {
              analysis: true
            }
          }
        }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { requestId }
      });

      if (existingInvoice) {
        throw new Error('Invoice already exists for this request');
      }

      // Create or get customer (patient as individual customer)
      let customer = await prisma.customer.findFirst({
        where: {
          type: 'INDIVIDUAL',
          name: `${request.patient.firstName} ${request.patient.lastName}`
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            type: 'INDIVIDUAL',
            name: `${request.patient.firstName} ${request.patient.lastName}`,
            email: request.patient.email,
            phone: request.patient.phone,
            address: request.patient.address
          }
        });
      }

      // Prepare invoice items
      const items = request.requestAnalyses.map(ra => ({
        analysisId: ra.analysisId,
        description: ra.analysis.name,
        quantity: 1,
        unitPrice: ra.price || ra.analysis.price,
        discount: 0,
        taxRate: ra.analysis.tva || 20,
        lineTotal: ra.price || ra.analysis.price
      }));

      // Create invoice
      const invoiceData = {
        customerId: customer.id,
        requestId,
        patientId: request.patientId,
        type: 'STANDARD',
        items,
        notes: `Generated from request ${request.id}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      return await this.createInvoice(invoiceData, userId);
    } catch (error) {
      console.error('Error generating invoice from request:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData, userId) {
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
      } = invoiceData;

      // Get customer info
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
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
      const calculations = this.calculateInvoiceTotals(items, discountPercent);

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
          ...calculations,
          dueDate: new Date(dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes,
          createdById: userId,
          items: {
            create: calculations.processedItems
          },
          taxes: {
            create: calculations.taxes
          }
        },
        include: {
          items: true,
          taxes: true,
          customer: true
        }
      });

      await auditLog(userId, 'CREATE_INVOICE', `Created invoice: ${invoiceNumber}`, null);
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  calculateInvoiceTotals(items, discountPercent = 0) {
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
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

    const taxes = [
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
    ];

    return {
      subtotal,
      discountAmount,
      discountPercent,
      taxAmount,
      stampTaxAmount,
      totalAmount,
      balanceAmount: totalAmount,
      processedItems,
      taxes
    };
  }

  // ============================================================================
  // PAYMENT PROCESSING
  // ============================================================================

  async processPayment(paymentData, userId) {
    try {
      const {
        invoiceId,
        customerId,
        amount,
        paymentMethod,
        paymentReference,
        description,
        notes
      } = paymentData;

      // Generate transaction number
      const transactionCount = await prisma.transaction.count();
      const transactionNumber = `TXN-${new Date().getFullYear()}-${String(transactionCount + 1).padStart(6, '0')}`;

      const result = await prisma.$transaction(async (prisma) => {
        // Create transaction
        const transaction = await prisma.transaction.create({
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
            processedById: userId
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

        return transaction;
      });

      await auditLog(userId, 'PROCESS_PAYMENT', `Processed payment: ${transactionNumber} - ${amount} MAD`, null);
      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // ============================================================================
  // RECURRING INVOICES
  // ============================================================================

  async createRecurringInvoice(invoiceId, recurrenceData, userId) {
    try {
      const { recurrenceType, recurrenceEnd } = recurrenceData;

      const parentInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          items: true,
          taxes: true
        }
      });

      if (!parentInvoice) {
        throw new Error('Parent invoice not found');
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          recurrenceType,
          recurrenceEnd: new Date(recurrenceEnd)
        }
      });

      await auditLog(userId, 'CREATE_RECURRING_INVOICE', `Set up recurring invoice: ${parentInvoice.invoiceNumber}`, null);
      return { success: true };
    } catch (error) {
      console.error('Error creating recurring invoice:', error);
      throw error;
    }
  }

  async generateRecurringInvoices() {
    try {
      const recurringInvoices = await prisma.invoice.findMany({
        where: {
          recurrenceType: { not: 'NONE' },
          recurrenceEnd: { gte: new Date() },
          status: { not: 'CANCELLED' }
        },
        include: {
          items: true,
          taxes: true,
          customer: true
        }
      });

      const results = [];

      for (const invoice of recurringInvoices) {
        const shouldGenerate = this.shouldGenerateRecurringInvoice(invoice);
        
        if (shouldGenerate) {
          try {
            const newInvoice = await this.duplicateInvoice(invoice);
            results.push({ success: true, invoice: newInvoice });
          } catch (error) {
            results.push({ success: false, error: error.message, invoiceId: invoice.id });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error generating recurring invoices:', error);
      throw error;
    }
  }

  shouldGenerateRecurringInvoice(invoice) {
    const now = new Date();
    const lastGenerated = invoice.updatedAt;
    
    switch (invoice.recurrenceType) {
      case 'DAILY':
        return (now - lastGenerated) >= 24 * 60 * 60 * 1000;
      case 'WEEKLY':
        return (now - lastGenerated) >= 7 * 24 * 60 * 60 * 1000;
      case 'MONTHLY':
        return now.getMonth() !== lastGenerated.getMonth() || now.getFullYear() !== lastGenerated.getFullYear();
      case 'QUARTERLY':
        return Math.floor(now.getMonth() / 3) !== Math.floor(lastGenerated.getMonth() / 3) || now.getFullYear() !== lastGenerated.getFullYear();
      case 'YEARLY':
        return now.getFullYear() !== lastGenerated.getFullYear();
      default:
        return false;
    }
  }

  async duplicateInvoice(originalInvoice) {
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type: originalInvoice.type,
        customerId: originalInvoice.customerId,
        customerName: originalInvoice.customerName,
        customerAddress: originalInvoice.customerAddress,
        customerTaxId: originalInvoice.customerTaxId,
        subtotal: originalInvoice.subtotal,
        discountAmount: originalInvoice.discountAmount,
        discountPercent: originalInvoice.discountPercent,
        taxAmount: originalInvoice.taxAmount,
        stampTaxAmount: originalInvoice.stampTaxAmount,
        totalAmount: originalInvoice.totalAmount,
        balanceAmount: originalInvoice.totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: `Recurring invoice from ${originalInvoice.invoiceNumber}`,
        parentInvoiceId: originalInvoice.id,
        createdById: originalInvoice.createdById,
        items: {
          create: originalInvoice.items.map(item => ({
            analysisId: item.analysisId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            lineTotal: item.lineTotal
          }))
        },
        taxes: {
          create: originalInvoice.taxes.map(tax => ({
            taxType: tax.taxType,
            taxName: tax.taxName,
            taxRate: tax.taxRate,
            taxableAmount: tax.taxableAmount,
            taxAmount: tax.taxAmount
          }))
        }
      }
    });

    return newInvoice;
  }

  // ============================================================================
  // PAYMENT REMINDERS
  // ============================================================================

  async sendPaymentReminders() {
    try {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: { in: ['SENT', 'PARTIAL_PAID'] },
          dueDate: { lt: new Date() },
          balanceAmount: { gt: 0 }
        },
        include: {
          customer: true,
          reminders: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      const results = [];

      for (const invoice of overdueInvoices) {
        const daysPastDue = Math.floor((new Date() - invoice.dueDate) / (1000 * 60 * 60 * 24));
        const lastReminder = invoice.reminders[0];
        
        let reminderLevel = 1;
        if (lastReminder) {
          const daysSinceLastReminder = Math.floor((new Date() - lastReminder.createdAt) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastReminder < 7) {
            continue; // Don't send reminder if last one was sent less than 7 days ago
          }
          
          reminderLevel = Math.min(lastReminder.reminderLevel + 1, 3);
        }

        try {
          const reminder = await this.createPaymentReminder(invoice, reminderLevel);
          results.push({ success: true, reminder });
        } catch (error) {
          results.push({ success: false, error: error.message, invoiceId: invoice.id });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      throw error;
    }
  }

  async createPaymentReminder(invoice, reminderLevel) {
    const reminder = await prisma.paymentReminder.create({
      data: {
        invoiceId: invoice.id,
        reminderLevel,
        dueDate: invoice.dueDate,
        amount: invoice.balanceAmount,
        method: 'EMAIL', // Default to email
        status: 'SENT'
      }
    });

    // TODO: Implement actual email/SMS sending
    console.log(`Payment reminder sent for invoice ${invoice.invoiceNumber} (Level ${reminderLevel})`);

    return reminder;
  }

  // ============================================================================
  // FINANCIAL ANALYTICS
  // ============================================================================

  async generateFinancialMetrics(period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);

      const [
        totalRevenue,
        totalPaid,
        totalOutstanding,
        totalOverdue,
        invoiceCount,
        averageInvoiceValue,
        collectionRate
      ] = await Promise.all([
        // Total revenue
        prisma.invoice.aggregate({
          where: { issueDate: dateFilter },
          _sum: { totalAmount: true }
        }),
        
        // Total paid
        prisma.invoice.aggregate({
          where: { 
            issueDate: dateFilter,
            status: 'PAID'
          },
          _sum: { totalAmount: true }
        }),
        
        // Total outstanding
        prisma.invoice.aggregate({
          where: { 
            status: { in: ['SENT', 'PARTIAL_PAID'] },
            balanceAmount: { gt: 0 }
          },
          _sum: { balanceAmount: true }
        }),
        
        // Total overdue
        prisma.invoice.aggregate({
          where: {
            status: { in: ['SENT', 'PARTIAL_PAID'] },
            dueDate: { lt: new Date() },
            balanceAmount: { gt: 0 }
          },
          _sum: { balanceAmount: true }
        }),
        
        // Invoice count
        prisma.invoice.count({
          where: { issueDate: dateFilter }
        }),
        
        // Average invoice value
        prisma.invoice.aggregate({
          where: { issueDate: dateFilter },
          _avg: { totalAmount: true }
        }),
        
        // Collection rate calculation
        this.calculateCollectionRate(dateFilter)
      ]);

      return {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalPaid: totalPaid._sum.totalAmount || 0,
        totalOutstanding: totalOutstanding._sum.balanceAmount || 0,
        totalOverdue: totalOverdue._sum.balanceAmount || 0,
        invoiceCount,
        averageInvoiceValue: averageInvoiceValue._avg.totalAmount || 0,
        collectionRate
      };
    } catch (error) {
      console.error('Error generating financial metrics:', error);
      throw error;
    }
  }

  async calculateCollectionRate(dateFilter) {
    const invoices = await prisma.invoice.findMany({
      where: { issueDate: dateFilter },
      select: { totalAmount: true, paidAmount: true }
    });

    if (invoices.length === 0) return 0;

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    return totalBilled > 0 ? (totalCollected / totalBilled * 100) : 0;
  }

  getDateFilter(period) {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        };
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return {
          gte: weekStart,
          lt: new Date()
        };
      case 'month':
        return {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        };
      case 'year':
        return {
          gte: new Date(now.getFullYear(), 0, 1),
          lt: new Date(now.getFullYear() + 1, 0, 1)
        };
      default:
        return {};
    }
  }

  // ============================================================================
  // SCHEDULED TASKS
  // ============================================================================

  initializeScheduledTasks() {
    // Generate recurring invoices daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running recurring invoice generation...');
      try {
        await this.generateRecurringInvoices();
      } catch (error) {
        console.error('Error in recurring invoice generation:', error);
      }
    });

    // Send payment reminders daily at 10 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Sending payment reminders...');
      try {
        await this.sendPaymentReminders();
      } catch (error) {
        console.error('Error sending payment reminders:', error);
      }
    });

    // Update overdue invoices daily at 11 PM
    cron.schedule('0 23 * * *', async () => {
      console.log('Updating overdue invoice statuses...');
      try {
        await this.updateOverdueInvoices();
      } catch (error) {
        console.error('Error updating overdue invoices:', error);
      }
    });
  }

  async updateOverdueInvoices() {
    try {
      const result = await prisma.invoice.updateMany({
        where: {
          status: { in: ['SENT', 'PARTIAL_PAID'] },
          dueDate: { lt: new Date() },
          balanceAmount: { gt: 0 }
        },
        data: {
          status: 'OVERDUE'
        }
      });

      console.log(`Updated ${result.count} invoices to overdue status`);
      return result;
    } catch (error) {
      console.error('Error updating overdue invoices:', error);
      throw error;
    }
  }
}

module.exports = new BillingService();