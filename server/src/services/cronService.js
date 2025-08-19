const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CronService {
  constructor() {
    this.jobs = new Map(); // Store active cron jobs
    this.initializeBackupJobs();
    this.initializeQCReminderJobs();
  }

  // Initialize backup jobs on service start
  async initializeBackupJobs() {
    try {
      const settings = await this.getBackupSettings();
      if (settings && settings.autoBackupEnabled) {
        await this.scheduleBackupJob(settings);
      }
    } catch (error) {
      console.error('Error initializing backup jobs:', error);
    }
  }

  // Get backup settings from database
  async getBackupSettings() {
    try {
      let settings = await prisma.backupSettings.findFirst();
      
      // Create default settings if none exist
      if (!settings) {
        settings = await prisma.backupSettings.create({
          data: {
            autoBackupEnabled: false,
            backupFrequency: 'WEEKLY',
            retentionDays: 30,
            includeFiles: true,
            compressionEnabled: true,
            encryptionEnabled: false
          }
        });
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting backup settings:', error);
      return null;
    }
  }

  // Update backup settings and reschedule jobs
  async updateBackupSettings(newSettings) {
    try {
      // Stop existing backup job
      await this.stopBackupJob();

      // Update settings in database
      let settings = await prisma.backupSettings.findFirst();
      
      if (settings) {
        settings = await prisma.backupSettings.update({
          where: { id: settings.id },
          data: {
            ...newSettings,
            updatedAt: new Date()
          }
        });
      } else {
        settings = await prisma.backupSettings.create({
          data: newSettings
        });
      }

      // Schedule new job if auto backup is enabled
      if (settings.autoBackupEnabled) {
        await this.scheduleBackupJob(settings);
      }

      return settings;
    } catch (error) {
      console.error('Error updating backup settings:', error);
      throw error;
    }
  }

  // Schedule backup job based on frequency
  async scheduleBackupJob(settings) {
    try {
      // Stop existing job first
      await this.stopBackupJob();

      const cronExpression = this.getCronExpression(settings.backupFrequency);
      const jobId = `backup-${Date.now()}`;

      console.log(`Scheduling backup job with frequency: ${settings.backupFrequency}, cron: ${cronExpression}`);

      const job = cron.schedule(cronExpression, async () => {
        console.log('Executing scheduled backup...');
        await this.executeAutomaticBackup(settings);
      }, {
        scheduled: true,
        timezone: "UTC"
      });

      // Store job reference
      this.jobs.set('backup', job);

      // Update settings with job ID
      await prisma.backupSettings.update({
        where: { id: settings.id },
        data: {
          cronJobId: jobId,
          nextScheduledBackup: this.calculateNextBackupDate(settings.backupFrequency)
        }
      });

      console.log(`Backup job scheduled successfully with ID: ${jobId}`);
      return jobId;
    } catch (error) {
      console.error('Error scheduling backup job:', error);
      throw error;
    }
  }

  // Stop backup job
  async stopBackupJob() {
    try {
      const job = this.jobs.get('backup');
      if (job) {
        job.stop();
        job.destroy();
        this.jobs.delete('backup');
        console.log('Backup job stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping backup job:', error);
    }
  }

  // Execute automatic backup
  async executeAutomaticBackup(settings) {
    try {
      console.log('Starting automatic backup...');
      
      // Import backup creation function
      const { createBackupFile } = require('../routes/admin');
      const path = require('path');
      const fs = require('fs').promises;

      // Ensure backup directory exists
      try {
        await fs.access('backups');
      } catch {
        await fs.mkdir('backups', { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-auto-${timestamp}.backup`;
      const filepath = path.join('backups', filename);

      // Create backup record
      const backup = await prisma.backup.create({
        data: {
          filename,
          status: 'IN_PROGRESS',
          size: 0,
          createdBy: 'system-auto',
          description: `Automatic backup - ${settings.backupFrequency}`,
          type: 'AUTOMATIC'
        }
      });

      // Create backup file
      await this.createBackupFile(backup.id, filepath);

      // Update last backup date
      await prisma.backupSettings.update({
        where: { id: settings.id },
        data: {
          lastBackupDate: new Date(),
          nextScheduledBackup: this.calculateNextBackupDate(settings.backupFrequency)
        }
      });

      // Clean old backups based on retention policy
      await this.cleanOldBackups(settings.retentionDays);

      console.log('Automatic backup completed successfully');
    } catch (error) {
      console.error('Error executing automatic backup:', error);
    }
  }

  // Create backup file (simplified version)
  async createBackupFile(backupId, filepath) {
    try {
      const backupData = {
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          description: 'SIL Lab Management System Automatic Backup',
          type: 'AUTOMATIC'
        },
        data: {
          users: await prisma.user.findMany(),
          patients: await prisma.patient.findMany(),
          doctors: await prisma.doctor.findMany(),
          requests: await prisma.request.findMany({
            include: {
              requestAnalyses: {
                include: { analysis: true }
              }
            }
          }),
          results: await prisma.result.findMany(),
          analyses: await prisma.analysis.findMany(),
          products: await prisma.product.findMany(),
          suppliers: await prisma.supplier.findMany(),
          stockEntries: await prisma.stockEntry.findMany(),
          stockOuts: await prisma.stockOut.findMany(),
          orders: await prisma.order.findMany({
            include: { orderItems: true }
          }),
          systemConfig: await prisma.systemConfig.findMany(),
          modules: await prisma.module.findMany(),
          moduleLicenses: await prisma.moduleLicense.findMany()
        }
      };

      // Write backup data to file
      const fs = require('fs').promises;
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));

      // Get file size
      const stats = await fs.stat(filepath);
      const fileSize = stats.size;

      // Update backup record
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'COMPLETED',
          size: fileSize
        }
      });

      console.log(`Backup file created: ${filepath} (${fileSize} bytes)`);
    } catch (error) {
      console.error('Error creating backup file:', error);
      
      // Update backup record as failed
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: 'FAILED' }
      });
      
      throw error;
    }
  }

  // Clean old backups based on retention policy
  async cleanOldBackups(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldBackups = await prisma.backup.findMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          type: 'AUTOMATIC' // Only clean automatic backups
        }
      });

      const fs = require('fs').promises;
      const path = require('path');

      for (const backup of oldBackups) {
        try {
          // Delete file
          const filepath = path.join('backups', backup.filename);
          await fs.unlink(filepath);
          
          // Delete database record
          await prisma.backup.delete({
            where: { id: backup.id }
          });
          
          console.log(`Cleaned old backup: ${backup.filename}`);
        } catch (error) {
          console.error(`Error cleaning backup ${backup.filename}:`, error);
        }
      }

      if (oldBackups.length > 0) {
        console.log(`Cleaned ${oldBackups.length} old backups`);
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Get cron expression based on frequency
  getCronExpression(frequency) {
    switch (frequency) {
      case 'DAILY':
        return '0 2 * * *'; // Every day at 2 AM
      case 'WEEKLY':
        return '0 2 * * 0'; // Every Sunday at 2 AM
      case 'MONTHLY':
        return '0 2 1 * *'; // First day of every month at 2 AM
      default:
        return '0 2 * * 0'; // Default to weekly
    }
  }

  // Calculate next backup date
  calculateNextBackupDate(frequency) {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'DAILY':
        next.setDate(now.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(now.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(now.getMonth() + 1);
        break;
      default:
        next.setDate(now.getDate() + 7);
    }

    // Set time to 2 AM
    next.setHours(2, 0, 0, 0);
    return next;
  }

  // Get job status
  getJobStatus() {
    return {
      backupJobActive: this.jobs.has('backup'),
      totalJobs: this.jobs.size
    };
  }

  // Initialize QC reminder jobs (example of extending the cron system)
  async initializeQCReminderJobs() {
    try {
      // Schedule daily QC reminders at 8 AM
      const qcReminderJob = cron.schedule('0 8 * * *', async () => {
        console.log('Executing QC reminder check...');
        await this.checkQCReminders();
      }, {
        scheduled: true,
        timezone: "UTC"
      });

      this.jobs.set('qc-reminder', qcReminderJob);
      console.log('QC reminder job scheduled successfully');
    } catch (error) {
      console.error('Error initializing QC reminder jobs:', error);
    }
  }

  // Check and send QC reminders
  async checkQCReminders() {
    try {
      // Example: Check for QC results that are overdue
      const overdueQC = await prisma.qualityControlResult.findMany({
        where: {
          timestamp: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
          },
          status: 'fail'
        },
        include: {
          automate: true
        }
      });

      if (overdueQC.length > 0) {
        console.log(`Found ${overdueQC.length} overdue QC results`);
        // Here you could send notifications, emails, etc.
        // For now, just log the information
        overdueQC.forEach(qc => {
          console.log(`QC Alert: ${qc.automate.name} - ${qc.testName} failed QC check`);
        });
      }
    } catch (error) {
      console.error('Error checking QC reminders:', error);
    }
  }

  // Generic method to schedule any cron job
  scheduleJob(jobName, cronExpression, taskFunction, options = {}) {
    try {
      // Stop existing job if it exists
      this.stopJob(jobName);

      const job = cron.schedule(cronExpression, taskFunction, {
        scheduled: true,
        timezone: options.timezone || "UTC",
        ...options
      });

      this.jobs.set(jobName, job);
      console.log(`Scheduled job '${jobName}' with expression: ${cronExpression}`);
      return job;
    } catch (error) {
      console.error(`Error scheduling job '${jobName}':`, error);
      throw error;
    }
  }

  // Stop a specific job
  stopJob(jobName) {
    try {
      const job = this.jobs.get(jobName);
      if (job) {
        job.stop();
        job.destroy();
        this.jobs.delete(jobName);
        console.log(`Stopped job: ${jobName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error stopping job '${jobName}':`, error);
      return false;
    }
  }

  // Get all active jobs
  getActiveJobs() {
    const jobs = {};
    for (const [name, job] of this.jobs) {
      jobs[name] = {
        name,
        running: job.running || false,
        scheduled: true
      };
    }
    return jobs;
  }

  // Stop all jobs (for graceful shutdown)
  async stopAllJobs() {
    try {
      for (const [name, job] of this.jobs) {
        job.stop();
        job.destroy();
        console.log(`Stopped cron job: ${name}`);
      }
      this.jobs.clear();
    } catch (error) {
      console.error('Error stopping cron jobs:', error);
    }
  }
}

// Create singleton instance
const cronService = new CronService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Stopping cron jobs...');
  await cronService.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Stopping cron jobs...');
  await cronService.stopAllJobs();
  process.exit(0);
});

module.exports = cronService;