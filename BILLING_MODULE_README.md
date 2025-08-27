# 🏥 SIL Lab Billing Manager Module

## Overview

The Billing Manager Module is a comprehensive financial management system designed specifically for laboratory operations in Morocco. It provides complete invoice management, payment tracking, tax compliance, and financial reporting capabilities.

## 🚀 Features

### Core Functionalities

#### 📄 Invoice Management
- **Automated Invoice Generation**: Create invoices manually or automatically from lab requests
- **Multiple Invoice Types**: Standard, Proforma, Credit Notes, Debit Notes, Receipts
- **Recurring Invoices**: Set up automatic recurring billing for regular customers
- **Invoice Templates**: Professional PDF templates with Moroccan tax compliance
- **Multi-language Support**: French and English interface

#### 💰 Payment Tracking
- **Payment Methods**: Cash, Bank Transfer, Check, Credit/Debit Cards
- **Payment Status Tracking**: Draft, Sent, Paid, Partial Paid, Overdue, Cancelled
- **Automatic Reconciliation**: Match payments to invoices automatically
- **Payment Receipts**: Generate professional payment receipts

#### 📊 Financial Reporting
- **Dashboard Analytics**: Real-time financial KPIs and metrics
- **Period Reports**: Daily, Weekly, Monthly, Yearly financial reports
- **Customer Analysis**: Revenue breakdown by customer type and individual customers
- **Aging Reports**: Track overdue invoices and payment delays
- **Export Options**: PDF, Excel, CSV export capabilities

#### 🏛️ Tax Management (Morocco Compliant)
- **TVA Calculation**: Automatic 20% TVA calculation
- **Stamp Tax**: 0.1% stamp tax (Timbre) calculation
- **Tax Exemptions**: Support for tax-exempt customers
- **ICE Integration**: Moroccan tax ID (ICE) support
- **Tax Reports**: Detailed tax breakdown and reporting

#### 🏥 Insurance Claim Processing
- **Claim Submission**: Submit claims to insurance companies (CNSS, CNOPS, etc.)
- **Document Management**: Attach supporting documents to claims
- **Claim Tracking**: Monitor claim status and approvals
- **Automated Workflows**: Streamlined claim processing

#### 📧 Payment Reminders & Dunning
- **Automated Reminders**: Send payment reminders via email/SMS
- **Escalation Levels**: Multi-level reminder system
- **Smart Retry Logic**: Intelligent retry for failed payments
- **Configurable Workflows**: Customizable dunning processes

### Advanced Financial Tools

#### 📈 Revenue & Expense Analytics
- **Revenue Recognition**: Track revenue by service type and period
- **Expense Categorization**: Organize expenses by department/project
- **Cash Flow Insights**: Real-time cash flow monitoring
- **Forecasting Tools**: Predict future revenue and expenses

#### 💳 Discount Management
- **Flexible Discounts**: Percentage or fixed amount discounts
- **Approval Workflows**: Require approval for large discounts
- **Customer-specific Pricing**: Special rates for insurance companies

#### 📊 Financial Dashboard
- **Key Performance Indicators**: Outstanding payments, top clients, revenue metrics
- **Visual Analytics**: Charts and graphs for financial data
- **Real-time Updates**: Live financial status monitoring

### Compliance & Security

#### 🔒 Regulation Compliance
- **Moroccan Tax Law**: Full compliance with TVA, Timbre, and other local taxes
- **Data Protection**: GDPR-compliant data handling
- **Audit Trail**: Complete transaction logging and audit capabilities
- **Immutable Records**: Tamper-proof financial transaction logs

#### 🌍 Multi-Currency & Multi-Entity
- **Currency Support**: Primary MAD with multi-currency capability
- **Exchange Rates**: Automatic currency conversion
- **Multi-branch Support**: Handle multiple laboratory locations
- **Consolidated Reporting**: Combined financial reports across entities

### User Experience

#### 👥 Customer Management
- **Customer Types**: Individual patients, Insurance companies, Corporate clients
- **Customer Profiles**: Complete customer information and history
- **Credit Management**: Credit limits and payment terms
- **Communication History**: Track all customer interactions

#### 🔐 Role-Based Access Control
- **Admin**: Full access to all billing functions
- **Secretary**: Invoice creation, customer management, payment entry
- **Biologist**: View financial reports, invoice approval
- **Technician**: Limited access to relevant billing information

#### 📱 Responsive Design
- **Mobile-Friendly**: Works on all devices and screen sizes
- **Intuitive Interface**: Easy-to-use design for all user levels
- **Quick Actions**: Fast access to common billing tasks

## 🛠️ Technical Implementation

### Database Schema

The billing module extends the existing database with comprehensive financial tables:

- **Customer**: Customer/payer management
- **Invoice**: Invoice header information
- **InvoiceItem**: Line items for each invoice
- **InvoiceTax**: Tax calculations and breakdown
- **Transaction**: Payment transactions and refunds
- **InsuranceClaim**: Insurance claim processing
- **PaymentReminder**: Automated reminder system
- **FinancialReport**: Cached financial reports
- **TaxConfiguration**: Tax rate management

### API Endpoints

#### Customer Management
- `GET /api/billing/customers` - List customers with pagination and search
- `POST /api/billing/customers` - Create new customer
- `PUT /api/billing/customers/:id` - Update customer information
- `DELETE /api/billing/customers/:id` - Deactivate customer

#### Invoice Management
- `GET /api/billing/invoices` - List invoices with filtering
- `GET /api/billing/invoices/:id` - Get invoice details
- `POST /api/billing/invoices` - Create new invoice
- `POST /api/billing/invoices/from-request` - Generate invoice from lab request
- `PATCH /api/billing/invoices/:id/status` - Update invoice status
- `GET /api/billing/invoices/:id/pdf` - Download invoice PDF

#### Payment Processing
- `GET /api/billing/transactions` - List payment transactions
- `POST /api/billing/transactions` - Record new payment
- `GET /api/billing/transactions/:id/receipt` - Download payment receipt

#### Financial Reporting
- `GET /api/billing/dashboard` - Get dashboard metrics
- `GET /api/billing/reports/:type` - Generate financial reports

#### Recurring Invoices
- `POST /api/billing/invoices/:id/recurring` - Set up recurring billing
- `DELETE /api/billing/invoices/:id/recurring` - Cancel recurring billing

#### Payment Reminders
- `POST /api/billing/invoices/:id/reminder` - Send payment reminder
- `GET /api/billing/invoices/:id/reminders` - Get reminder history

### Frontend Components

#### Main Components
- **BillingModule**: Main billing interface with tabbed navigation
- **Dashboard**: Financial metrics and KPI display
- **InvoiceList**: Invoice management with search and filtering
- **CustomerList**: Customer management interface
- **PaymentList**: Payment transaction history
- **ReportGenerator**: Financial report generation

#### Services
- **billingService**: API communication layer
- **pdfService**: PDF generation and download
- **calculationService**: Tax and total calculations

### PDF Generation

Professional PDF invoices and receipts with:
- Company branding and logo
- Moroccan tax compliance formatting
- Multi-language support (French/English)
- Digital signatures support
- Automatic numbering system

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Existing SIL Lab Management System

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd server
   npm install pdfkit
   ```

2. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Sample Data**
   ```bash
   node prisma/seeds/billing-seed.js
   ```

### Frontend Setup

The billing module is integrated into the existing React application. No additional setup required.

### Configuration

#### Tax Configuration
Update tax rates in the database:
```sql
UPDATE "TaxConfiguration" SET "taxRate" = 20.0 WHERE "taxType" = 'TVA';
UPDATE "TaxConfiguration" SET "taxRate" = 0.1 WHERE "taxType" = 'STAMP_TAX';
```

#### Company Information
Update company details in `server/src/services/pdfService.js`:
```javascript
this.companyInfo = {
  name: 'Your Lab Name',
  address: 'Your Address',
  phone: 'Your Phone',
  email: 'Your Email',
  taxId: 'Your ICE Number'
};
```

## 📋 Usage Guide

### Creating an Invoice

1. **From Lab Request**
   - Navigate to Requests module
   - Select completed request
   - Click "Generate Invoice"
   - Review and send to customer

2. **Manual Invoice**
   - Go to Billing → Invoices
   - Click "New Invoice"
   - Select customer and add items
   - Calculate taxes and totals
   - Save and send

### Processing Payments

1. **Record Payment**
   - Go to Billing → Payments
   - Click "New Payment"
   - Select invoice and enter amount
   - Choose payment method
   - Save transaction

2. **Automatic Reconciliation**
   - System automatically updates invoice status
   - Generates payment receipt
   - Updates customer balance

### Financial Reporting

1. **Dashboard Overview**
   - View real-time financial metrics
   - Monitor outstanding payments
   - Track collection rates

2. **Detailed Reports**
   - Generate period-specific reports
   - Export to PDF/Excel
   - Analyze customer performance

### Insurance Claims

1. **Submit Claim**
   - Select paid invoice
   - Create insurance claim
   - Attach required documents
   - Submit to insurance company

2. **Track Claims**
   - Monitor claim status
   - Receive approval notifications
   - Process insurance payments

## 🔧 Customization

### Adding New Payment Methods
1. Update `PaymentMethod` enum in schema
2. Add translation in frontend
3. Update PDF service for receipts

### Custom Tax Rates
1. Create new `TaxConfiguration` record
2. Update calculation logic in billing service
3. Test with sample invoices

### Report Templates
1. Extend `generateReport` function
2. Add new report types
3. Create corresponding frontend components

## 🐛 Troubleshooting

### Common Issues

#### PDF Generation Fails
- Check PDFKit installation
- Verify file permissions
- Ensure sufficient disk space

#### Tax Calculations Incorrect
- Verify tax configuration in database
- Check calculation logic in billing service
- Test with known values

#### Payment Reconciliation Issues
- Check invoice and transaction IDs
- Verify customer matching
- Review audit logs

### Debug Mode
Enable debug logging:
```javascript
// In billing service
console.log('Debug: Invoice calculation', calculations);
```

## 📈 Performance Optimization

### Database Indexing
```sql
CREATE INDEX idx_invoice_customer ON "Invoice"("customerId");
CREATE INDEX idx_invoice_status ON "Invoice"("status");
CREATE INDEX idx_transaction_invoice ON "Transaction"("invoiceId");
```

### Caching Strategy
- Cache financial reports for 1 hour
- Cache customer data for 30 minutes
- Use Redis for session storage

### Pagination
- Default page size: 10 items
- Maximum page size: 100 items
- Use cursor-based pagination for large datasets

## 🔒 Security Considerations

### Data Protection
- Encrypt sensitive financial data
- Use HTTPS for all communications
- Implement rate limiting on API endpoints

### Access Control
- Role-based permissions
- Audit all financial transactions
- Secure PDF generation

### Backup Strategy
- Daily database backups
- Encrypted backup storage
- Regular restore testing

## 🚀 Future Enhancements

### Planned Features
- **Online Payment Gateway**: Integration with Moroccan payment providers
- **Mobile App**: Dedicated mobile application for billing
- **AI Analytics**: Predictive analytics for cash flow
- **API Integration**: Connect with accounting software (Sage, QuickBooks)
- **E-invoicing**: Government e-invoicing compliance
- **Multi-language**: Arabic language support

### Roadmap
- **Q1 2024**: Online payments and mobile app
- **Q2 2024**: AI analytics and forecasting
- **Q3 2024**: Government e-invoicing integration
- **Q4 2024**: Advanced reporting and analytics

## 📞 Support

For technical support or questions about the Billing Manager Module:

- **Email**: support@sil-lab.ma
- **Documentation**: [Internal Wiki]
- **Issue Tracking**: [GitHub Issues]
- **Training**: Contact system administrator

## 📄 License

This module is part of the SIL Laboratory Management System and is proprietary software. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: SIL Lab Management System v2.0+