# Cron System Usage Guide - SIL Lab Management System

## 🎯 Overview
The SIL Lab Management System now includes a comprehensive cron job system that can be used for various scheduled tasks. The system is built around the `cronService` and provides both backup automation and extensibility for other scheduled operations.

## 🏗️ System Architecture

### Core Components
1. **CronService** (`/server/src/services/cronService.js`) - Main service managing all cron jobs
2. **Database Integration** - Settings stored in `BackupSettings` table
3. **API Endpoints** - RESTful endpoints for managing jobs
4. **Frontend Integration** - UI components for monitoring and configuration

## 📋 Current Scheduled Jobs

### 1. Backup Jobs
- **Purpose**: Automatic database backups
- **Schedule**: Configurable (Daily/Weekly/Monthly)
- **Management**: Through UI settings modal
- **Status**: Active when auto-backup is enabled

### 2. QC Reminder Jobs
- **Purpose**: Quality control reminders and alerts
- **Schedule**: Daily at 8 AM UTC
- **Function**: Checks for failed QC results and sends alerts
- **Status**: Always active

### 3. Custom Jobs
- **Purpose**: Extensible system for future scheduled tasks
- **Schedule**: Configurable via API
- **Management**: Through API endpoints
- **Status**: On-demand creation

## 🔧 API Endpoints

### Get All Cron Jobs
```bash
GET /api/admin/cron-jobs
```
**Response:**
```json
{
  "activeJobs": {
    "backup": {
      "name": "backup",
      "running": false,
      "scheduled": true
    },
    "qc-reminder": {
      "name": "qc-reminder", 
      "running": false,
      "scheduled": true
    }
  },
  "totalJobs": 2,
  "backupSettings": {
    "enabled": true,
    "frequency": "DAILY",
    "nextScheduled": "2025-08-19T02:00:00.000Z"
  }
}
```

### Schedule Custom Job
```bash
POST /api/admin/cron-jobs
Content-Type: application/json

{
  "jobName": "custom-task",
  "cronExpression": "0 9 * * 1",
  "description": "Weekly task every Monday at 9 AM"
}
```

### Stop Specific Job
```bash
DELETE /api/admin/cron-jobs/{jobName}
```

### Get Backup Job Status
```bash
GET /api/admin/backup/job-status
```

## 🚀 How to Extend the System

### 1. Adding New Scheduled Tasks

#### Step 1: Define the Task Function
```javascript
// In cronService.js
async executeCustomTask() {
  try {
    console.log('Executing custom task...');
    
    // Your custom logic here
    const results = await prisma.someModel.findMany({
      where: { /* your conditions */ }
    });
    
    // Process results
    results.forEach(result => {
      // Handle each result
    });
    
    console.log('Custom task completed successfully');
  } catch (error) {
    console.error('Error in custom task:', error);
  }
}
```

#### Step 2: Initialize the Job
```javascript
// In cronService.js constructor or initialization method
async initializeCustomJobs() {
  try {
    const customJob = cron.schedule('0 10 * * *', async () => {
      console.log('Running custom job...');
      await this.executeCustomTask();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.jobs.set('custom-task', customJob);
    console.log('Custom job scheduled successfully');
  } catch (error) {
    console.error('Error initializing custom job:', error);
  }
}
```

#### Step 3: Add to Constructor
```javascript
constructor() {
  this.jobs = new Map();
  this.initializeBackupJobs();
  this.initializeQCReminderJobs();
  this.initializeCustomJobs(); // Add your new job
}
```

### 2. Common Cron Expressions

| Expression | Description |
|------------|-------------|
| `0 2 * * *` | Daily at 2 AM |
| `0 2 * * 0` | Weekly on Sunday at 2 AM |
| `0 2 1 * *` | Monthly on 1st day at 2 AM |
| `*/15 * * * *` | Every 15 minutes |
| `0 9 * * 1-5` | Weekdays at 9 AM |
| `0 0 1 1 *` | Yearly on January 1st |

### 3. Best Practices

#### Error Handling
```javascript
async executeTask() {
  try {
    // Task logic
  } catch (error) {
    console.error('Task failed:', error);
    // Optional: Send notifications, log to database, etc.
  }
}
```

#### Database Operations
```javascript
async databaseTask() {
  try {
    // Use transactions for multiple operations
    await prisma.$transaction(async (tx) => {
      await tx.model1.update({...});
      await tx.model2.create({...});
    });
  } catch (error) {
    console.error('Database task failed:', error);
  }
}
```

#### Resource Management
```javascript
async resourceIntensiveTask() {
  try {
    // Limit concurrent operations
    const batchSize = 100;
    const items = await prisma.items.findMany();
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processBatch(batch);
      
      // Optional: Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Resource intensive task failed:', error);
  }
}
```

## 📊 Monitoring and Debugging

### 1. Check Active Jobs
```bash
curl -X GET http://localhost:5001/api/admin/cron-jobs
```

### 2. Server Logs
The cron service logs all activities:
- Job scheduling/stopping
- Task execution
- Error messages
- Performance metrics

### 3. Database Monitoring
Monitor the `BackupSettings` table for backup job configurations:
```sql
SELECT * FROM backup_settings;
```

## 🔄 Common Use Cases

### 1. Data Cleanup Jobs
```javascript
// Clean old audit logs
async cleanupAuditLogs() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months ago
  
  await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  });
}
```

### 2. Report Generation
```javascript
// Generate monthly reports
async generateMonthlyReports() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const reports = await generateReports(startOfMonth);
  // Save or email reports
}
```

### 3. System Health Checks
```javascript
// Check system health
async systemHealthCheck() {
  const checks = {
    database: await checkDatabaseConnection(),
    storage: await checkStorageSpace(),
    services: await checkExternalServices()
  };
  
  if (checks.database === false) {
    // Send alert
  }
}
```

### 4. Notification Systems
```javascript
// Send reminder notifications
async sendReminders() {
  const overdueItems = await prisma.items.findMany({
    where: {
      dueDate: { lt: new Date() },
      notified: false
    }
  });
  
  for (const item of overdueItems) {
    await sendNotification(item);
    await prisma.items.update({
      where: { id: item.id },
      data: { notified: true }
    });
  }
}
```

## 🛡️ Security Considerations

### 1. Access Control
- Cron job management endpoints should be protected
- Only admin users should be able to schedule/stop jobs
- Validate cron expressions to prevent malicious input

### 2. Resource Limits
- Set timeouts for long-running tasks
- Implement rate limiting for job creation
- Monitor system resources during job execution

### 3. Error Handling
- Never expose sensitive information in error messages
- Log errors securely
- Implement graceful degradation

## 🔧 Troubleshooting

### Common Issues

#### 1. Jobs Not Running
- Check if cron service is initialized
- Verify cron expressions are valid
- Check server logs for errors

#### 2. Database Connection Issues
- Ensure Prisma client is properly initialized
- Check database connection in job functions
- Implement connection retry logic

#### 3. Memory Leaks
- Properly clean up resources in job functions
- Monitor memory usage during job execution
- Implement garbage collection hints for large operations

### Debug Commands
```bash
# Check all active jobs
curl -X GET http://localhost:5001/api/admin/cron-jobs

# Check backup settings
curl -X GET http://localhost:5001/api/admin/backup/settings

# Check server health
curl -X GET http://localhost:5001/api/health
```

## 📈 Performance Optimization

### 1. Batch Processing
- Process large datasets in batches
- Use database transactions efficiently
- Implement progress tracking

### 2. Caching
- Cache frequently accessed data
- Use Redis for distributed caching
- Implement cache invalidation strategies

### 3. Monitoring
- Track job execution times
- Monitor resource usage
- Set up alerts for failed jobs

## 🎯 Future Enhancements

### Planned Features
1. **Web UI for Job Management** - Visual interface for managing all cron jobs
2. **Job Dependencies** - Support for job chains and dependencies
3. **Retry Mechanisms** - Automatic retry for failed jobs
4. **Email Notifications** - Email alerts for job failures
5. **Job History** - Track execution history and performance metrics
6. **Dynamic Scheduling** - Modify job schedules without server restart

### Integration Opportunities
1. **Quality Control Automation** - Automated QC result processing
2. **Inventory Management** - Stock level monitoring and reordering
3. **Report Automation** - Scheduled report generation and distribution
4. **Data Synchronization** - Sync with external systems
5. **Maintenance Tasks** - Database optimization and cleanup

## ✅ Summary

The cron system is now fully implemented and ready for use. Key achievements:

1. ✅ **Backup Automation** - Fully functional with UI configuration
2. ✅ **Database Integration** - Settings persisted in database
3. ✅ **Extensible Architecture** - Easy to add new scheduled tasks
4. ✅ **API Management** - RESTful endpoints for job management
5. ✅ **Error Handling** - Robust error handling and logging
6. ✅ **Production Ready** - Graceful shutdown and resource management

The system provides a solid foundation for all scheduled operations in the SIL Lab Management System and can be easily extended for future requirements.