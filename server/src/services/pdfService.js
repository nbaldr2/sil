const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor() {
    this.companyInfo = {
      name: 'SIL Laboratory',
      address: 'Casablanca, Morocco',
      phone: '+212 5 22 00 00 00',
      email: 'contact@sil-lab.ma',
      website: 'www.sil-lab.ma',
      taxId: 'ICE000123456789012',
      logo: null // Path to logo file if available
    };
  }

  async generateInvoicePDF(invoice, outputPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          info: {
            Title: `Invoice ${invoice.invoiceNumber}`,
            Author: this.companyInfo.name,
            Subject: `Invoice for ${invoice.customerName}`,
            Keywords: 'invoice, billing, laboratory'
          }
        });

        // If no output path provided, return buffer
        let buffers = [];
        if (!outputPath) {
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
          });
        } else {
          doc.pipe(fs.createWriteStream(outputPath));
          doc.on('end', () => resolve(outputPath));
        }

        // Generate PDF content
        this.generateInvoiceContent(doc, invoice);
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  generateInvoiceContent(doc, invoice) {
    // Header
    this.generateHeader(doc, invoice);
    
    // Invoice details
    this.generateInvoiceDetails(doc, invoice);
    
    // Customer information
    this.generateCustomerInfo(doc, invoice);
    
    // Invoice items table
    this.generateItemsTable(doc, invoice);
    
    // Tax breakdown
    this.generateTaxBreakdown(doc, invoice);
    
    // Totals
    this.generateTotals(doc, invoice);
    
    // Payment information
    this.generatePaymentInfo(doc, invoice);
    
    // Footer
    this.generateFooter(doc, invoice);
  }

  generateHeader(doc, invoice) {
    const startY = 50;
    
    // Company logo (if available)
    if (this.companyInfo.logo && fs.existsSync(this.companyInfo.logo)) {
      doc.image(this.companyInfo.logo, 50, startY, { width: 100 });
    }

    // Company information
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(this.companyInfo.name, 200, startY)
       .fontSize(10)
       .font('Helvetica')
       .text(this.companyInfo.address, 200, startY + 25)
       .text(`Tél: ${this.companyInfo.phone}`, 200, startY + 40)
       .text(`Email: ${this.companyInfo.email}`, 200, startY + 55)
       .text(`ICE: ${this.companyInfo.taxId}`, 200, startY + 70);

    // Invoice title and type
    const invoiceTypeText = this.getInvoiceTypeText(invoice.type);
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(invoiceTypeText, 400, startY, { align: 'right' })
       .fillColor('black')
       .fontSize(12)
       .font('Helvetica')
       .text(`N° ${invoice.invoiceNumber}`, 400, startY + 30, { align: 'right' });

    // Status badge
    const statusColor = this.getStatusColor(invoice.status);
    doc.rect(450, startY + 50, 100, 20)
       .fillAndStroke(statusColor, statusColor)
       .fillColor('white')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(this.getStatusText(invoice.status), 455, startY + 55)
       .fillColor('black');

    return startY + 120;
  }

  generateInvoiceDetails(doc, invoice) {
    const startY = 170;
    
    // Invoice dates and details
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Détails de la facture:', 50, startY)
       .font('Helvetica')
       .text(`Date d'émission: ${this.formatDate(invoice.issueDate)}`, 50, startY + 20)
       .text(`Date d'échéance: ${this.formatDate(invoice.dueDate)}`, 50, startY + 40);

    if (invoice.paidDate) {
      doc.text(`Date de paiement: ${this.formatDate(invoice.paidDate)}`, 50, startY + 60);
    }

    // Patient information (if applicable)
    if (invoice.patientName) {
      doc.font('Helvetica-Bold')
         .text('Patient:', 300, startY)
         .font('Helvetica')
         .text(invoice.patientName, 300, startY + 20);
    }

    return startY + 100;
  }

  generateCustomerInfo(doc, invoice) {
    const startY = 290;
    
    // Customer information box
    doc.rect(50, startY, 250, 100)
       .stroke('#cccccc');

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Facturé à:', 60, startY + 10)
       .font('Helvetica')
       .text(invoice.customerName, 60, startY + 30);

    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, 60, startY + 50, { width: 230 });
    }

    if (invoice.customerTaxId) {
      doc.text(`ICE: ${invoice.customerTaxId}`, 60, startY + 80);
    }

    // Payment terms box
    doc.rect(320, startY, 230, 100)
       .stroke('#cccccc');

    doc.font('Helvetica-Bold')
       .text('Conditions de paiement:', 330, startY + 10)
       .font('Helvetica')
       .text(`Devise: ${invoice.currency}`, 330, startY + 30)
       .text(`Échéance: ${this.formatDate(invoice.dueDate)}`, 330, startY + 50);

    if (invoice.balanceAmount > 0) {
      doc.fillColor('#dc2626')
         .text(`Solde dû: ${this.formatCurrency(invoice.balanceAmount)}`, 330, startY + 70)
         .fillColor('black');
    } else {
      doc.fillColor('#16a34a')
         .text('Facture payée', 330, startY + 70)
         .fillColor('black');
    }

    return startY + 120;
  }

  generateItemsTable(doc, invoice) {
    const startY = 430;
    const tableTop = startY;
    const itemCodeX = 50;
    const descriptionX = 120;
    const quantityX = 350;
    const priceX = 400;
    const discountX = 460;
    const totalX = 520;

    // Table header
    doc.rect(50, tableTop, 500, 25)
       .fillAndStroke('#f3f4f6', '#cccccc');

    doc.fillColor('black')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Code', itemCodeX + 5, tableTop + 8)
       .text('Description', descriptionX + 5, tableTop + 8)
       .text('Qté', quantityX + 5, tableTop + 8)
       .text('Prix Unit.', priceX + 5, tableTop + 8)
       .text('Remise', discountX + 5, tableTop + 8)
       .text('Total', totalX + 5, tableTop + 8);

    // Table rows
    let currentY = tableTop + 25;
    doc.font('Helvetica');

    invoice.items.forEach((item, index) => {
      const rowHeight = 25;
      
      // Alternate row colors
      if (index % 2 === 1) {
        doc.rect(50, currentY, 500, rowHeight)
           .fillAndStroke('#f9fafb', '#f9fafb');
      }

      doc.fillColor('black')
         .fontSize(9)
         .text(item.analysis?.code || '-', itemCodeX + 5, currentY + 8, { width: 60 })
         .text(item.description, descriptionX + 5, currentY + 8, { width: 220 })
         .text(item.quantity.toString(), quantityX + 5, currentY + 8)
         .text(this.formatCurrency(item.unitPrice), priceX + 5, currentY + 8)
         .text(item.discount > 0 ? `${item.discount}%` : '-', discountX + 5, currentY + 8)
         .text(this.formatCurrency(item.lineTotal), totalX + 5, currentY + 8);

      currentY += rowHeight;
    });

    // Table border
    doc.rect(50, tableTop, 500, currentY - tableTop)
       .stroke('#cccccc');

    return currentY + 20;
  }

  generateTaxBreakdown(doc, invoice) {
    if (!invoice.taxes || invoice.taxes.length === 0) {
      return doc.y;
    }

    const startY = doc.y;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Détail des taxes:', 50, startY);

    let currentY = startY + 20;
    doc.fontSize(10)
       .font('Helvetica');

    invoice.taxes.forEach(tax => {
      doc.text(`${tax.taxName} (${tax.taxRate}%):`, 60, currentY)
         .text(`Base: ${this.formatCurrency(tax.taxableAmount)}`, 200, currentY)
         .text(`Montant: ${this.formatCurrency(tax.taxAmount)}`, 350, currentY);
      currentY += 15;
    });

    return currentY + 10;
  }

  generateTotals(doc, invoice) {
    const startY = doc.y;
    const rightAlign = 400;

    // Totals box
    doc.rect(rightAlign, startY, 150, 120)
       .stroke('#cccccc');

    doc.fontSize(11)
       .font('Helvetica')
       .text('Sous-total:', rightAlign + 10, startY + 10)
       .text(this.formatCurrency(invoice.subtotal), rightAlign + 80, startY + 10, { align: 'right', width: 60 });

    if (invoice.discountAmount > 0) {
      doc.text(`Remise (${invoice.discountPercent}%):`, rightAlign + 10, startY + 30)
         .text(`-${this.formatCurrency(invoice.discountAmount)}`, rightAlign + 80, startY + 30, { align: 'right', width: 60 });
    }

    doc.text('TVA:', rightAlign + 10, startY + 50)
       .text(this.formatCurrency(invoice.taxAmount), rightAlign + 80, startY + 50, { align: 'right', width: 60 });

    if (invoice.stampTaxAmount > 0) {
      doc.text('Timbre:', rightAlign + 10, startY + 70)
         .text(this.formatCurrency(invoice.stampTaxAmount), rightAlign + 80, startY + 70, { align: 'right', width: 60 });
    }

    // Total line
    doc.rect(rightAlign + 10, startY + 85, 130, 1)
       .fillAndStroke('black', 'black');

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('TOTAL:', rightAlign + 10, startY + 95)
       .text(this.formatCurrency(invoice.totalAmount), rightAlign + 80, startY + 95, { align: 'right', width: 60 });

    return startY + 140;
  }

  generatePaymentInfo(doc, invoice) {
    const startY = doc.y;

    if (invoice.transactions && invoice.transactions.length > 0) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Historique des paiements:', 50, startY);

      let currentY = startY + 20;
      doc.fontSize(10)
         .font('Helvetica');

      invoice.transactions.forEach(transaction => {
        if (transaction.status === 'COMPLETED') {
          doc.text(`${this.formatDate(transaction.paymentDate)}:`, 60, currentY)
             .text(`${this.formatCurrency(transaction.amount)} (${this.getPaymentMethodText(transaction.paymentMethod)})`, 150, currentY);
          
          if (transaction.paymentReference) {
            doc.text(`Réf: ${transaction.paymentReference}`, 350, currentY);
          }
          
          currentY += 15;
        }
      });

      return currentY + 20;
    }

    return startY;
  }

  generateFooter(doc, invoice) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;

    // Terms and conditions
    if (invoice.terms) {
      doc.fontSize(8)
         .font('Helvetica')
         .text('Conditions:', 50, footerY - 40)
         .text(invoice.terms, 50, footerY - 25, { width: 500 });
    }

    // Footer line
    doc.rect(50, footerY, 500, 1)
       .fillAndStroke('#cccccc', '#cccccc');

    // Footer text
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`${this.companyInfo.name} - ${this.companyInfo.address}`, 50, footerY + 10)
       .text(`Tél: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`, 50, footerY + 25)
       .text(`ICE: ${this.companyInfo.taxId}`, 50, footerY + 40)
       .fillColor('black');

    // Page number
    doc.text(`Page 1`, 500, footerY + 40, { align: 'right' });
  }

  // Helper methods
  getInvoiceTypeText(type) {
    const types = {
      'STANDARD': 'FACTURE',
      'PROFORMA': 'FACTURE PROFORMA',
      'CREDIT_NOTE': 'AVOIR',
      'DEBIT_NOTE': 'NOTE DE DÉBIT',
      'RECEIPT': 'REÇU'
    };
    return types[type] || 'FACTURE';
  }

  getStatusText(status) {
    const statuses = {
      'DRAFT': 'BROUILLON',
      'SENT': 'ENVOYÉE',
      'PAID': 'PAYÉE',
      'PARTIAL_PAID': 'PARTIELLEMENT PAYÉE',
      'OVERDUE': 'EN RETARD',
      'CANCELLED': 'ANNULÉE',
      'REFUNDED': 'REMBOURSÉE'
    };
    return statuses[status] || status;
  }

  getStatusColor(status) {
    const colors = {
      'DRAFT': '#6b7280',
      'SENT': '#3b82f6',
      'PAID': '#10b981',
      'PARTIAL_PAID': '#f59e0b',
      'OVERDUE': '#ef4444',
      'CANCELLED': '#6b7280',
      'REFUNDED': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  getPaymentMethodText(method) {
    const methods = {
      'CASH': 'Espèces',
      'BANK_TRANSFER': 'Virement',
      'CHECK': 'Chèque',
      'CREDIT_CARD': 'Carte de crédit',
      'DEBIT_CARD': 'Carte de débit',
      'INSURANCE_DIRECT': 'Assurance directe'
    };
    return methods[method] || method;
  }

  formatCurrency(amount, currency = 'MAD') {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Generate payment receipt
  async generatePaymentReceiptPDF(transaction, outputPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          info: {
            Title: `Receipt ${transaction.transactionNumber}`,
            Author: this.companyInfo.name,
            Subject: `Payment Receipt`,
            Keywords: 'receipt, payment, laboratory'
          }
        });

        // If no output path provided, return buffer
        let buffers = [];
        if (!outputPath) {
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
          });
        } else {
          doc.pipe(fs.createWriteStream(outputPath));
          doc.on('end', () => resolve(outputPath));
        }

        // Generate receipt content
        this.generateReceiptContent(doc, transaction);
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  generateReceiptContent(doc, transaction) {
    // Header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(this.companyInfo.name, 50, 50)
       .fontSize(24)
       .fillColor('#10b981')
       .text('REÇU DE PAIEMENT', 300, 50, { align: 'right' })
       .fillColor('black');

    // Receipt details
    const startY = 120;
    doc.fontSize(12)
       .font('Helvetica')
       .text(`N° de reçu: ${transaction.transactionNumber}`, 50, startY)
       .text(`Date: ${this.formatDate(transaction.paymentDate)}`, 50, startY + 20)
       .text(`Montant: ${this.formatCurrency(transaction.amount)}`, 50, startY + 40)
       .text(`Mode de paiement: ${this.getPaymentMethodText(transaction.paymentMethod)}`, 50, startY + 60);

    if (transaction.paymentReference) {
      doc.text(`Référence: ${transaction.paymentReference}`, 50, startY + 80);
    }

    // Customer info
    if (transaction.customer) {
      doc.text(`Reçu de: ${transaction.customer.name}`, 50, startY + 120);
    }

    // Invoice info
    if (transaction.invoice) {
      doc.text(`Pour facture: ${transaction.invoice.invoiceNumber}`, 50, startY + 140);
    }

    // Signature area
    doc.rect(50, startY + 200, 200, 80)
       .stroke('#cccccc');
    
    doc.text('Signature:', 60, startY + 210);

    // Footer
    doc.fontSize(8)
       .text(`${this.companyInfo.name} - ${this.companyInfo.address}`, 50, 700)
       .text(`ICE: ${this.companyInfo.taxId}`, 50, 715);
  }
}

module.exports = new PDFService();