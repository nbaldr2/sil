---
description: Repository Information Overview
alwaysApply: true
---

# SIL Laboratory Management System Information

## Summary
A comprehensive laboratory management system built with React, TypeScript, and Tailwind CSS. The system provides features for laboratory operations including patient management, test requests, result entry, quality control, and reporting.

## Structure
- **src/**: Frontend React application with components, contexts, and services
- **server/**: Backend Express.js API with controllers, routes, and services
- **prisma/**: Database schema and ORM configuration
- **dist/**: Compiled production build
- **docker-compose.yml**: Docker configuration for development environment

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: Node.js 18 (specified in Dockerfile)
**Build System**: Vite
**Package Manager**: npm

## Dependencies
**Frontend Dependencies**:
- React 18.2.0
- React Router DOM 6.8.0
- Tailwind CSS 3.3.2
- Axios 1.11.0
- ApexCharts 3.39.0
- jsPDF 3.0.1

**Backend Dependencies**:
- Express 4.18.2
- Prisma ORM 5.7.1
- PostgreSQL (via @prisma/client)
- JWT Authentication (jsonwebtoken 9.0.2)
- Winston 3.17.0 (logging)
- Node-cron 3.0.3 (scheduling)

## Build & Installation
**Frontend**:
```bash
npm install
npm run dev    # Development server
npm run build  # Production build
```

**Backend**:
```bash
cd server
npm install
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:seed     # Seed initial data
npm run dev         # Start development server
```

## Docker
**Dockerfile**: Uses Node.js 18 Alpine image
**Docker Compose**: Includes services for app, PostgreSQL, and pgAdmin
**Configuration**:
- PostgreSQL 15 with persistent volume
- pgAdmin for database management
- Environment variables for database connection

**Run with Docker**:
```bash
docker-compose up -d postgres  # Start database only
docker-compose up              # Start all services
```

## Database
**Type**: PostgreSQL 15
**ORM**: Prisma
**Schema**: Comprehensive schema with models for patients, doctors, analyses, requests, results, inventory, and quality control
**Migration**: Managed through Prisma commands

## API
**Framework**: Express.js
**Documentation**: Swagger (swagger-jsdoc and swagger-ui-express)
**Testing**: Postman collection in server/postman directory
**Authentication**: JWT-based with role-based access control

## Testing
**Framework**: Playwright for E2E tests
**API Testing**: Postman collection with Newman for automated API testing
**Run Command**:
```bash
npm test
```

## Project Features
- Multi-role authentication (Admin, Biologist, Technician, Secretary)
- Patient and doctor management
- Laboratory test requests and results
- Quality control system for laboratory automates
- Inventory management for laboratory supplies
- Billing and financial management
- Reporting and analytics
- PDF generation for reports and labels