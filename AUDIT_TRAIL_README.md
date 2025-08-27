# 🛡️ Comprehensive Audit Trail System

## Overview
A complete audit trail system for the SIL Lab Management System that tracks all user activities, stores logs both in files and database, and provides comprehensive reporting and analysis capabilities.

## 📁 File Structure
```
server/
├── src/
│   ├── services/
│   │   └── auditService.js          # Core audit service
│   ├── routes/
│   │   └── admin.js                 # Enhanced admin routes
│   └── index.js                     # Server with audit middleware
├── logs/
│   └── audit/
│       ├── audit.log                # General audit logs
│       └── security.log             # Security-specific logs
src/
└── components/
    └── admin/
        └── AuditTrail.tsx           # Enhanced frontend component
```

## 🚀 Features

### Backend Features
- **Automatic Activity Tracking**: Middleware automatically logs all API requests
- **File-based Logging**: Winston-powered logging to rotating files
- **Database Storage**: Audit logs stored in MySQL for fast querying
- **Activity Categories**: Organized by authentication, patient management, etc.
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL for event prioritization
- **Export Functionality**: CSV and JSON export capabilities
- **Statistics & Analytics**: Comprehensive audit statistics

### Frontend Features
- **Real-time Dashboard**: Live statistics and activity monitoring
- **Advanced Filtering**: Filter by user, action, severity, date range, etc.
- **Export Options**: Download audit logs in CSV or JSON format
- **Auto-refresh**: Optional auto-refresh every 30 seconds
- **Detailed View**: Click to view complete audit event details
- **Responsive Design**: Works on desktop and mobile devices

## 📊 Activity Categories

### Authentication & Authorization
- `USER_LOGIN` - User login events
- `USER_LOGOUT` - User logout events
- `LOGIN_FAILED` - Failed login attempts
- `PASSWORD_CHANGE` - Password changes
- `TOKEN_REFRESH` - JWT token refreshes

### Patient Management
- `PATIENT_CREATE` - New patient creation
- `PATIENT_UPDATE` - Patient information updates
- `PATIENT_DELETE` - Patient deletion
- `PATIENT_VIEW` - Patient record access
- `PATIENT_SEARCH` - Patient search activities

### Request Management
- `REQUEST_CREATE` - New analysis requests
- `REQUEST_UPDATE` - Request modifications
- `REQUEST_DELETE` - Request deletions
- `REQUEST_APPROVE` - Request approvals
- `REQUEST_REJECT` - Request rejections

### Results Management
- `RESULT_CREATE` - New result entries
- `RESULT_UPDATE` - Result modifications
- `RESULT_VALIDATE` - Result validations
- `RESULT_PRINT` - Result printing
- `RESULT_EXPORT` - Result exports

### System Administration
- `ADMIN_USER_CREATE` - User account creation
- `ADMIN_USER_UPDATE` - User account modifications
- `ADMIN_BACKUP_CREATE` - System backups
- `ADMIN_SYSTEM_CONFIG` - System configuration changes
- `ADMIN_PRICE_UPDATE` - Price management updates

### Security Events
- `SECURITY_UNAUTHORIZED_ACCESS` - Unauthorized access attempts
- `SECURITY_SUSPICIOUS_ACTIVITY` - Suspicious user behavior
- `SECURITY_DATA_BREACH_ATTEMPT` - Potential data breach attempts

## 🔧 API Endpoints

### Get Audit Logs
```
GET /api/admin/audit-logs
Query Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 20)
- search: Search term
- action: Filter by action type
- userId: Filter by user ID
- severity: Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- category: Filter by category
- startDate: Start date filter (YYYY-MM-DD)
- endDate: End date filter (YYYY-MM-DD)
- success: Filter by success status (true/false)
```

### Get Audit Statistics
```
GET /api/admin/audit-stats
Query Parameters:
- timeframe: Time period (30d, 60d, 90d, etc.)
```

### Export Audit Logs
```
GET /api/admin/audit-logs/export
Query Parameters:
- format: Export format (csv, json)
- All filters from audit-logs endpoint
```

### Initialize Audit System
```
POST /api/admin/audit/initialize
```

## 🗄️ Database Schema

The audit system automatically creates the following table:

```sql
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  timestamp DATETIME NOT NULL,
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
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_severity (severity),
  INDEX idx_category (category)
);
```

## 🛠️ Installation & Setup

### 1. Backend Setup
The audit system is automatically initialized when the server starts. The middleware is already integrated into all API routes.

### 2. Initialize Database
Visit the audit trail page and click "Initialize System" to create the database table.

### 3. Access Audit Trail
Navigate to `/config/audit` in the frontend to access the audit trail interface.

## 📝 Logging Configuration

### File Locations
- **General Logs**: `server/logs/audit/audit.log`
- **Security Logs**: `server/logs/audit/security.log`

### Log Rotation
- **Max File Size**: 10MB
- **Retention**: 30 days for general logs, 90 days for security logs
- **Format**: JSON with timestamp, user info, and activity details

## 🔍 Usage Examples

### Manual Logging
```javascript
import { auditService } from '../services/auditService';

// Log a user action
await auditService.logActivity(auditService.ACTIVITY_CATEGORIES.PATIENT.CREATE, {
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  action: 'PATIENT_CREATE',
  resourceType: 'PATIENT',
  resourceId: patient.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  newValues: { name: patient.name, dateOfBirth: patient.dob },
  metadata: { department: 'Laboratory' }
});
```

### Query Logs
```javascript
// Get recent failed login attempts
const failedLogins = await auditService.queryAuditLogs({
  action: 'LOGIN_FAILED',
  startDate: '2024-01-01',
  severity: 'HIGH',
  limit: 100
});
```

## 🔐 Security Features

### Data Protection
- **IP Address Tracking**: All activities include source IP
- **User Agent Logging**: Browser/client information stored
- **Tamper Prevention**: Logs are append-only with timestamps
- **Access Control**: Only admin users can view audit logs

### Compliance
- **GDPR Ready**: User data handling with privacy considerations
- **HIPAA Compatible**: Healthcare data audit requirements
- **ISO 27001**: Information security management standards

## 📈 Performance Considerations

### Database Optimization
- **Indexed Columns**: timestamp, user_id, action, severity
- **Partitioning**: Consider partitioning by date for large datasets
- **Archiving**: Implement log archiving for older entries

### File System
- **Log Rotation**: Automatic rotation prevents disk space issues
- **Compression**: Old logs are automatically compressed
- **Monitoring**: Monitor disk space usage in logs directory

## 🚨 Monitoring & Alerts

### Critical Events
- Failed login attempts (3+ in 5 minutes)
- Unauthorized access attempts
- System configuration changes
- Data export activities
- Bulk data modifications

### Recommended Alerts
- High number of failed events
- Unusual activity patterns
- Security-related events
- System administration actions

## 🔧 Troubleshooting

### Common Issues

**Logs not appearing:**
1. Check database connection
2. Verify audit table exists
3. Ensure proper permissions
4. Check server logs for errors

**Performance issues:**
1. Check database indexes
2. Monitor log file sizes
3. Consider archiving old logs
4. Optimize query filters

**Missing user information:**
1. Verify authentication middleware
2. Check token validation
3. Ensure user context is passed

## 📋 Best Practices

### For Administrators
1. **Regular Review**: Review audit logs daily for security
2. **Filter Usage**: Use filters to focus on relevant events
3. **Export Logs**: Regular exports for compliance
4. **Monitor Trends**: Watch for unusual activity patterns

### For Developers
1. **Consistent Logging**: Use predefined activity categories
2. **Include Context**: Add relevant metadata to logs
3. **Error Handling**: Always log failed operations
4. **Performance**: Be mindful of logging overhead

## 🎯 Future Enhancements

### Planned Features
- **Real-time Alerts**: Email/SMS notifications for critical events
- **Advanced Analytics**: Machine learning for anomaly detection
- **Integration**: SIEM integration capabilities
- **Reporting**: Automated compliance reports
- **API Keys**: Audit trail for API access
- **Geolocation**: IP-based location tracking

---

**Access the Audit Trail**: Navigate to `/config/audit` to start monitoring your system activities! 🚀