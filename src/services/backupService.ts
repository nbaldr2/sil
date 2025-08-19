// Backup Service for SIL Lab Management System
const API_BASE_URL = 'http://localhost:5001/api';

export interface BackupData {
  id: string;
  filename: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  size: number;
  createdBy: string;
  createdAt: string;
  type: 'MANUAL' | 'AUTOMATIC';
  description?: string;
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  retentionDays: number;
  includeFiles: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  lastBackupDate?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackupDate: string | null;
  daysSinceLastBackup: number;
  oldestBackup: string | null;
  averageSize: number;
}

class BackupService {
  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.error(`Backup API Error: ${response.status} ${response.statusText} for ${url}`);
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Backup Network Error for ${url}:`, error);
      throw error;
    }
  }

  // Get all backups
  async getBackups(): Promise<BackupData[]> {
    return this.apiRequest('/admin/backups');
  }

  // Create a new backup
  async createBackup(description?: string): Promise<BackupData> {
    return this.apiRequest('/admin/backup', {
      method: 'POST',
      body: JSON.stringify({
        description: description || 'Manual backup',
        type: 'MANUAL'
      })
    });
  }

  // Download backup file
  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/backup/${backupId}/download`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return response.blob();
  }

  // Upload and restore backup
  async uploadBackup(file: File, onProgress?: (progress: number) => void): Promise<BackupData> {
    const formData = new FormData();
    formData.append('backup', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/admin/backup/upload`);
      xhr.send(formData);
    });
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    return this.apiRequest(`/admin/backup/${backupId}/restore`, {
      method: 'POST'
    });
  }

  // Delete backup
  async deleteBackup(backupId: string): Promise<void> {
    return this.apiRequest(`/admin/backup/${backupId}`, {
      method: 'DELETE'
    });
  }

  // Get backup settings
  async getBackupSettings(): Promise<BackupSettings> {
    return this.apiRequest('/admin/backup/settings');
  }

  // Update backup settings
  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<BackupSettings> {
    return this.apiRequest('/admin/backup/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Get backup statistics
  async getBackupStats(): Promise<BackupStats> {
    return this.apiRequest('/admin/backup/stats');
  }

  // Get backup job status
  async getJobStatus(): Promise<any> {
    return this.apiRequest('/admin/backup/job-status');
  }

  // Check if backup reminder should be shown
  async shouldShowBackupReminder(): Promise<{ show: boolean; daysSince: number; message: string }> {
    try {
      const stats = await this.getBackupStats();
      const daysSince = stats.daysSinceLastBackup;
      
      if (daysSince >= 30) {
        return {
          show: true,
          daysSince,
          message: `It's been ${daysSince} days since your last backup. Consider creating a backup to protect your data.`
        };
      }
      
      return {
        show: false,
        daysSince,
        message: ''
      };
    } catch (error) {
      console.error('Error checking backup reminder:', error);
      return {
        show: true,
        daysSince: 999,
        message: 'Unable to check backup status. Consider creating a backup to protect your data.'
      };
    }
  }

  // Validate backup file
  async validateBackupFile(file: File): Promise<{ valid: boolean; error?: string; info?: any }> {
    try {
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        return { valid: false, error: 'Backup file is too large (max 500MB)' };
      }

      // Check file extension
      if (!file.name.endsWith('.backup') && !file.name.endsWith('.json')) {
        return { valid: false, error: 'Invalid file format. Expected .backup or .json file' };
      }

      // For JSON files, try to parse and validate structure
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Basic validation of backup structure
        if (!data.metadata || !data.data) {
          return { valid: false, error: 'Invalid backup file structure' };
        }

        return {
          valid: true,
          info: {
            version: data.metadata.version,
            createdAt: data.metadata.createdAt,
            size: file.size,
            tables: Object.keys(data.data).length
          }
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Unable to validate backup file' };
    }
  }

  // Format file size
  formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return size.toFixed(2) + ' ' + sizes[i];
  }

  // Format backup age
  formatBackupAge(date: string): string {
    const now = new Date();
    const backupDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - backupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

export const backupService = new BackupService();