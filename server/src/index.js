// server.js or app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { generateSwaggerComponents } = require('./utils/swagger-generator');
const { HL7Server } = require('./services/hl7/hl7-server');

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const analysisRoutes = require('./routes/analyses');
const requestRoutes = require('./routes/requests');
const resultRoutes = require('./routes/results');
const configRoutes = require('./routes/config');
const stockRoutes = require('./routes/stock');
const pluginRoutes = require('./routes/plugins');
const automateRoutes = require('./routes/automates');
 

const app = express();
const prisma = new PrismaClient();

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 100),
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SIL Lab Management System API',
      version: '1.0.0',
      description: 'API Documentation for SIL Lab Management System',
      contact: {
        name: 'API Support',
        email: 'contact@sil-lab.ma'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5001',
        description: 'Development Server'
      }
    ],
    components: {
      ...generateSwaggerComponents(),
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/config', configRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/automates', automateRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start HTTP and HL7 servers
const HTTP_PORT = process.env.PORT || 5001;
const HL7_PORT = process.env.HL7_PORT || 2027;  // Match automate configuration

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server is running on port ${HTTP_PORT}`);
  console.log(`Swagger documentation available at http://localhost:${HTTP_PORT}/api/docs`);
});

// Start HL7 server
const hl7Server = new HL7Server(HL7_PORT, prisma);
hl7Server.start();

module.exports = app;