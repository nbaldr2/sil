const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class AccountingIntegrationService {
  constructor() {
    this.integrations = {
      quickbooks: new QuickBooksIntegration(),
      xero: new XeroIntegration(),
      odoo: new OdooIntegration(),
      sage: new SageIntegration()
    };
  }

  // ============================================================================
  // MAIN INTEGRATION METHODS
  // ============================================================================

  async syncInvoice(invoiceId, systemType = 'quickbooks') {
    try {
      const invoice = await this.getInvoiceWithDetails(invoiceId);
      const integration = this.integrations[systemType];
      
      if (!integration) {
        throw new Error(`Integration for ${systemType} not found`);
      }

      const result = await integration.createInvoice(invoice);
      
      // Store integration record
      await this.createIntegrationRecord({
        entityType: 'INVOICE',
        entityId: invoiceId,
        externalSystem: systemType.toUpperCase(),
        externalId: result.externalId,
        syncStatus: 'SUCCESS',
        syncData: result
      });

      logger.info(`Invoice ${invoice.invoiceNumber} synced to ${systemType}`, { invoiceId, externalId: result.externalId });
      return result;
    } catch (error) {
      logger.error(`Failed to sync invoice ${invoiceId} to ${systemType}:`, error);
      
      await this.createIntegrationRecord({
        entityType: 'INVOICE',
        entityId: invoiceId,
        externalSystem: systemType.toUpperCase(),
        syncStatus: 'FAILED',
        errorMessage: error.message
      });
      
      throw error;
    }
  }

  async syncPayment(transactionId, systemType = 'quickbooks') {
    try {
      const transaction = await this.getTransactionWithDetails(transactionId);
      const integration = this.integrations[systemType];
      
      if (!integration) {
        throw new Error(`Integration for ${systemType} not found`);
      }

      const result = await integration.createPayment(transaction);
      
      await this.createIntegrationRecord({
        entityType: 'PAYMENT',
        entityId: transactionId,
        externalSystem: systemType.toUpperCase(),
        externalId: result.externalId,
        syncStatus: 'SUCCESS',
        syncData: result
      });

      logger.info(`Payment ${transaction.transactionNumber} synced to ${systemType}`, { transactionId, externalId: result.externalId });
      return result;
    } catch (error) {
      logger.error(`Failed to sync payment ${transactionId} to ${systemType}:`, error);
      
      await this.createIntegrationRecord({
        entityType: 'PAYMENT',
        entityId: transactionId,
        externalSystem: systemType.toUpperCase(),
        syncStatus: 'FAILED',
        errorMessage: error.message
      });
      
      throw error;
    }
  }

  async syncCustomer(customerId, systemType = 'quickbooks') {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const integration = this.integrations[systemType];
      const result = await integration.createCustomer(customer);
      
      await this.createIntegrationRecord({
        entityType: 'CUSTOMER',
        entityId: customerId,
        externalSystem: systemType.toUpperCase(),
        externalId: result.externalId,
        syncStatus: 'SUCCESS',
        syncData: result
      });

      return result;
    } catch (error) {
      logger.error(`Failed to sync customer ${customerId} to ${systemType}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // JOURNAL ENTRY EXPORT
  // ============================================================================

  async exportJournalEntries(startDate, endDate, format = 'csv') {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          paymentDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          status: 'COMPLETED'
        },
        include: {
          invoice: {
            include: {
              customer: true,
              items: {
                include: {
                  analysis: true
                }
              }
            }
          }
        }
      });

      const journalEntries = this.generateJournalEntries(transactions);
      
      if (format === 'csv') {
        return this.exportToCSV(journalEntries);
      } else if (format === 'json') {
        return journalEntries;
      } else if (format === 'xml') {
        return this.exportToXML(journalEntries);
      }
      
      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      logger.error('Failed to export journal entries:', error);
      throw error;
    }
  }

  generateJournalEntries(transactions) {
    const entries = [];
    
    transactions.forEach(transaction => {
      const invoice = transaction.invoice;
      const customer = invoice?.customer;
      
      // Debit entry (Cash/Bank account)
      entries.push({
        date: transaction.paymentDate,
        reference: transaction.transactionNumber,
        description: `Payment from ${customer?.name || 'Customer'} - Invoice ${invoice?.invoiceNumber || 'N/A'}`,
        account: this.getPaymentMethodAccount(transaction.paymentMethod),
        accountName: this.getPaymentMethodAccountName(transaction.paymentMethod),
        debit: transaction.amount,
        credit: 0,
        customerName: customer?.name,
        invoiceNumber: invoice?.invoiceNumber
      });
      
      // Credit entry (Accounts Receivable)
      entries.push({
        date: transaction.paymentDate,
        reference: transaction.transactionNumber,
        description: `Payment from ${customer?.name || 'Customer'} - Invoice ${invoice?.invoiceNumber || 'N/A'}`,
        account: '1200', // Accounts Receivable
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: transaction.amount,
        customerName: customer?.name,
        invoiceNumber: invoice?.invoiceNumber
      });
    });
    
    return entries;
  }

  getPaymentMethodAccount(paymentMethod) {
    const accounts = {
      'CASH': '1100',
      'BANK_TRANSFER': '1010',
      'CHECK': '1020',
      'CREDIT_CARD': '1030',
      'DEBIT_CARD': '1030'
    };
    return accounts[paymentMethod] || '1000';
  }

  getPaymentMethodAccountName(paymentMethod) {
    const names = {
      'CASH': 'Cash',
      'BANK_TRANSFER': 'Bank Account',
      'CHECK': 'Checks Received',
      'CREDIT_CARD': 'Credit Card Clearing',
      'DEBIT_CARD': 'Credit Card Clearing'
    };
    return names[paymentMethod] || 'General Account';
  }

  // ============================================================================
  // EXPORT FORMATS
  // ============================================================================

  exportToCSV(journalEntries) {
    const headers = [
      'Date',
      'Reference',
      'Description',
      'Account',
      'Account Name',
      'Debit',
      'Credit',
      'Customer',
      'Invoice'
    ];
    
    let csv = headers.join(',') + '\n';
    
    journalEntries.forEach(entry => {
      const row = [
        entry.date,
        entry.reference,
        `"${entry.description}"`,
        entry.account,
        `"${entry.accountName}"`,
        entry.debit,
        entry.credit,
        `"${entry.customerName || ''}"`,
        entry.invoiceNumber || ''
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  exportToXML(journalEntries) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<JournalEntries>\n';
    
    journalEntries.forEach(entry => {
      xml += '  <Entry>\n';
      xml += `    <Date>${entry.date}</Date>\n`;
      xml += `    <Reference>${entry.reference}</Reference>\n`;
      xml += `    <Description><![CDATA[${entry.description}]]></Description>\n`;
      xml += `    <Account>${entry.account}</Account>\n`;
      xml += `    <AccountName><![CDATA[${entry.accountName}]]></AccountName>\n`;
      xml += `    <Debit>${entry.debit}</Debit>\n`;
      xml += `    <Credit>${entry.credit}</Credit>\n`;
      xml += `    <Customer><![CDATA[${entry.customerName || ''}]]></Customer>\n`;
      xml += `    <Invoice>${entry.invoiceNumber || ''}</Invoice>\n`;
      xml += '  </Entry>\n';
    });
    
    xml += '</JournalEntries>';
    return xml;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getInvoiceWithDetails(invoiceId) {
    return await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: {
          include: {
            analysis: true
          }
        },
        taxes: true
      }
    });
  }

  async getTransactionWithDetails(transactionId) {
    return await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: true,
        invoice: true
      }
    });
  }

  async createIntegrationRecord(data) {
    return await prisma.accountingIntegration.create({
      data: {
        ...data,
        syncedAt: new Date()
      }
    });
  }

  // ============================================================================
  // BULK SYNC OPERATIONS
  // ============================================================================

  async bulkSyncInvoices(invoiceIds, systemType = 'quickbooks') {
    const results = [];
    
    for (const invoiceId of invoiceIds) {
      try {
        const result = await this.syncInvoice(invoiceId, systemType);
        results.push({ invoiceId, status: 'SUCCESS', result });
      } catch (error) {
        results.push({ invoiceId, status: 'FAILED', error: error.message });
      }
    }
    
    return results;
  }

  async bulkSyncPayments(transactionIds, systemType = 'quickbooks') {
    const results = [];
    
    for (const transactionId of transactionIds) {
      try {
        const result = await this.syncPayment(transactionId, systemType);
        results.push({ transactionId, status: 'SUCCESS', result });
      } catch (error) {
        results.push({ transactionId, status: 'FAILED', error: error.message });
      }
    }
    
    return results;
  }

  // ============================================================================
  // INTEGRATION STATUS
  // ============================================================================

  async getIntegrationStatus(entityType, entityId) {
    return await prisma.accountingIntegration.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: {
        syncedAt: 'desc'
      }
    });
  }

  async getFailedSyncs(systemType, limit = 50) {
    return await prisma.accountingIntegration.findMany({
      where: {
        externalSystem: systemType.toUpperCase(),
        syncStatus: 'FAILED'
      },
      orderBy: {
        syncedAt: 'desc'
      },
      take: limit
    });
  }
}

// ============================================================================
// QUICKBOOKS INTEGRATION
// ============================================================================

class QuickBooksIntegration {
  constructor() {
    this.baseURL = process.env.QUICKBOOKS_API_URL || 'https://sandbox-quickbooks.api.intuit.com';
    this.accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
    this.companyId = process.env.QUICKBOOKS_COMPANY_ID;
  }

  async createInvoice(invoice) {
    const invoiceData = {
      Line: invoice.items.map(item => ({
        Amount: item.lineTotal,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: item.analysis?.id || '1',
            name: item.description
          },
          Qty: item.quantity,
          UnitPrice: item.unitPrice
        }
      })),
      CustomerRef: {
        value: invoice.customer.id,
        name: invoice.customer.name
      },
      TotalAmt: invoice.totalAmount,
      DueDate: invoice.dueDate,
      DocNumber: invoice.invoiceNumber
    };

    const response = await this.makeRequest('POST', '/v3/company/{companyId}/invoice', invoiceData);
    return {
      externalId: response.QueryResponse.Invoice[0].Id,
      externalData: response
    };
  }

  async createPayment(transaction) {
    const paymentData = {
      CustomerRef: {
        value: transaction.customer.id,
        name: transaction.customer.name
      },
      TotalAmt: transaction.amount,
      Line: [{
        Amount: transaction.amount,
        LinkedTxn: [{
          TxnId: transaction.invoice?.id,
          TxnType: 'Invoice'
        }]
      }]
    };

    const response = await this.makeRequest('POST', '/v3/company/{companyId}/payment', paymentData);
    return {
      externalId: response.QueryResponse.Payment[0].Id,
      externalData: response
    };
  }

  async createCustomer(customer) {
    const customerData = {
      Name: customer.name,
      CompanyName: customer.name,
      BillAddr: {
        Line1: customer.address,
        City: customer.city,
        PostalCode: customer.postalCode,
        Country: customer.country
      },
      PrimaryPhone: {
        FreeFormNumber: customer.phone
      },
      PrimaryEmailAddr: {
        Address: customer.email
      }
    };

    const response = await this.makeRequest('POST', '/v3/company/{companyId}/customer', customerData);
    return {
      externalId: response.QueryResponse.Customer[0].Id,
      externalData: response
    };
  }

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint.replace('{companyId}', this.companyId)}`;
    
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }
}

// ============================================================================
// XERO INTEGRATION
// ============================================================================

class XeroIntegration {
  constructor() {
    this.baseURL = process.env.XERO_API_URL || 'https://api.xero.com/api.xro/2.0';
    this.accessToken = process.env.XERO_ACCESS_TOKEN;
    this.tenantId = process.env.XERO_TENANT_ID;
  }

  async createInvoice(invoice) {
    const invoiceData = {
      Type: 'ACCREC',
      Contact: {
        ContactID: invoice.customer.id,
        Name: invoice.customer.name
      },
      Date: invoice.issueDate,
      DueDate: invoice.dueDate,
      InvoiceNumber: invoice.invoiceNumber,
      LineItems: invoice.items.map(item => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.unitPrice,
        LineAmount: item.lineTotal,
        TaxType: 'OUTPUT'
      }))
    };

    const response = await this.makeRequest('POST', '/Invoices', { Invoices: [invoiceData] });
    return {
      externalId: response.Invoices[0].InvoiceID,
      externalData: response
    };
  }

  async createPayment(transaction) {
    const paymentData = {
      Invoice: {
        InvoiceID: transaction.invoice?.id
      },
      Account: {
        Code: '090' // Bank account
      },
      Amount: transaction.amount,
      Date: transaction.paymentDate
    };

    const response = await this.makeRequest('POST', '/Payments', { Payments: [paymentData] });
    return {
      externalId: response.Payments[0].PaymentID,
      externalData: response
    };
  }

  async createCustomer(customer) {
    const contactData = {
      Name: customer.name,
      EmailAddress: customer.email,
      Addresses: [{
        AddressType: 'STREET',
        AddressLine1: customer.address,
        City: customer.city,
        PostalCode: customer.postalCode,
        Country: customer.country
      }],
      Phones: [{
        PhoneType: 'DEFAULT',
        PhoneNumber: customer.phone
      }]
    };

    const response = await this.makeRequest('POST', '/Contacts', { Contacts: [contactData] });
    return {
      externalId: response.Contacts[0].ContactID,
      externalData: response
    };
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Xero-tenant-id': this.tenantId,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }
}

// ============================================================================
// ODOO INTEGRATION
// ============================================================================

class OdooIntegration {
  constructor() {
    this.baseURL = process.env.ODOO_API_URL || 'http://localhost:8069';
    this.database = process.env.ODOO_DATABASE;
    this.username = process.env.ODOO_USERNAME;
    this.password = process.env.ODOO_PASSWORD;
    this.uid = null;
  }

  async authenticate() {
    if (this.uid) return this.uid;

    const response = await axios.post(`${this.baseURL}/xmlrpc/2/common`, {
      service: 'common',
      method: 'authenticate',
      args: [this.database, this.username, this.password, {}]
    });

    this.uid = response.data;
    return this.uid;
  }

  async createInvoice(invoice) {
    await this.authenticate();

    const invoiceData = {
      partner_id: invoice.customer.id,
      invoice_date: invoice.issueDate,
      invoice_date_due: invoice.dueDate,
      name: invoice.invoiceNumber,
      invoice_line_ids: invoice.items.map(item => [0, 0, {
        name: item.description,
        quantity: item.quantity,
        price_unit: item.unitPrice
      }])
    };

    const response = await this.makeRequest('account.move', 'create', [invoiceData]);
    return {
      externalId: response,
      externalData: { id: response }
    };
  }

  async createPayment(transaction) {
    await this.authenticate();

    const paymentData = {
      partner_id: transaction.customer.id,
      amount: transaction.amount,
      payment_date: transaction.paymentDate,
      payment_method_id: 1, // Manual
      journal_id: 1 // Bank journal
    };

    const response = await this.makeRequest('account.payment', 'create', [paymentData]);
    return {
      externalId: response,
      externalData: { id: response }
    };
  }

  async createCustomer(customer) {
    await this.authenticate();

    const customerData = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      street: customer.address,
      city: customer.city,
      zip: customer.postalCode,
      country_id: 1, // Default country
      is_company: customer.type !== 'INDIVIDUAL'
    };

    const response = await this.makeRequest('res.partner', 'create', [customerData]);
    return {
      externalId: response,
      externalData: { id: response }
    };
  }

  async makeRequest(model, method, args) {
    const response = await axios.post(`${this.baseURL}/xmlrpc/2/object`, {
      service: 'object',
      method: 'execute_kw',
      args: [this.database, this.uid, this.password, model, method, args]
    });

    return response.data;
  }
}

// ============================================================================
// SAGE INTEGRATION
// ============================================================================

class SageIntegration {
  constructor() {
    this.baseURL = process.env.SAGE_API_URL || 'https://api.sage.com/v3.1';
    this.accessToken = process.env.SAGE_ACCESS_TOKEN;
  }

  async createInvoice(invoice) {
    const invoiceData = {
      contact_id: invoice.customer.id,
      date: invoice.issueDate,
      due_date: invoice.dueDate,
      reference: invoice.invoiceNumber,
      invoice_lines: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        net_amount: item.lineTotal
      }))
    };

    const response = await this.makeRequest('POST', '/sales_invoices', invoiceData);
    return {
      externalId: response.id,
      externalData: response
    };
  }

  async createPayment(transaction) {
    const paymentData = {
      transaction_type_id: '1', // Receipt
      contact_id: transaction.customer.id,
      bank_account_id: '1',
      date: transaction.paymentDate,
      net_amount: transaction.amount,
      reference: transaction.transactionNumber
    };

    const response = await this.makeRequest('POST', '/bank_receipts', paymentData);
    return {
      externalId: response.id,
      externalData: response
    };
  }

  async createCustomer(customer) {
    const customerData = {
      name: customer.name,
      contact_type_id: '1', // Customer
      email: customer.email,
      telephone: customer.phone,
      address_line_1: customer.address,
      city: customer.city,
      postal_code: customer.postalCode,
      country_id: '1'
    };

    const response = await this.makeRequest('POST', '/contacts', customerData);
    return {
      externalId: response.id,
      externalData: response
    };
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }
}

module.exports = new AccountingIntegrationService();