# SIL Laboratory Management System - Backend

A robust Node.js/Express backend with PostgreSQL and Prisma for the SIL Laboratory Management System.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for all entities
- **PostgreSQL Database**: Robust relational database with Prisma ORM
- **Authentication**: JWT-based authentication with role-based access
- **Validation**: Input validation with express-validator
- **Security**: Helmet, CORS, rate limiting
- **Comprehensive Routes**: 
  - Authentication (`/api/auth`)
  - Patients (`/api/patients`)
  - Doctors (`/api/doctors`)
  - Analyses (`/api/analyses`)
  - Requests (`/api/requests`)
  - Results (`/api/results`)
  - Configuration (`/api/config`)

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## 📋 Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Docker (optional, for containerized PostgreSQL)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL locally**
2. **Create database:**
   ```sql
   CREATE DATABASE sil_lab;
   CREATE USER sil_user WITH PASSWORD 'sil_password';
   GRANT ALL PRIVILEGES ON DATABASE sil_lab TO sil_user;
   ```

3. **Update `.env` file with your local PostgreSQL credentials**

4. **Follow steps 2-4 from Option 1**

## 📊 Database Schema

### Core Entities

- **Users**: System users with role-based access
- **Patients**: Patient information and medical history
- **Doctors**: Referring physicians and specialists
- **Analyses**: Laboratory tests with pricing
- **Requests**: Patient test requests with analyses
- **Results**: Test results and validation
- **SystemConfig**: Laboratory configuration

### Relationships

- Patients → Requests (1:N)
- Doctors → Requests (1:N)
- Requests → RequestAnalyses (1:N)
- Analyses → RequestAnalyses (1:N)
- Requests → Results (1:N)
- Analyses → Results (1:N)

## 🔐 Authentication

### User Roles
- **ADMIN**: Full system access
- **BIOLOGIST**: Result validation and analysis management
- **TECHNICIAN**: Result entry and printing
- **SECRETARY**: Patient registration and request management

### Demo Credentials
```
Admin: admin@lab.fr / admin
Secretary: secretary@lab.fr / 123456
Biologist: bio@lab.fr / 123456
Technician: tech@lab.fr / 123456
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/users` - Create user (admin only)
- `GET /api/auth/users` - Get all users (admin only)

### Patients
- `GET /api/patients` - Get all patients (with pagination)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/stats/overview` - Patient statistics

### Doctors
- `GET /api/doctors` - Get all doctors (with pagination)
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/search/autocomplete` - Search doctors
- `GET /api/doctors/stats/overview` - Doctor statistics

### Analyses
- `GET /api/analyses` - Get all analyses (with pagination)
- `GET /api/analyses/:id` - Get analysis by ID
- `POST /api/analyses` - Create analysis
- `PUT /api/analyses/:id` - Update analysis
- `DELETE /api/analyses/:id` - Delete analysis
- `GET /api/analyses/categories/list` - Get analysis categories
- `GET /api/analyses/search/autocomplete` - Search analyses
- `PUT /api/analyses/prices/bulk` - Bulk update prices
- `GET /api/analyses/stats/overview` - Analysis statistics

### Requests
- `GET /api/requests` - Get all requests (with pagination)
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `PATCH /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request
- `GET /api/requests/stats/overview` - Request statistics

### Results
- `GET /api/results` - Get all results (with pagination)
- `GET /api/results/:id` - Get result by ID
- `POST /api/results` - Create result
- `PUT /api/results/:id` - Update result
- `PATCH /api/results/:id/validate` - Validate result
- `GET /api/results/request/:requestId` - Get results by request
- `GET /api/results/stats/overview` - Result statistics

### Configuration
- `GET /api/config` - Get system configuration
- `PUT /api/config` - Update system configuration
- `GET /api/config/stats` - Get system statistics
- `GET /api/config/export` - Export system data
- `POST /api/config/backup` - Create system backup

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Database
DATABASE_URL="postgresql://sil_user:sil_password@localhost:5432/sil_lab?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed the database
```

## 🗄️ Database Management

### Prisma Studio
```bash
npm run db:studio
```
Access at: http://localhost:5555

### Manual Database Operations
```bash
# Reset database
npx prisma db push --force-reset

# Generate client after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## 🔍 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.fr","password":"admin"}'
```

### Get Patients Example
```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error information (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **CORS Protection**: Configured CORS headers
- **Rate Limiting**: Prevents abuse
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM protection

## 📊 Monitoring

### Health Check Endpoint
- `GET /api/health` - System health status

### Logging
- Morgan HTTP request logging
- Console error logging
- Structured logging for debugging

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up reverse proxy (nginx)
5. Use PM2 for process management

### Docker Deployment
```bash
# Build image
docker build -t sil-lab-backend .

# Run container
docker run -p 5000:5000 sil-lab-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**SIL Laboratory Management System Backend** - Professional laboratory management API. 