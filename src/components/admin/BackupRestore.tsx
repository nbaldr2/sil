import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Shield,
  Calendar,
  HardDrive,
  FileText,
  Plus,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '../../App';
import { backupService, BackupData, BackupSettings, BackupStats } from '../../services/backupService';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';

export const BackupRestore = () => {
  const { language } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  
  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupData | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const t = {
    fr: {
      title: 'Sauvegarde et Restauration',
      subtitle: 'Gérez vos sauvegardes système',
      createBackup: 'Créer Sauvegarde',
      uploadBackup: 'Importer Sauvegarde',
      settings: 'Paramètres',
      refresh: 'Actualiser',
      noBackups: 'Aucune sauvegarde disponible',
      date: 'Date',
      size: 'Taille',
      status: 'Statut',
      type: 'Type',
      actions: 'Actions',
      download: 'Télécharger',
      restore: 'Restaurer',
      delete: 'Supprimer',
      manual: 'Manuel',
      automatic: 'Automatique',
      completed: 'Terminé',
      failed: 'Échoué',
      pending: 'En attente',
      inProgress: 'En cours',
      creating: 'Création...',
      uploading: 'Téléchargement...',
      restoring: 'Restauration...',
      deleting: 'Suppression...',
      description: 'Description',
      descriptionPlaceholder: 'Description de la sauvegarde (optionnel)',
      create: 'Créer',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Enregistrer',
      backupStats: 'Statistiques des Sauvegardes',
      totalBackups: 'Total Sauvegardes',
      totalSize: 'Taille Totale',
      lastBackup: 'Dernière Sauvegarde',
      averageSize: 'Taille Moyenne',
      daysSince: 'jours depuis',
      never: 'Jamais',
      backupSettings: 'Paramètres de Sauvegarde',
      autoBackup: 'Sauvegarde Automatique',
      frequency: 'Fréquence',
      retention: 'Rétention (jours)',
      includeFiles: 'Inclure les Fichiers',
      compression: 'Compression',
      encryption: 'Chiffrement',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette sauvegarde?',
      confirmRestore: 'Êtes-vous sûr de vouloir restaurer cette sauvegarde? Cette action remplacera toutes les données actuelles.',
      uploadSuccess: 'Sauvegarde importée avec succès',
      createSuccess: 'Sauvegarde créée avec succès',
      restoreSuccess: 'Restauration terminée avec succès',
      deleteSuccess: 'Sauvegarde supprimée avec succès',
      settingsSuccess: 'Paramètres sauvegardés avec succès',
      selectFile: 'Sélectionner un fichier de sauvegarde',
      dragDrop: 'Glissez-déposez un fichier de sauvegarde ici',
      fileFormats: 'Formats supportés: .backup, .json',
      maxSize: 'Taille max: 500MB',
      validating: 'Validation du fichier...',
      invalidFile: 'Fichier de sauvegarde invalide',
      reminder: 'Rappel de Sauvegarde',
      reminderMessage: 'Il y a {days} jours depuis votre dernière sauvegarde. Considérez créer une sauvegarde pour protéger vos données.',
      cronJobStatus: 'Statut du Job Automatique',
      jobActive: 'Actif',
      jobInactive: 'Inactif',
      nextBackup: 'Prochaine Sauvegarde',
      cronJobInfo: 'Informations du Job Cron',
      saving: 'Sauvegarde...'
    },
    en: {
      title: 'Backup & Restore',
      subtitle: 'Manage your system backups',
      createBackup: 'Create Backup',
      uploadBackup: 'Import Backup',
      settings: 'Settings',
      refresh: 'Refresh',
      noBackups: 'No backups available',
      date: 'Date',
      size: 'Size',
      status: 'Status',
      type: 'Type',
      actions: 'Actions',
      download: 'Download',
      restore: 'Restore',
      delete: 'Delete',
      manual: 'Manual',
      automatic: 'Automatic',
      completed: 'Completed',
      failed: 'Failed',
      pending: 'Pending',
      inProgress: 'In Progress',
      creating: 'Creating...',
      uploading: 'Uploading...',
      restoring: 'Restoring...',
      deleting: 'Deleting...',
      description: 'Description',
      descriptionPlaceholder: 'Backup description (optional)',
      create: 'Create',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      backupStats: 'Backup Statistics',
      totalBackups: 'Total Backups',
      totalSize: 'Total Size',
      lastBackup: 'Last Backup',
      averageSize: 'Average Size',
      daysSince: 'days since',
      never: 'Never',
      backupSettings: 'Backup Settings',
      autoBackup: 'Auto Backup',
      frequency: 'Frequency',
      retention: 'Retention (days)',
      includeFiles: 'Include Files',
      compression: 'Compression',
      encryption: 'Encryption',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      confirmDelete: 'Are you sure you want to delete this backup?',
      confirmRestore: 'Are you sure you want to restore this backup? This will replace all current data.',
      uploadSuccess: 'Backup imported successfully',
      createSuccess: 'Backup created successfully',
      restoreSuccess: 'Restore completed successfully',
      deleteSuccess: 'Backup deleted successfully',
      settingsSuccess: 'Settings saved successfully',
      selectFile: 'Select backup file',
      dragDrop: 'Drag and drop a backup file here',
      fileFormats: 'Supported formats: .backup, .json',
      maxSize: 'Max size: 500MB',
      validating: 'Validating file...',
      invalidFile: 'Invalid backup file',
      reminder: 'Backup Reminder',
      reminderMessage: 'It has been {days} days since your last backup. Consider creating a backup to protect your data.',
      cronJobStatus: 'Automatic Job Status',
      jobActive: 'Active',
      jobInactive: 'Inactive',
      nextBackup: 'Next Backup',
      cronJobInfo: 'Cron Job Information',
      saving: 'Saving...'
    }
  }[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [backupsData, statsData, settingsData, jobStatusData] = await Promise.all([
        backupService.getBackups(),
        backupService.getBackupStats(),
        backupService.getBackupSettings(),
        backupService.getJobStatus()
      ]);
      
      setBackups(backupsData);
      setStats(statsData);
      setSettings(settingsData);
      setJobStatus(jobStatusData);
    } catch (error) {
      console.error('Error loading backup data:', error);
      setError('Failed to load backup data');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    setError('');
    try {
      await backupService.createBackup(backupDescription);
      setSuccess(t.createSuccess);
      setShowCreateModal(false);
      setBackupDescription('');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      // Validate file first
      const validation = await backupService.validateBackupFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      await backupService.uploadBackup(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setSuccess(t.uploadSuccess);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to upload backup');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (backup: BackupData) => {
    try {
      const blob = await backupService.downloadBackup(backup.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError(error.message || 'Failed to download backup');
    }
  };

  const handleRestore = (backup: BackupData) => {
    setSelectedBackup(backup);
    setShowRestoreConfirm(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackup) return;
    
    setConfirmLoading(true);
    setError('');
    try {
      const result = await backupService.restoreBackup(selectedBackup.id);
      if (result.success) {
        setSuccess(t.restoreSuccess);
        setShowRestoreConfirm(false);
        setSelectedBackup(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to restore backup');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = (backup: BackupData) => {
    setSelectedBackup(backup);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedBackup) return;
    
    setConfirmLoading(true);
    try {
      await backupService.deleteBackup(selectedBackup.id);
      setSuccess(t.deleteSuccess);
      setShowDeleteConfirm(false);
      setSelectedBackup(null);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete backup');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setLoading(true);
    setError('');
    
    try {
      await backupService.updateBackupSettings(settings);
      setSuccess(t.settingsSuccess);
      setShowSettings(false);
      await loadData(); // Reload data to get updated job status
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-600" />;
      case 'FAILED': return <AlertTriangle size={16} className="text-red-600" />;
      case 'IN_PROGRESS': return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus size={20} className="mr-2" />
              {t.createBackup}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Upload size={20} className="mr-2" />
              {t.uploadBackup}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Settings size={20} className="mr-2" />
              {t.settings}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span>{t.uploading}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalBackups}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBackups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalSize}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backupService.formatSize(stats.totalSize)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.lastBackup}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.lastBackupDate ? backupService.formatBackupAge(stats.lastBackupDate) : t.never}
                </p>
                {stats.daysSinceLastBackup > 0 && (
                  <p className="text-sm text-gray-500">
                    {stats.daysSinceLastBackup} {t.daysSince}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.averageSize}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backupService.formatSize(stats.averageSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Cron Job Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.cronJobStatus}</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    jobStatus?.backupJobActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {jobStatus?.backupJobActive ? t.jobActive : t.jobInactive}
                  </span>
                </div>
                {jobStatus?.nextScheduledBackup && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.nextBackup}: {new Date(jobStatus.nextScheduledBackup).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.title}</h3>
        </div>
        
        {backups.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t.noBackups}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.size}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.type}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.description}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(backup.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {backupService.formatSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                          {t[backup.status.toLowerCase() as keyof typeof t] || backup.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {t[backup.type?.toLowerCase() as keyof typeof t] || backup.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {backup.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {backup.status === 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => handleDownload(backup)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t.download}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleRestore(backup)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              title={t.restore}
                            >
                              <RefreshCw size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(backup)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t.delete}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".backup,.json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
        className="hidden"
      />

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.createBackup}
              </h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.description}
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? t.creating : t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && settings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.backupSettings}
              </h3>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.autoBackup}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable automatic backups
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoBackupEnabled}
                  onChange={(e) => setSettings({...settings, autoBackupEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.frequency}
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="DAILY">{t.daily}</option>
                  <option value="WEEKLY">{t.weekly}</option>
                  <option value="MONTHLY">{t.monthly}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.retention}
                </label>
                <input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="365"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.includeFiles}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Include uploaded files in backup
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeFiles}
                  onChange={(e) => setSettings({...settings, includeFiles: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.compression}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compress backup files
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compressionEnabled}
                  onChange={(e) => setSettings({...settings, compressionEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.encryption}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Encrypt backup files
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.encryptionEnabled}
                  onChange={(e) => setSettings({...settings, encryptionEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>

              {/* Cron Job Information */}
              {settings.autoBackupEnabled && jobStatus && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t.cronJobInfo}
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p>Status: {jobStatus.backupJobActive ? t.jobActive : t.jobInactive}</p>
                    {jobStatus.nextScheduledBackup && (
                      <p>{t.nextBackup}: {new Date(jobStatus.nextScheduledBackup).toLocaleString()}</p>
                    )}
                    <p>Frequency: {settings.backupFrequency}</p>
                    <p>Retention: {settings.retentionDays} days</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading && <RefreshCw size={16} className="mr-2 animate-spin" />}
                {loading ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedBackup(null);
        }}
        onConfirm={confirmDelete}
        title={language === 'fr' ? 'Supprimer la sauvegarde' : 'Delete Backup'}
        message={t.confirmDelete}
        confirmText={t.delete}
        cancelText={t.cancel}
        type="danger"
        loading={confirmLoading}
      />

      <ConfirmationDialog
        isOpen={showRestoreConfirm}
        onClose={() => {
          setShowRestoreConfirm(false);
          setSelectedBackup(null);
        }}
        onConfirm={confirmRestore}
        title={language === 'fr' ? 'Restaurer la sauvegarde' : 'Restore Backup'}
        message={t.confirmRestore}
        confirmText={t.restore}
        cancelText={t.cancel}
        type="warning"
        loading={confirmLoading}
      />
    </div>
  );
};
