const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class MultiCurrencyService {
  constructor() {
    this.baseCurrency = process.env.BASE_CURRENCY || 'MAD';
    this.exchangeRateProvider = process.env.EXCHANGE_RATE_PROVIDER || 'fixer'; // fixer, openexchangerates, currencylayer
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY;
    this.cacheTimeout = 3600000; // 1 hour in milliseconds
    this.exchangeRateCache = new Map();
  }

  // ============================================================================
  // EXCHANGE RATE MANAGEMENT
  // ============================================================================

  async getExchangeRate(fromCurrency, toCurrency, date = null) {
    try {
      // If same currency, return 1
      if (fromCurrency === toCurrency) {
        return 1;
      }

      const cacheKey = `${fromCurrency}_${toCurrency}_${date || 'latest'}`;
      
      // Check cache first
      if (this.exchangeRateCache.has(cacheKey)) {
        const cached = this.exchangeRateCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.rate;
        }
      }

      // Fetch from database first
      const dbRate = await this.getExchangeRateFromDB(fromCurrency, toCurrency, date);
      if (dbRate) {
        this.exchangeRateCache.set(cacheKey, {
          rate: dbRate.rate,
          timestamp: Date.now()
        });
        return dbRate.rate;
      }

      // Fetch from external API
      const apiRate = await this.fetchExchangeRateFromAPI(fromCurrency, toCurrency, date);
      
      // Store in database
      await this.storeExchangeRate(fromCurrency, toCurrency, apiRate, date);
      
      // Cache the result
      this.exchangeRateCache.set(cacheKey, {
        rate: apiRate,
        timestamp: Date.now()
      });

      return apiRate;
    } catch (error) {
      logger.error(`Failed to get exchange rate ${fromCurrency} to ${toCurrency}:`, error);
      
      // Fallback to last known rate
      const fallbackRate = await this.getLastKnownRate(fromCurrency, toCurrency);
      if (fallbackRate) {
        logger.warn(`Using fallback exchange rate for ${fromCurrency} to ${toCurrency}: ${fallbackRate}`);
        return fallbackRate;
      }
      
      throw new Error(`Unable to get exchange rate for ${fromCurrency} to ${toCurrency}`);
    }
  }

  async fetchExchangeRateFromAPI(fromCurrency, toCurrency, date = null) {
    switch (this.exchangeRateProvider) {
      case 'fixer':
        return await this.fetchFromFixer(fromCurrency, toCurrency, date);
      case 'openexchangerates':
        return await this.fetchFromOpenExchangeRates(fromCurrency, toCurrency, date);
      case 'currencylayer':
        return await this.fetchFromCurrencyLayer(fromCurrency, toCurrency, date);
      default:
        throw new Error(`Unsupported exchange rate provider: ${this.exchangeRateProvider}`);
    }
  }

  async fetchFromFixer(fromCurrency, toCurrency, date = null) {
    const endpoint = date ? `/${date}` : '/latest';
    const url = `https://api.fixer.io/v1${endpoint}`;
    
    const response = await axios.get(url, {
      params: {
        access_key: this.apiKey,
        base: fromCurrency,
        symbols: toCurrency
      }
    });

    if (!response.data.success) {
      throw new Error(`Fixer API error: ${response.data.error?.info || 'Unknown error'}`);
    }

    return response.data.rates[toCurrency];
  }

  async fetchFromOpenExchangeRates(fromCurrency, toCurrency, date = null) {
    const endpoint = date ? `/historical/${date}.json` : '/latest.json';
    const url = `https://openexchangerates.org/api${endpoint}`;
    
    const response = await axios.get(url, {
      params: {
        app_id: this.apiKey,
        base: fromCurrency,
        symbols: toCurrency
      }
    });

    return response.data.rates[toCurrency];
  }

  async fetchFromCurrencyLayer(fromCurrency, toCurrency, date = null) {
    const endpoint = date ? '/historical' : '/live';
    const url = `http://api.currencylayer.com${endpoint}`;
    
    const params = {
      access_key: this.apiKey,
      currencies: toCurrency,
      source: fromCurrency
    };

    if (date) {
      params.date = date;
    }

    const response = await axios.get(url, { params });

    if (!response.data.success) {
      throw new Error(`CurrencyLayer API error: ${response.data.error?.info || 'Unknown error'}`);
    }

    const rateKey = `${fromCurrency}${toCurrency}`;
    return response.data.quotes[rateKey];
  }

  async getExchangeRateFromDB(fromCurrency, toCurrency, date = null) {
    const whereClause = {
      fromCurrency,
      toCurrency
    };

    if (date) {
      whereClause.date = new Date(date);
    } else {
      // Get the most recent rate
      const rate = await prisma.exchangeRate.findFirst({
        where: whereClause,
        orderBy: { date: 'desc' }
      });
      return rate;
    }

    return await prisma.exchangeRate.findFirst({
      where: whereClause
    });
  }

  async storeExchangeRate(fromCurrency, toCurrency, rate, date = null) {
    const rateDate = date ? new Date(date) : new Date();
    
    return await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_date: {
          fromCurrency,
          toCurrency,
          date: rateDate
        }
      },
      update: {
        rate,
        updatedAt: new Date()
      },
      create: {
        fromCurrency,
        toCurrency,
        rate,
        date: rateDate
      }
    });
  }

  async getLastKnownRate(fromCurrency, toCurrency) {
    const rate = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency,
        toCurrency
      },
      orderBy: { date: 'desc' }
    });

    return rate?.rate;
  }

  // ============================================================================
  // CURRENCY CONVERSION
  // ============================================================================

  async convertAmount(amount, fromCurrency, toCurrency, date = null) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, date);
    return amount * exchangeRate;
  }

  async convertInvoiceAmounts(invoice, targetCurrency) {
    if (invoice.currency === targetCurrency) {
      return invoice;
    }

    const exchangeRate = await this.getExchangeRate(invoice.currency, targetCurrency, invoice.issueDate);
    
    return {
      ...invoice,
      originalCurrency: invoice.currency,
      originalExchangeRate: invoice.exchangeRate,
      currency: targetCurrency,
      exchangeRate,
      subtotal: invoice.subtotal * exchangeRate,
      discountAmount: invoice.discountAmount * exchangeRate,
      taxAmount: invoice.taxAmount * exchangeRate,
      stampTaxAmount: invoice.stampTaxAmount * exchangeRate,
      totalAmount: invoice.totalAmount * exchangeRate,
      paidAmount: invoice.paidAmount * exchangeRate,
      balanceAmount: invoice.balanceAmount * exchangeRate
    };
  }

  // ============================================================================
  // MULTI-ENTITY SUPPORT
  // ============================================================================

  async createEntity(entityData) {
    return await prisma.entity.create({
      data: {
        ...entityData,
        isActive: true
      }
    });
  }

  async getEntities() {
    return await prisma.entity.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async getEntityById(entityId) {
    return await prisma.entity.findUnique({
      where: { id: entityId }
    });
  }

  async updateEntity(entityId, updateData) {
    return await prisma.entity.update({
      where: { id: entityId },
      data: updateData
    });
  }

  async deactivateEntity(entityId) {
    return await prisma.entity.update({
      where: { id: entityId },
      data: { isActive: false }
    });
  }

  // ============================================================================
  // CONSOLIDATED REPORTING
  // ============================================================================

  async generateConsolidatedReport(startDate, endDate, targetCurrency = this.baseCurrency) {
    try {
      const entities = await this.getEntities();
      const consolidatedData = {
        period: { startDate, endDate },
        currency: targetCurrency,
        entities: [],
        totals: {
          revenue: 0,
          expenses: 0,
          profit: 0,
          invoices: 0,
          payments: 0
        }
      };

      for (const entity of entities) {
        const entityData = await this.getEntityFinancialData(entity.id, startDate, endDate, targetCurrency);
        consolidatedData.entities.push(entityData);
        
        // Add to totals
        consolidatedData.totals.revenue += entityData.revenue;
        consolidatedData.totals.expenses += entityData.expenses;
        consolidatedData.totals.profit += entityData.profit;
        consolidatedData.totals.invoices += entityData.invoiceCount;
        consolidatedData.totals.payments += entityData.paymentCount;
      }

      return consolidatedData;
    } catch (error) {
      logger.error('Failed to generate consolidated report:', error);
      throw error;
    }
  }

  async getEntityFinancialData(entityId, startDate, endDate, targetCurrency) {
    const entity = await this.getEntityById(entityId);
    
    // Get invoices for the entity
    const invoices = await prisma.invoice.findMany({
      where: {
        entityId,
        issueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        transactions: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    let totalRevenue = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    for (const invoice of invoices) {
      // Convert amounts to target currency
      const convertedAmount = await this.convertAmount(
        invoice.totalAmount,
        invoice.currency,
        targetCurrency,
        invoice.issueDate
      );
      
      const convertedPaid = await this.convertAmount(
        invoice.paidAmount,
        invoice.currency,
        targetCurrency,
        invoice.issueDate
      );

      totalRevenue += convertedAmount;
      totalPaid += convertedPaid;
      totalOutstanding += (convertedAmount - convertedPaid);
    }

    // Get transactions for the entity
    const transactions = await prisma.transaction.findMany({
      where: {
        entityId,
        paymentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: 'COMPLETED'
      }
    });

    return {
      entity: {
        id: entity.id,
        name: entity.name,
        currency: entity.baseCurrency,
        country: entity.country
      },
      revenue: totalRevenue,
      expenses: 0, // TODO: Implement expense tracking
      profit: totalRevenue,
      outstanding: totalOutstanding,
      invoiceCount: invoices.length,
      paymentCount: transactions.length,
      currency: targetCurrency
    };
  }

  // ============================================================================
  // CURRENCY FORMATTING
  // ============================================================================

  formatCurrency(amount, currency, locale = 'fr-MA') {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  getCurrencySymbol(currency) {
    const symbols = {
      'MAD': 'DH',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NZD': 'NZ$'
    };
    
    return symbols[currency] || currency;
  }

  getSupportedCurrencies() {
    return [
      { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
      { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
    ];
  }

  // ============================================================================
  // EXCHANGE RATE HISTORY
  // ============================================================================

  async getExchangeRateHistory(fromCurrency, toCurrency, startDate, endDate) {
    return await prisma.exchangeRate.findMany({
      where: {
        fromCurrency,
        toCurrency,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async updateExchangeRates() {
    try {
      const currencies = this.getSupportedCurrencies().map(c => c.code);
      const baseCurrency = this.baseCurrency;
      
      logger.info('Starting exchange rate update...');
      
      for (const currency of currencies) {
        if (currency === baseCurrency) continue;
        
        try {
          const rate = await this.fetchExchangeRateFromAPI(baseCurrency, currency);
          await this.storeExchangeRate(baseCurrency, currency, rate);
          
          // Also store reverse rate
          const reverseRate = 1 / rate;
          await this.storeExchangeRate(currency, baseCurrency, reverseRate);
          
          logger.info(`Updated exchange rate: ${baseCurrency}/${currency} = ${rate}`);
        } catch (error) {
          logger.error(`Failed to update exchange rate for ${currency}:`, error);
        }
      }
      
      logger.info('Exchange rate update completed');
    } catch (error) {
      logger.error('Failed to update exchange rates:', error);
      throw error;
    }
  }

  // ============================================================================
  // IMMUTABLE TRANSACTION LOGS
  // ============================================================================

  async createImmutableLog(entityType, entityId, action, data, userId) {
    const logEntry = {
      entityType,
      entityId,
      action,
      data: JSON.stringify(data),
      userId,
      timestamp: new Date(),
      hash: this.generateHash(entityType, entityId, action, data, userId)
    };

    return await prisma.immutableLog.create({
      data: logEntry
    });
  }

  generateHash(entityType, entityId, action, data, userId) {
    const crypto = require('crypto');
    const content = `${entityType}:${entityId}:${action}:${JSON.stringify(data)}:${userId}:${Date.now()}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async verifyLogIntegrity(logId) {
    const log = await prisma.immutableLog.findUnique({
      where: { id: logId }
    });

    if (!log) {
      return { valid: false, error: 'Log entry not found' };
    }

    const data = JSON.parse(log.data);
    const expectedHash = this.generateHash(
      log.entityType,
      log.entityId,
      log.action,
      data,
      log.userId
    );

    return {
      valid: log.hash === expectedHash,
      expectedHash,
      actualHash: log.hash
    };
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async batchConvertInvoices(invoiceIds, targetCurrency) {
    const results = [];
    
    for (const invoiceId of invoiceIds) {
      try {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId }
        });
        
        if (!invoice) {
          results.push({ invoiceId, status: 'FAILED', error: 'Invoice not found' });
          continue;
        }

        const convertedInvoice = await this.convertInvoiceAmounts(invoice, targetCurrency);
        
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            currency: convertedInvoice.currency,
            exchangeRate: convertedInvoice.exchangeRate,
            subtotal: convertedInvoice.subtotal,
            discountAmount: convertedInvoice.discountAmount,
            taxAmount: convertedInvoice.taxAmount,
            stampTaxAmount: convertedInvoice.stampTaxAmount,
            totalAmount: convertedInvoice.totalAmount,
            paidAmount: convertedInvoice.paidAmount,
            balanceAmount: convertedInvoice.balanceAmount
          }
        });

        results.push({ invoiceId, status: 'SUCCESS', convertedInvoice });
      } catch (error) {
        results.push({ invoiceId, status: 'FAILED', error: error.message });
      }
    }

    return results;
  }
}

module.exports = new MultiCurrencyService();