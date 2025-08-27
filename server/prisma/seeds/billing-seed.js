const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBillingData() {
  console.log('🏥 Seeding billing data...');

  try {
    // Create Tax Configurations for Morocco
    const taxConfigs = await Promise.all([
      prisma.taxConfiguration.upsert({
        where: { id: 'tva-20' },
        update: {},
        create: {
          id: 'tva-20',
          taxType: 'TVA',
          taxName: 'TVA 20%',
          taxRate: 20.0,
          isActive: true,
          isDefault: true,
          applicableToServices: true,
          applicableToProducts: true,
          effectiveFrom: new Date('2024-01-01')
        }
      }),
      prisma.taxConfiguration.upsert({
        where: { id: 'stamp-tax' },
        update: {},
        create: {
          id: 'stamp-tax',
          taxType: 'STAMP_TAX',
          taxName: 'Timbre 0.1%',
          taxRate: 0.1,
          isActive: true,
          isDefault: true,
          applicableToServices: true,
          applicableToProducts: true,
          effectiveFrom: new Date('2024-01-01')
        }
      }),
      prisma.taxConfiguration.upsert({
        where: { id: 'tva-14' },
        update: {},
        create: {
          id: 'tva-14',
          taxType: 'TVA',
          taxName: 'TVA 14%',
          taxRate: 14.0,
          isActive: true,
          isDefault: false,
          applicableToServices: true,
          applicableToProducts: false,
          effectiveFrom: new Date('2024-01-01')
        }
      })
    ]);

    console.log(`✅ Created ${taxConfigs.length} tax configurations`);

    // Create Sample Customers (Insurance Companies)
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { id: 'cnss-morocco' },
        update: {},
        create: {
          id: 'cnss-morocco',
          type: 'INSURANCE',
          name: 'CNSS Maroc',
          email: 'facturation@cnss.ma',
          phone: '+212 5 37 71 96 96',
          address: 'Angle Bd Abdelmoumen et rue Soumaya',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Morocco',
          taxId: 'ICE001234567890123',
          vatNumber: 'MA001234567890123',
          insuranceCode: 'CNSS',
          contractNumber: 'CNSS-2024-001',
          coveragePercentage: 80.0,
          creditLimit: 100000.0,
          paymentTerms: 30,
          isActive: true
        }
      }),
      prisma.customer.upsert({
        where: { id: 'cnops-morocco' },
        update: {},
        create: {
          id: 'cnops-morocco',
          type: 'INSURANCE',
          name: 'CNOPS',
          email: 'remboursement@cnops.ma',
          phone: '+212 5 37 71 30 30',
          address: 'Hay Riad',
          city: 'Rabat',
          postalCode: '10000',
          country: 'Morocco',
          taxId: 'ICE001234567890124',
          vatNumber: 'MA001234567890124',
          insuranceCode: 'CNOPS',
          contractNumber: 'CNOPS-2024-001',
          coveragePercentage: 90.0,
          creditLimit: 150000.0,
          paymentTerms: 45,
          isActive: true
        }
      }),
      prisma.customer.upsert({
        where: { id: 'rma-watanya' },
        update: {},
        create: {
          id: 'rma-watanya',
          type: 'INSURANCE',
          name: 'RMA Watanya',
          email: 'sante@rmaassurance.ma',
          phone: '+212 5 22 48 44 44',
          address: 'Rue Bab El Mansour',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Morocco',
          taxId: 'ICE001234567890125',
          vatNumber: 'MA001234567890125',
          insuranceCode: 'RMA',
          contractNumber: 'RMA-2024-001',
          coveragePercentage: 75.0,
          creditLimit: 75000.0,
          paymentTerms: 30,
          isActive: true
        }
      }),
      prisma.customer.upsert({
        where: { id: 'atlanta-assurance' },
        update: {},
        create: {
          id: 'atlanta-assurance',
          type: 'INSURANCE',
          name: 'Atlanta Assurance',
          email: 'sante@atlanta.ma',
          phone: '+212 5 22 95 20 20',
          address: 'Boulevard Zerktouni',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Morocco',
          taxId: 'ICE001234567890126',
          vatNumber: 'MA001234567890126',
          insuranceCode: 'ATLANTA',
          contractNumber: 'ATL-2024-001',
          coveragePercentage: 70.0,
          creditLimit: 50000.0,
          paymentTerms: 30,
          isActive: true
        }
      }),
      prisma.customer.upsert({
        where: { id: 'individual-patients' },
        update: {},
        create: {
          id: 'individual-patients',
          type: 'INDIVIDUAL',
          name: 'Patients Particuliers',
          email: 'contact@sil-lab.ma',
          phone: '+212 5 22 00 00 00',
          address: 'Laboratoire SIL',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Morocco',
          creditLimit: 5000.0,
          paymentTerms: 0, // Immediate payment
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    // Get existing users for invoice creation
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('⚠️  No users found, skipping invoice creation');
      return;
    }

    const adminUser = users[0];

    // Get existing patients for invoice creation
    const patients = await prisma.patient.findMany({ take: 3 });
    
    // Get existing analyses for invoice items
    const analyses = await prisma.analysis.findMany({ take: 5 });

    if (patients.length > 0 && analyses.length > 0) {
      // Create Sample Invoices
      const invoices = [];
      
      for (let i = 0; i < 5; i++) {
        const customer = customers[i % customers.length];
        const patient = patients[i % patients.length];
        const selectedAnalyses = analyses.slice(0, Math.floor(Math.random() * 3) + 1);
        
        let subtotal = 0;
        const items = selectedAnalyses.map(analysis => {
          const quantity = 1;
          const unitPrice = analysis.price || 100 + Math.random() * 500;
          const lineTotal = quantity * unitPrice;
          subtotal += lineTotal;
          
          return {
            analysisId: analysis.id,
            description: analysis.name,
            quantity,
            unitPrice,
            discount: 0,
            taxRate: 20,
            lineTotal
          };
        });

        const discountAmount = 0;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * 0.20;
        const stampTaxAmount = taxableAmount * 0.001;
        const totalAmount = taxableAmount + taxAmount + stampTaxAmount;
        
        const statuses = ['DRAFT', 'SENT', 'PAID', 'PARTIAL_PAID', 'OVERDUE'];
        const status = statuses[i % statuses.length];
        
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 30));
        
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + customer.paymentTerms);

        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-2024-${String(i + 1).padStart(6, '0')}`,
            type: 'STANDARD',
            status,
            customerId: customer.id,
            customerName: customer.name,
            customerAddress: `${customer.address}, ${customer.city}`,
            customerTaxId: customer.taxId,
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            subtotal,
            discountAmount,
            discountPercent: 0,
            taxAmount,
            stampTaxAmount,
            totalAmount,
            paidAmount: status === 'PAID' ? totalAmount : (status === 'PARTIAL_PAID' ? totalAmount * 0.5 : 0),
            balanceAmount: status === 'PAID' ? 0 : (status === 'PARTIAL_PAID' ? totalAmount * 0.5 : totalAmount),
            currency: 'MAD',
            exchangeRate: 1,
            issueDate,
            dueDate,
            paidDate: status === 'PAID' ? new Date() : null,
            notes: `Facture pour analyses médicales - Patient: ${patient.firstName} ${patient.lastName}`,
            createdById: adminUser.id,
            items: {
              create: items
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
          }
        });

        invoices.push(invoice);

        // Create payment transaction for paid invoices
        if (status === 'PAID' || status === 'PARTIAL_PAID') {
          const paymentAmount = status === 'PAID' ? totalAmount : totalAmount * 0.5;
          const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CHECK'];
          const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          
          await prisma.transaction.create({
            data: {
              transactionNumber: `TXN-2024-${String(i + 1).padStart(6, '0')}`,
              type: 'PAYMENT',
              status: 'COMPLETED',
              amount: paymentAmount,
              currency: 'MAD',
              exchangeRate: 1,
              paymentMethod,
              paymentReference: paymentMethod === 'CHECK' ? `CHK-${Math.floor(Math.random() * 1000000)}` : 
                               paymentMethod === 'BANK_TRANSFER' ? `TRF-${Math.floor(Math.random() * 1000000)}` : null,
              paymentDate: new Date(),
              invoiceId: invoice.id,
              customerId: customer.id,
              description: `Paiement facture ${invoice.invoiceNumber}`,
              processedById: adminUser.id
            }
          });
        }
      }

      console.log(`✅ Created ${invoices.length} sample invoices with transactions`);

      // Create sample insurance claims
      const insuranceInvoices = invoices.filter((_, index) => index < 2);
      for (const invoice of insuranceInvoices) {
        await prisma.insuranceClaim.create({
          data: {
            claimNumber: `CLM-2024-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
            status: 'SUBMITTED',
            customerId: invoice.customerId,
            insuranceCode: customers.find(c => c.id === invoice.customerId)?.insuranceCode || 'CNSS',
            contractNumber: customers.find(c => c.id === invoice.customerId)?.contractNumber,
            invoiceId: invoice.id,
            claimAmount: invoice.totalAmount,
            submittedDate: new Date(),
            createdById: adminUser.id
          }
        });
      }

      console.log(`✅ Created ${insuranceInvoices.length} sample insurance claims`);
    }

    // Create sample financial reports
    const today = new Date();
    const reportTypes = ['DAILY', 'WEEKLY', 'MONTHLY'];
    
    for (const reportType of reportTypes) {
      let periodStart, periodEnd;
      
      switch (reportType) {
        case 'DAILY':
          periodStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          periodEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          break;
        case 'WEEKLY':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          periodStart = weekStart;
          periodEnd = new Date(weekStart);
          periodEnd.setDate(weekStart.getDate() + 7);
          break;
        case 'MONTHLY':
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
          periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          break;
      }

      await prisma.financialReport.upsert({
        where: {
          reportType_reportDate: {
            reportType,
            reportDate: today
          }
        },
        update: {},
        create: {
          reportType,
          reportDate: today,
          periodStart,
          periodEnd,
          totalRevenue: 15000 + Math.random() * 10000,
          totalPaid: 12000 + Math.random() * 8000,
          totalOutstanding: 2000 + Math.random() * 3000,
          totalOverdue: 500 + Math.random() * 1500,
          reportData: {
            customerBreakdown: {
              CNSS: { revenue: 8000, paid: 6500, outstanding: 1500 },
              CNOPS: { revenue: 5000, paid: 4000, outstanding: 1000 },
              RMA: { revenue: 2000, paid: 1500, outstanding: 500 }
            },
            analysisBreakdown: {
              'Hematology': { count: 45, revenue: 6750 },
              'Biochemistry': { count: 38, revenue: 5700 },
              'Microbiology': { count: 22, revenue: 3300 }
            }
          }
        }
      });
    }

    console.log(`✅ Created financial reports for ${reportTypes.length} periods`);

    console.log('🎉 Billing data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding billing data:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedBillingData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedBillingData };