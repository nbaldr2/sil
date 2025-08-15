# SIL Laboratory Management System

A comprehensive laboratory management system built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multi-role System**: Admin, Biologist, Technician, Secretary
- **Secure Login**: Role-based access control
- **Demo Credentials**: Pre-configured test accounts

### 🎨 User Interface
- **Dark/Light Mode**: Automatic detection and manual toggle
- **Responsive Design**: Works on desktop and mobile
- **Bilingual Support**: French and English
- **Modern UI**: Clean, professional interface

### 📊 Enhanced Admin Dashboard
- **Real-time KPIs**: Total requests, revenue, patients, doctors
- **Performance Metrics**: Efficiency, quality, and operational metrics
- **Analytics**: Top analyses, status distribution, revenue trends
- **Period Selectors**: Today, week, month, quarter, year views
- **Growth Tracking**: Monthly growth percentages and trends
- **Recent Activity**: Latest requests with detailed information

### 💰 Comprehensive Pricing System
- **Price Management**: Dedicated component for managing analysis prices
- **Currency Settings**: Configurable currency symbol, code, position, and decimal places
- **TVA Management**: Individual VAT rates per analysis type
- **Cost Tracking**: Cost and profit margin calculations
- **Real-time Calculations**: Automatic pricing updates
- **Discount System**: Percentage-based discounts
- **Advance Payments**: Partial payment handling
- **Professional Receipts**: Detailed payment breakdowns

### 👨‍⚕️ Doctor Management System
- **Full CRUD Operations**: Create, read, update, delete doctors
- **Specialty Management**: 15+ medical specialties
- **Contact Information**: Email, phone, address tracking
- **License Numbers**: Medical license tracking
- **Status Management**: Active/inactive status
- **Search & Filter**: Find doctors by name, specialty, or status
- **Referral Tracking**: Monitor doctor referrals

### 🧪 Receptionist Interface
- **Patient Registration**: Complete patient information management
- **Analysis Selection**: Searchable multi-select with 15+ test types
- **Doctor Assignment**: Searchable doctor selection with autocomplete
- **Scheduling**: Date and time pickers for sample collection
- **Priority Management**: Urgent request handling
- **Auto-Printing**: Automatic label and receipt printing
- **Barcode Generation**: Unique sample tracking identifiers

### 🛡️ Quality Control System
- **QC Result Management**: Track quality control results for all automates
- **Multi-level Testing**: Support for Low, Normal, and High control levels
- **Automated Calculations**: Auto-calculation of deviation percentages and status
- **Status Monitoring**: Pass, Warning, and Fail status tracking
- **Statistical Analysis**: Comprehensive QC statistics and trend analysis
- **Visual Analytics**: Charts and graphs for QC performance monitoring
- **Real-time Alerts**: Automatic status determination based on deviation thresholds
- **Multi-automate Support**: QC tracking across all laboratory instruments

### 🖨️ Printing System
- **Sample Labels**: Professional labels with patient info and barcodes
- **Payment Receipts**: Detailed receipts with pricing breakdown
- **Auto-Print Workflow**: Seamless printing after request submission
- **Multiple Formats**: Labels and receipts in different layouts
- **Print Preview**: Automatic print dialog management

### 📈 Analytics & Reporting
- **Request Analytics**: Status distribution, completion rates
- **Revenue Analytics**: Monthly trends, average revenue
- **Patient Analytics**: New vs returning patients
- **Doctor Analytics**: Most active doctors, referral patterns
- **Analysis Analytics**: Most requested tests, revenue per test

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API
- **API**: RESTful API with comprehensive CRUD operations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Quick Setup

For detailed setup instructions, see [SETUP.md](./SETUP.md).

#### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Set up backend
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

# Set up frontend (in another terminal)
cd ..
npm install
npm run dev
```

#### Option 2: Local PostgreSQL

```bash
# Install and configure PostgreSQL
# Create database: sil_lab
# Create user: sil_user with password: sil_password

# Set up backend
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

# Set up frontend (in another terminal)
cd ..
npm install
npm run dev
```

### Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **Admin** | `admin@lab.fr` | `admin` | Full system access |
| **Secretary** | `secretary@lab.fr` | `123456` | Patient registration, requests, billing |
| **Biologist** | `bio@lab.fr` | `123456` | Results validation, analysis management |
| **Technician** | `tech@lab.fr` | `123456` | Result entry, printing |

## 📋 System Components

### 🏠 Dashboard
- **Admin Dashboard**: Comprehensive analytics and KPIs
- **Biologist Dashboard**: Analysis-focused interface
- **Role-based Views**: Different dashboards per user role

### 💼 Management Modules
- **Request Management**: Track and manage lab requests
- **Patient Management**: Patient database and history
- **Doctor Management**: Physician database and referrals
- **Price Management**: Analysis pricing and currency settings
- **User Management**: System user administration

### 🧪 Laboratory Operations
- **New Analysis Request**: Receptionist interface for patient registration
- **Result Entry**: Technician interface for entering test results
- **Analysis Validation**: Biologist interface for result validation
- **Quality Control**: Comprehensive QC management for all automates
- **Billing Module**: Financial management and invoicing
- **Printing Module**: Label and report printing

### ⚙️ Configuration
- **Config Center**: System settings and preferences
- **Import/Export**: Data import and export functionality
- **Role-based Access**: Permission management

## 💰 Pricing Configuration

### Currency Settings
- **Symbol**: dh, $, £, etc.
- **Code**: EUR, USD, GBP, etc.
- **Position**: Before or after amount
- **Decimal Places**: 0-4 decimal places

### Default Analysis Prices (MAD)
- **Hématologie**: Hémogramme (45dh), Groupe Sanguin (35dh)
- **Biochimie**: Glycémie (25dh), Créatininémie (28dh), Bilan hépatique (55dh)
- **Lipides**: Cholestérol Total (30dh), HDL/LDL (35dh each), Triglycérides (30dh)
- **Hormonologie**: TSH (40dh), T4/T3 Libre (45dh each)
- **Inflammation**: CRP (32dh), VS (20dh)

### Pricing Features
- **Real-time Calculation**: Automatic updates as analyses are selected
- **TVA Management**: Configurable VAT rates per analysis
- **Discount System**: Percentage-based discounts
- **Advance Payments**: Partial payment handling
- **Profit Tracking**: Cost and margin calculations

## 🖨️ Printing Features

### Sample Labels
- Patient information (name, ID, date/time)
- Selected analyses list
- Unique barcode for sample tracking
- Urgent status indicator
- Professional formatting

### Payment Receipts
- Laboratory header with contact information
- Detailed analysis breakdown with individual prices
- TVA breakdown per analysis
- Discount and advance payment calculations
- Final amount due
- Professional receipt formatting

### Auto-Print Workflow
- Automatic printing after successful request submission
- Sequential printing (labels first, then receipt)
- Print dialog opens automatically
- Formatted for standard printer output

## 🛡️ Quality Control System

### Overview
The Quality Control (QC) system provides comprehensive monitoring and analysis of laboratory automate performance through systematic quality control testing and statistical analysis.

### Key Features

#### QC Result Management
- **Multi-level Testing**: Support for Low, Normal, and High control levels
- **Automated Calculations**: Auto-calculation of deviation percentages from expected values
- **Status Determination**: Automatic pass/warning/fail status based on deviation thresholds
- **Real-time Entry**: Quick QC result entry with validation
- **Historical Tracking**: Complete history of all QC results

#### Statistical Analysis
- **Pass Rate Monitoring**: Real-time calculation of QC pass rates
- **Trend Analysis**: Performance trends over configurable time periods
- **Test Distribution**: Analysis breakdown by test type and automate
- **Performance Metrics**: Comprehensive statistics for quality assessment
- **Visual Analytics**: Charts and graphs for easy interpretation

#### Multi-automate Support
- **Cross-instrument Monitoring**: QC tracking across all laboratory automates
- **Comparative Analysis**: Performance comparison between instruments
- **Centralized Dashboard**: Unified view of all QC activities
- **Individual Automate Views**: Detailed QC analysis per instrument

### QC Status Thresholds
- **Pass**: Deviation ≤ 5% from expected value
- **Warning**: Deviation 5-15% from expected value  
- **Fail**: Deviation > 15% from expected value

### Access Control
- **Admin**: Full QC management and configuration
- **Biologist**: QC monitoring, analysis, and result validation
- **Technician**: QC result entry and basic monitoring

### QC Workflow
1. **Sample Preparation**: Prepare control samples at different levels
2. **Result Entry**: Enter measured values through the QC interface
3. **Automatic Processing**: System calculates deviation and determines status
4. **Statistical Analysis**: Review performance metrics and trends
5. **Quality Assessment**: Monitor pass rates and identify issues
6. **Corrective Actions**: Address failures and warnings as needed

### Navigation
Access the Quality Control system through:
- **Sidebar Menu**: "Contrôle Qualité" / "Quality Control" (Shield icon)
- **Direct URL**: `/quality-control`
- **Role Requirements**: ADMIN, BIOLOGIST, or TECHNICIAN access

## 📊 Analytics & KPIs

### Financial Metrics
- **Total Revenue**: Overall laboratory revenue
- **Average Revenue**: Per-request revenue
- **Revenue Growth**: Monthly growth percentages
- **Profit Margins**: Cost vs revenue analysis

### Operational Metrics
- **Total Requests**: Overall request volume
- **Completion Rate**: Successfully completed requests
- **Turnaround Time**: Average processing time
- **Urgent Requests**: Priority request handling

### Quality Metrics
- **Accuracy Rate**: Result accuracy percentage
- **Customer Satisfaction**: Patient satisfaction scores
- **QC Pass Rate**: Quality control success percentage
- **QC Trend Analysis**: Statistical analysis of QC performance
- **Automate Performance**: Individual instrument quality metrics
- **Error Rate**: Quality control failure tracking

### Patient Analytics
- **New Patients**: First-time visitors
- **Returning Patients**: Repeat customers
- **Patient Growth**: Monthly patient acquisition

## 🔧 Troubleshooting

### Common Issues

**If you see "Erreur lors de l'enregistrement":**
- The system automatically falls back to local storage
- Data is still saved and accessible
- Check browser console for confirmation messages
- Use `debugRequests()` in browser console to view saved data

**Debug Tools:**
- Open browser console (F12)
- Type `debugRequests()` to view all saved requests
- Data is stored in localStorage under `sil_lab_requests`

### Currency Configuration
1. Login as admin: `admin@lab.fr` / `admin`
2. Go to "Gestion Prix" (Price Management)
3. Configure currency settings in the top section
4. Set prices for each analysis type
5. Save configuration

### Doctor Management
1. Login as admin or secretary
2. Go to "Gestion Médecins" (Doctor Management)
3. Add new doctors with complete information
4. Set specialties and contact details
5. Manage active/inactive status

## 🎯 Use Cases

### Receptionist Workflow
1. **Patient Registration**: Enter patient details and CNSS number
2. **Analysis Selection**: Choose from 15+ test types with search
3. **Doctor Assignment**: Select referring physician
4. **Scheduling**: Set sample collection date/time
5. **Pricing**: View automatic calculations with discounts
6. **Submission**: Submit request with auto-printing

### Admin Management
1. **Dashboard Review**: Monitor KPIs and performance metrics
2. **Price Management**: Update analysis prices and currency settings
3. **Doctor Management**: Maintain physician database
4. **System Configuration**: Configure laboratory settings
5. **User Management**: Manage system users and permissions

### Biologist Operations
1. **Result Validation**: Review and validate test results
2. **Quality Control**: Monitor QC results and trends across all automates
3. **QC Analysis**: Review statistical performance and identify issues
4. **Report Generation**: Create professional reports
5. **Printing**: Generate patient reports and labels

### Quality Control Workflow
1. **QC Result Entry**: Enter control sample results for each automate
2. **Automatic Calculations**: System calculates deviation and determines status
3. **Statistical Monitoring**: View pass rates, trends, and performance metrics
4. **Alert Management**: Monitor warnings and failures across instruments
5. **Trend Analysis**: Analyze QC performance over time periods
6. **Multi-automate Overview**: Compare performance across all instruments

## 🔮 Future Enhancements

- **External API Integration**: Connect to external laboratory systems
- **Advanced QC Analytics**: Machine learning for QC trend prediction
- **Mobile App**: Native mobile application
- **Multi-location Support**: Multiple laboratory locations
- **Advanced Reporting**: Custom report generation
- **Integration APIs**: Connect with hospital systems

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**SIL Laboratory Management System** - Professional laboratory management made simple.
 