const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');

// Configure multer for backup uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backups/');
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `backup-${timestamp}.backup`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.backup') || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only .backup and .json files are allowed.'));
    }
  }
});

// Ensure backup directory exists
const ensureBackupDir = async () => {
  try {
    await fs.access('backups');
  } catch {
    await fs.mkdir('backups', { recursive: true });
  }
};

// Create comprehensive backup
router.post('/backup', async (req, res) => {
  try {
    await ensureBackupDir();
    
    const { description = 'Manual backup', type = 'MANUAL' } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.backup`;
    const filepath = path.join('backups', filename);

    // Create backup record first
    const backup = await prisma.backup.create({
      data: {
        filename,
        status: 'IN_PROGRESS',
        size: 0,
        createdBy: 'system', // TODO: Get from authenticated user
        description,
        type
      }
    });

    // Start backup process in background
    createBackupFile(backup.id, filepath).catch(async (error) => {
      console.error('Backup creation failed:', error);
      await prisma.backup.update({
        where: { id: backup.id },
        data: { status: 'FAILED' }
      });
    });

    res.json(backup);
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create backup file with all data
async function createBackupFile(backupId, filepath) {
  try {
    // Collect all data from database
    const backupData = {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        description: 'SIL Lab Management System Backup'
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
        analyses: await prisma.analysis.findMany(),
        results: await prisma.result.findMany(),
        auditLogs: await prisma.auditLog.findMany(),
        // Add more tables as needed
      }
    };

    // Write backup data to file
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
    
    // Get file size
    const stats = await fs.stat(filepath);
    
    // Update backup record
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: 'COMPLETED',
        size: stats.size
      }
    });

    console.log(`Backup ${backupId} created successfully: ${filepath}`);
  } catch (error) {
    console.error(`Backup ${backupId} failed:`, error);
    throw error;
  }
}

// Get all backups
router.get('/backups', async (req, res) => {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download backup file
router.get('/backup/:id/download', async (req, res) => {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: req.params.id }
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const filepath = path.join('backups', backup.filename);
    
    try {
      await fs.access(filepath);
      res.download(filepath, backup.filename);
    } catch {
      res.status(404).json({ error: 'Backup file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload backup file
router.post('/backup/upload', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file provided' });
    }

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        filename: req.file.filename,
        status: 'COMPLETED',
        size: req.file.size,
        createdBy: 'system', // TODO: Get from authenticated user
        description: 'Imported backup',
        type: 'MANUAL'
      }
    });

    res.json(backup);
  } catch (error) {
    console.error('Backup upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restore from backup
router.post('/backup/:id/restore', async (req, res) => {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: req.params.id }
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const filepath = path.join('backups', backup.filename);
    
    try {
      const backupContent = await fs.readFile(filepath, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Start restore process (this should be done carefully in production)
      await restoreFromBackup(backupData);

      res.json({ success: true, message: 'Restore completed successfully' });
    } catch (error) {
      console.error('Restore error:', error);
      res.status(500).json({ success: false, message: 'Restore failed: ' + error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore data from backup (simplified - in production, this needs more careful handling)
async function restoreFromBackup(backupData) {
  // WARNING: This is a simplified restore process
  // In production, you'd want to:
  // 1. Create a backup before restore
  // 2. Handle foreign key constraints properly
  // 3. Validate data integrity
  // 4. Handle conflicts and duplicates
  
  try {
    // Clear existing data (be very careful with this!)
    // await prisma.result.deleteMany();
    // await prisma.requestAnalysis.deleteMany();
    // await prisma.request.deleteMany();
    // ... etc
    
    // Restore data
    if (backupData.data.users) {
      for (const user of backupData.data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
    }
    
    // Continue with other tables...
    console.log('Restore completed successfully');
  } catch (error) {
    console.error('Restore process failed:', error);
    throw error;
  }
}

// Delete backup
router.delete('/backup/:id', async (req, res) => {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: req.params.id }
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Delete file
    const filepath = path.join('backups', backup.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.warn('Could not delete backup file:', error.message);
    }

    // Delete record
    await prisma.backup.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get backup statistics
router.get('/backup/stats', async (req, res) => {
  try {
    const backups = await prisma.backup.findMany({
      where: { status: 'COMPLETED' }
    });

    const totalBackups = backups.length;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const averageSize = totalBackups > 0 ? totalSize / totalBackups : 0;
    
    const lastBackup = backups.length > 0 
      ? backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;
    
    const lastBackupDate = lastBackup ? lastBackup.createdAt : null;
    const daysSinceLastBackup = lastBackupDate 
      ? Math.floor((new Date().getTime() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const oldestBackup = backups.length > 0
      ? backups.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
      : null;

    res.json({
      totalBackups,
      totalSize,
      averageSize,
      lastBackupDate,
      daysSinceLastBackup,
      oldestBackup: oldestBackup ? oldestBackup.createdAt : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get backup settings
router.get('/backup/settings', async (req, res) => {
  try {
    const cronService = require('../services/cronService');
    const settings = await cronService.getBackupSettings();
    
    if (!settings) {
      return res.status(404).json({ error: 'Backup settings not found' });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error getting backup settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update backup settings
router.put('/backup/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Validate settings
    const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
    if (settings.backupFrequency && !validFrequencies.includes(settings.backupFrequency)) {
      return res.status(400).json({ error: 'Invalid backup frequency' });
    }
    
    if (settings.retentionDays && (settings.retentionDays < 1 || settings.retentionDays > 365)) {
      return res.status(400).json({ error: 'Retention days must be between 1 and 365' });
    }
    
    // Update settings using cron service (handles job scheduling)
    const cronService = require('../services/cronService');
    const updatedSettings = await cronService.updateBackupSettings(settings);
    
    console.log('Backup settings updated successfully:', updatedSettings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating backup settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get backup job status
router.get('/backup/job-status', async (req, res) => {
  try {
    const cronService = require('../services/cronService');
    const status = cronService.getJobStatus();
    
    // Get next scheduled backup from settings
    const settings = await cronService.getBackupSettings();
    
    res.json({
      ...status,
      nextScheduledBackup: settings?.nextScheduledBackup,
      autoBackupEnabled: settings?.autoBackupEnabled,
      backupFrequency: settings?.backupFrequency
    });
  } catch (error) {
    console.error('Error getting backup job status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all cron jobs status
router.get('/cron-jobs', async (req, res) => {
  try {
    const cronService = require('../services/cronService');
    const activeJobs = cronService.getActiveJobs();
    
    // Get backup settings for additional context
    const backupSettings = await cronService.getBackupSettings();
    
    res.json({
      activeJobs,
      totalJobs: Object.keys(activeJobs).length,
      backupSettings: backupSettings ? {
        enabled: backupSettings.autoBackupEnabled,
        frequency: backupSettings.backupFrequency,
        nextScheduled: backupSettings.nextScheduledBackup
      } : null
    });
  } catch (error) {
    console.error('Error getting cron jobs status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule a custom cron job (for future extensions)
router.post('/cron-jobs', async (req, res) => {
  try {
    const { jobName, cronExpression, description } = req.body;
    
    if (!jobName || !cronExpression) {
      return res.status(400).json({ error: 'Job name and cron expression are required' });
    }
    
    const cronService = require('../services/cronService');
    
    // Example task function (in real implementation, this would be more sophisticated)
    const taskFunction = async () => {
      console.log(`Executing custom job: ${jobName} - ${description}`);
      // Custom job logic would go here
    };
    
    cronService.scheduleJob(jobName, cronExpression, taskFunction);
    
    res.json({
      message: `Job '${jobName}' scheduled successfully`,
      jobName,
      cronExpression,
      description
    });
  } catch (error) {
    console.error('Error scheduling custom job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop a specific cron job
router.delete('/cron-jobs/:jobName', async (req, res) => {
  try {
    const { jobName } = req.params;
    const cronService = require('../services/cronService');
    
    const stopped = cronService.stopJob(jobName);
    
    if (stopped) {
      res.json({ message: `Job '${jobName}' stopped successfully` });
    } else {
      res.status(404).json({ error: `Job '${jobName}' not found` });
    }
  } catch (error) {
    console.error('Error stopping job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Audit Trail endpoints
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Plugin Store endpoints
router.get('/plugins', async (req, res) => {
    try {
        const plugins = await prisma.plugin.findMany();
        res.json(plugins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/plugins/install/:id', async (req, res) => {
    try {
        const plugin = await prisma.plugin.update({
            where: { id: parseInt(req.params.id) },
            data: { installed: true }
        });
        res.json(plugin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
