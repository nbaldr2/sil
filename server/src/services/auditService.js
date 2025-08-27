const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ensure audit logs directory exists
const auditLogsDir = path.join(__dirname, '../../logs/audit');
if (!fs.existsSync(auditLogsDir)) {
  fs.mkdirSync(auditLogsDir, { recursive: true });
}

// Create audit-specific logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
  ),
  transports: [
    // Daily rotating audit log files
    new winston.transports.File({
      filename: path.join(auditLogsDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 30, // Keep 30 days of logs
      tailable: true
    }),
    // Separate file for security events
    new winston.transports.File({
      filename: path.join(auditLogsDir, 'security.log'),
      level: 'warn', // Only log warnings and errors
      maxsize: 10485760,
      maxFiles: 90 // Keep security logs longer
    })
  ]
});

// User activity categories
const ACTIVITY_CATEGORIES = {
  // Authentication & Authorization
  AUTH: {
    LOGIN: 'USER_LOGIN',
    LOGOUT: 'USER_LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    TOKEN_REFRESH: 'TOKEN_REFRESH'
  },
  
  // Patient Management
  PATIENT: {
    CREATE: 'PATIENT_CREATE',
    UPDATE: 'PATIENT_UPDATE',
    DELETE: 'PATIENT_DELETE',
    VIEW: 'PATIENT_VIEW',
    SEARCH: 'PATIENT_SEARCH'
  },
  
  // Request Management
  REQUEST: {
    CREATE: 'REQUEST_CREATE',
    UPDATE: 'REQUEST_UPDATE',
    DELETE: 'REQUEST_DELETE',
    APPROVE: 'REQUEST_APPROVE',
    REJECT: 'REQUEST_REJECT',
    VIEW: 'REQUEST_VIEW'
  },
  
  // Results Management
  RESULT: {
    CREATE: 'RESULT_CREATE',
    UPDATE: 'RESULT_UPDATE',
    DELETE: 'RESULT_DELETE',
    VALIDATE: 'RESULT_VALIDATE',
    REJECT: 'RESULT_REJECT',
    PRINT: 'RESULT_PRINT',
    EXPORT: 'RESULT_EXPORT'
  },
  
  // System Administration
  ADMIN: {
    USER_CREATE: 'ADMIN_USER_CREATE',
    USER_UPDATE: 'ADMIN_USER_UPDATE',
    USER_DELETE: 'ADMIN_USER_DELETE',
    BACKUP_CREATE: 'ADMIN_BACKUP_CREATE',
    BACKUP_RESTORE: 'ADMIN_BACKUP_RESTORE',
    SYSTEM_CONFIG: 'ADMIN_SYSTEM_CONFIG',
    PRICE_UPDATE: 'ADMIN_PRICE_UPDATE'
  },
  
  // Data Access
  DATA: {
    EXPORT: 'DATA_EXPORT',
    IMPORT: 'DATA_IMPORT',
    BULK_UPDATE: 'DATA_BULK_UPDATE',
    REPORT_GENERATE: 'REPORT_GENERATE'
  },
  
  // Security Events
  SECURITY: {
    UNAUTHORIZED_ACCESS: 'SECURITY_UNAUTHORIZED_ACCESS',
    SUSPICIOUS_ACTIVITY: 'SECURITY_SUSPICIOUS_ACTIVITY',
    DATA_BREACH_ATTEMPT: 'SECURITY_DATA_BREACH_ATTEMPT',
    ADMIN_PRIVILEGE_ESCALATION: 'SECURITY_PRIVILEGE_ESCALATION'
  }
};

// Get client IP address from request
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         'unknown';
}

// Get user agent from request
function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

// Main audit logging function
async function logActivity(activity, details = {}) {
  try {
    const {
      userId,
      userEmail,
      userName,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      success = true,
      errorMessage,
      metadata = {}
    } = details;

    const auditEntry = {
      id: generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: userId || null,
      userEmail: userEmail || null,
      userName: userName || null,
      action: action || activity,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      success,
      errorMessage: errorMessage || null,
      metadata: JSON.stringify(metadata),
      severity: determineSeverity(activity, success),
      category: determineCategory(activity)
    };

    // Log to file
    auditLogger.info('Audit Event', auditEntry);

    // Store in database (if table exists)
    try {
      await storeInDatabase(auditEntry);
    } catch (dbError) {
      console.warn('Failed to store audit log in database:', dbError.message);
    }

    return auditEntry;
  } catch (error) {
    console.error('Failed to log audit activity:', error);
    throw error;
  }
}

// Store audit log in database
async function storeInDatabase(auditEntry) {
  // Create audit log table if it doesn't exist
  await ensureAuditLogTable();

  // Convert timestamp string to proper Date object
  const timestamp = new Date(auditEntry.timestamp);

  // Insert audit entry
  await prisma.$executeRaw`
    INSERT INTO audit_logs (
      id, timestamp, user_id, user_email, user_name, action, 
      resource_type, resource_id, old_values, new_values, 
      ip_address, user_agent, success, error_message, 
      metadata, severity, category
    ) VALUES (
      ${auditEntry.id}, ${timestamp}, ${auditEntry.userId}, 
      ${auditEntry.userEmail}, ${auditEntry.userName}, ${auditEntry.action},
      ${auditEntry.resourceType}, ${auditEntry.resourceId}, ${auditEntry.oldValues},
      ${auditEntry.newValues}, ${auditEntry.ipAddress}, ${auditEntry.userAgent},
      ${auditEntry.success}, ${auditEntry.errorMessage}, ${auditEntry.metadata},
      ${auditEntry.severity}, ${auditEntry.category}
    )
  `;
}

// Ensure audit log table exists
async function ensureAuditLogTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        old_values TEXT,
        new_values TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT,
        metadata TEXT,
        severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes if they don't exist
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs (user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs (severity)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs (category)`;
  } catch (error) {
    console.warn('Could not create audit_logs table:', error.message);
  }
}

// Generate unique audit ID
function generateAuditId() {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Determine severity level
function determineSeverity(activity, success) {
  if (!success) return 'HIGH';
  
  if (activity.includes('SECURITY') || activity.includes('DELETE') || activity.includes('BACKUP_RESTORE')) {
    return 'CRITICAL';
  }
  if (activity.includes('ADMIN') || activity.includes('LOGIN_FAILED')) {
    return 'HIGH';
  }
  if (activity.includes('UPDATE') || activity.includes('CREATE')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

// Determine category
function determineCategory(activity) {
  if (activity.includes('AUTH') || activity.includes('LOGIN')) return 'AUTHENTICATION';
  if (activity.includes('PATIENT')) return 'PATIENT_MANAGEMENT';
  if (activity.includes('REQUEST')) return 'REQUEST_MANAGEMENT';
  if (activity.includes('RESULT')) return 'RESULT_MANAGEMENT';
  if (activity.includes('ADMIN')) return 'ADMINISTRATION';
  if (activity.includes('SECURITY')) return 'SECURITY';
  if (activity.includes('DATA')) return 'DATA_MANAGEMENT';
  return 'GENERAL';
}

// Middleware for automatic audit logging
function auditMiddleware(options = {}) {
  return (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();
    
    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Extract activity information from request
      const activity = determineActivityFromRequest(req);
      if (activity && options.trackActivity !== false) {
        const details = {
          userId: req.user?.id,
          userEmail: req.user?.email,
          userName: req.user?.name,
          action: activity,
          resourceType: determineResourceType(req),
          resourceId: req.params.id || req.body.id,
          ipAddress: getClientIP(req),
          userAgent: getUserAgent(req),
          success: res.statusCode < 400,
          errorMessage: res.statusCode >= 400 ? data : null,
          metadata: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: duration,
            bodySize: data ? data.length : 0
          }
        };
        
        // Log asynchronously to avoid blocking response
        setImmediate(() => {
          logActivity(activity, details).catch(console.error);
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}

// Determine activity from request
function determineActivityFromRequest(req) {
  const method = req.method;
  const path = req.route?.path || req.path;
  
  // Authentication routes
  if (path.includes('/auth/login')) return ACTIVITY_CATEGORIES.AUTH.LOGIN;
  if (path.includes('/auth/logout')) return ACTIVITY_CATEGORIES.AUTH.LOGOUT;
  
  // Patient routes
  if (path.includes('/patients')) {
    if (method === 'POST') return ACTIVITY_CATEGORIES.PATIENT.CREATE;
    if (method === 'PUT') return ACTIVITY_CATEGORIES.PATIENT.UPDATE;
    if (method === 'DELETE') return ACTIVITY_CATEGORIES.PATIENT.DELETE;
    if (method === 'GET') return ACTIVITY_CATEGORIES.PATIENT.VIEW;
  }
  
  // Request routes
  if (path.includes('/requests')) {
    if (method === 'POST') return ACTIVITY_CATEGORIES.REQUEST.CREATE;
    if (method === 'PUT') return ACTIVITY_CATEGORIES.REQUEST.UPDATE;
    if (method === 'DELETE') return ACTIVITY_CATEGORIES.REQUEST.DELETE;
    if (method === 'GET') return ACTIVITY_CATEGORIES.REQUEST.VIEW;
  }
  
  // Result routes
  if (path.includes('/results')) {
    if (method === 'POST') return ACTIVITY_CATEGORIES.RESULT.CREATE;
    if (method === 'PUT') return ACTIVITY_CATEGORIES.RESULT.UPDATE;
    if (method === 'DELETE') return ACTIVITY_CATEGORIES.RESULT.DELETE;
    if (method === 'GET') return ACTIVITY_CATEGORIES.RESULT.VIEW;
  }
  
  // Admin routes
  if (path.includes('/admin')) {
    if (path.includes('/backup')) return ACTIVITY_CATEGORIES.ADMIN.BACKUP_CREATE;
    if (path.includes('/users')) {
      if (method === 'POST') return ACTIVITY_CATEGORIES.ADMIN.USER_CREATE;
      if (method === 'PUT') return ACTIVITY_CATEGORIES.ADMIN.USER_UPDATE;
      if (method === 'DELETE') return ACTIVITY_CATEGORIES.ADMIN.USER_DELETE;
    }
    if (path.includes('/prices')) return ACTIVITY_CATEGORIES.ADMIN.PRICE_UPDATE;
  }
  
  return null;
}

// Determine resource type from request
function determineResourceType(req) {
  const path = req.route?.path || req.path;
  
  if (path.includes('/patients')) return 'PATIENT';
  if (path.includes('/requests')) return 'REQUEST';
  if (path.includes('/results')) return 'RESULT';
  if (path.includes('/users')) return 'USER';
  if (path.includes('/analyses')) return 'ANALYSIS';
  if (path.includes('/doctors')) return 'DOCTOR';
  
  return null;
}

// Query audit logs with filtering
async function queryAuditLogs(filters = {}) {
  const {
    userId,
    action,
    resourceType,
    startDate,
    endDate,
    severity,
    category,
    page = 1,
    limit = 50,
    search
  } = filters;

  try {
    // Build WHERE clause
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (userId) {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (action) {
      whereConditions.push(`action ILIKE $${paramIndex}`);
      params.push(`%${action}%`);
      paramIndex++;
    }

    if (resourceType) {
      whereConditions.push(`resource_type = $${paramIndex}`);
      params.push(resourceType);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`timestamp >= $${paramIndex}`);
      params.push(new Date(startDate));
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`timestamp <= $${paramIndex}`);
      params.push(new Date(endDate));
      paramIndex++;
    }

    if (severity) {
      whereConditions.push(`severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(user_email ILIKE $${paramIndex} OR user_name ILIKE $${paramIndex + 1} OR action ILIKE $${paramIndex + 2})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*)::INTEGER as total FROM audit_logs ${whereClause}`;
    const totalResult = await prisma.$queryRawUnsafe(countQuery, ...params);
    const total = totalResult[0]?.total || 0;

    // Get logs
    const logsQuery = `
      SELECT * FROM audit_logs 
      ${whereClause} 
      ORDER BY timestamp DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const logs = await prisma.$queryRawUnsafe(logsQuery, ...params, limit, offset);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error querying audit logs:', error);
    throw error;
  }
}

// Get audit statistics
async function getAuditStats(timeframe = '30d') {
  try {
    const timeframeDays = parseInt(timeframe.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::INTEGER as "totalEvents",
        COUNT(DISTINCT user_id)::INTEGER as "uniqueUsers",
        COUNT(CASE WHEN success = false THEN 1 END)::INTEGER as "failedEvents",
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END)::INTEGER as "criticalEvents",
        COUNT(CASE WHEN severity = 'HIGH' THEN 1 END)::INTEGER as "highSeverityEvents"
      FROM audit_logs 
      WHERE timestamp >= ${startDate}
    `;

    const categoryStats = await prisma.$queryRaw`
      SELECT category, COUNT(*)::INTEGER as count
      FROM audit_logs 
      WHERE timestamp >= ${startDate}
      GROUP BY category
      ORDER BY count DESC
    `;

    const userActivityStats = await prisma.$queryRaw`
      SELECT user_email, user_name, COUNT(*)::INTEGER as "activityCount"
      FROM audit_logs 
      WHERE timestamp >= ${startDate} AND user_id IS NOT NULL
      GROUP BY user_id, user_email, user_name
      ORDER BY "activityCount" DESC
      LIMIT 10
    `;

    return {
      overview: stats[0] || {
        totalEvents: 0,
        uniqueUsers: 0,
        failedEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0
      },
      categoryBreakdown: categoryStats || [],
      topUsers: userActivityStats || [],
      timeframe
    };
  } catch (error) {
    console.error('Error getting audit stats:', error);
    throw error;
  }
}

module.exports = {
  logActivity,
  auditMiddleware,
  queryAuditLogs,
  getAuditStats,
  ACTIVITY_CATEGORIES,
  ensureAuditLogTable
};