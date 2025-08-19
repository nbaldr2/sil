import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Database, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../App';
import { backupService } from '../services/backupService';
import { useNavigate } from 'react-router-dom';

interface BackupReminderProps {
  onDismiss?: () => void;
}

export const BackupReminder: React.FC<BackupReminderProps> = ({ onDismiss }) => {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [reminderData, setReminderData] = useState<{
    show: boolean;
    daysSince: number;
    message: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const t = {
    fr: {
      backupReminder: 'Rappel de Sauvegarde',
      message: 'Il y a {days} jours depuis votre dernière sauvegarde. Considérez créer une sauvegarde pour protéger vos données.',
      noBackupMessage: 'Aucune sauvegarde n\'a été créée. Il est recommandé de créer une sauvegarde pour protéger vos données.',
      createBackup: 'Créer Sauvegarde',
      manageBackups: 'Gérer Sauvegardes',
      dismiss: 'Ignorer',
      critical: 'Critique',
      warning: 'Attention',
      info: 'Information',
      dataProtection: 'Protection des Données',
      lastBackup: 'Dernière sauvegarde',
      never: 'Jamais',
      daysAgo: 'il y a {days} jours'
    },
    en: {
      backupReminder: 'Backup Reminder',
      message: 'It has been {days} days since your last backup. Consider creating a backup to protect your data.',
      noBackupMessage: 'No backup has been created yet. It is recommended to create a backup to protect your data.',
      createBackup: 'Create Backup',
      manageBackups: 'Manage Backups',
      dismiss: 'Dismiss',
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
      dataProtection: 'Data Protection',
      lastBackup: 'Last backup',
      never: 'Never',
      daysAgo: '{days} days ago'
    }
  }[language];

  useEffect(() => {
    const checkBackupReminder = async () => {
      try {
        const reminder = await backupService.shouldShowBackupReminder();
        setReminderData(reminder);
      } catch (error) {
        console.error('Error checking backup reminder:', error);
        // Show default reminder if we can't check
        setReminderData({
          show: true,
          daysSince: 999,
          message: t.noBackupMessage
        });
      }
    };

    checkBackupReminder();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
    // Store dismissal in localStorage to avoid showing again today
    localStorage.setItem('backupReminderDismissed', new Date().toDateString());
  };

  const handleCreateBackup = () => {
    navigate('/config/backup');
  };

  const handleManageBackups = () => {
    navigate('/config/backup');
  };

  // Check if reminder was already dismissed today
  useEffect(() => {
    const dismissedDate = localStorage.getItem('backupReminderDismissed');
    if (dismissedDate === new Date().toDateString()) {
      setDismissed(true);
    }
  }, []);

  // Don't show if dismissed or no reminder data
  if (dismissed || !reminderData || !reminderData.show) {
    return null;
  }

  const getSeverityLevel = (daysSince: number) => {
    if (daysSince >= 90) return 'critical';
    if (daysSince >= 30) return 'warning';
    return 'info';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Database className="h-5 w-5 text-blue-600" />;
    }
  };

  const severity = getSeverityLevel(reminderData.daysSince);
  const message = reminderData.daysSince === 999 
    ? t.noBackupMessage 
    : t.message.replace('{days}', reminderData.daysSince.toString());

  return (
    <div className={`rounded-lg border p-4 mb-6 ${getSeverityColor(severity)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getSeverityIcon(severity)}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {t.backupReminder}
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50">
                {t[severity as keyof typeof t]}
              </span>
            </h3>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-sm">
              {message}
            </p>
          </div>

          <div className="mt-3 flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {t.lastBackup}: {
                  reminderData.daysSince === 999 
                    ? t.never 
                    : t.daysAgo.replace('{days}', reminderData.daysSince.toString())
                }
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              <span>{t.dataProtection}</span>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleCreateBackup}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Database className="h-4 w-4 mr-1" />
              {t.createBackup}
            </button>
            <button
              onClick={handleManageBackups}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t.manageBackups}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-gray-500 hover:text-gray-700"
            >
              {t.dismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};