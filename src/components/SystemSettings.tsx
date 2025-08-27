import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings,
  Building2,
  User,
  Award,
  DollarSign,
  Printer,
  Bell,
  Globe,
  Shield,
  Database,
  Zap,
  Upload,
  Download,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../App';

interface SystemConfig {
  id?: string;
  // Laboratory Information
  labName: string;
  labCode?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  fax?: string;
  
  // Director/Manager Information
  directorName?: string;
  directorTitle?: string;
  directorSignature?: string;
  
  // Laboratory Accreditation
  accreditationNumber?: string;
  accreditationBody?: string;
  accreditationExpiry?: string;
  licenseNumber?: string;
  
  // Currency & Financial Settings
  currencySymbol: string;
  currencyCode: string;
  currencyPosition: string;
  decimalPlaces: number;
  taxRate: number;
  
  // Print Settings
  autoprint: boolean;
  defaultPrinter?: string;
  printLogo: boolean;
  logoUrl?: string;
  reportHeader?: string;
  reportFooter?: string;
  
  // Notification Settings
  smsNotifications: boolean;
  emailNotifications: boolean;
  smsProvider?: string;
  smsApiKey?: string;
  emailProvider?: string;
  emailApiKey?: string;
  
  // System Settings
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  
  // Quality Control Settings
  qcEnabled: boolean;
  qcFrequency: string;
  qcRetentionDays: number;
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: string;
  backupRetentionDays: number;
  
  // Security Settings
  sessionTimeout: number;
  passwordExpiry: number;
  maxLoginAttempts: number;
  
  // Integration Settings
  hl7Enabled: boolean;
  hl7Port: number;
  lisIntegration: boolean;
}

export default function SystemSettings() {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState('laboratory');
  const [config, setConfig] = useState<SystemConfig>({
    labName: 'SIL Laboratory',
    address: '123 Main Street, City, Country',
    phone: '+1234567890',
    email: 'info@sil.lab',
    currencySymbol: '€',
    currencyCode: 'EUR',
    currencyPosition: 'AFTER',
    decimalPlaces: 2,
    taxRate: 20.0,
    autoprint: true,
    printLogo: true,
    smsNotifications: true,
    emailNotifications: true,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    qcEnabled: true,
    qcFrequency: 'DAILY',
    qcRetentionDays: 365,
    autoBackup: false,
    backupFrequency: 'WEEKLY',
    backupRetentionDays: 30,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    hl7Enabled: false,
    hl7Port: 2575,
    lisIntegration: false
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const t = {
    fr: {
      title: 'Paramètres Système',
      laboratory: 'Laboratoire',
      director: 'Directeur',
      accreditation: 'Accréditation',
      printing: 'Impression',
      notifications: 'Notifications',
      system: 'Système',
      backup: 'Sauvegarde',
      
      // Laboratory
      labName: 'Nom du Laboratoire',
      labCode: 'Code du Laboratoire',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      website: 'Site Web',
      fax: 'Fax',
      
      // Director
      directorName: 'Nom du Directeur',
      directorTitle: 'Titre du Directeur',
      directorSignature: 'Signature du Directeur',
      
      // Accreditation
      accreditationNumber: 'Numéro d\'Accréditation',
      accreditationBody: 'Organisme d\'Accréditation',
      accreditationExpiry: 'Expiration de l\'Accréditation',
      licenseNumber: 'Numéro de Licence',
      

      
      // Printing
      autoprint: 'Impression Automatique',
      defaultPrinter: 'Imprimante par Défaut',
      printLogo: 'Imprimer le Logo',
      logoUrl: 'URL du Logo',
      reportHeader: 'En-tête du Rapport',
      reportFooter: 'Pied de Page du Rapport',
      
      // Notifications
      smsNotifications: 'Notifications SMS',
      emailNotifications: 'Notifications Email',
      smsProvider: 'Fournisseur SMS',
      smsApiKey: 'Clé API SMS',
      emailProvider: 'Fournisseur Email',
      emailApiKey: 'Clé API Email',
      
      // System
      language: 'Langue',
      timezone: 'Fuseau Horaire',
      dateFormat: 'Format de Date',
      timeFormat: 'Format d\'Heure',
      

      
      // Backup
      autoBackup: 'Sauvegarde Automatique',
      backupFrequency: 'Fréquence de Sauvegarde',
      backupRetentionDays: 'Rétention Sauvegarde (jours)',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      

      
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Enregistré',
      error: 'Erreur',
      showApiKeys: 'Afficher les Clés API',
      hideApiKeys: 'Masquer les Clés API',
      uploadLogo: 'Télécharger Logo',
      uploadSignature: 'Télécharger Signature'
    },
    en: {
      title: 'System Settings',
      laboratory: 'Laboratory',
      director: 'Director',
      accreditation: 'Accreditation',
      printing: 'Printing',
      notifications: 'Notifications',
      system: 'System',
      backup: 'Backup',
      
      // Laboratory
      labName: 'Laboratory Name',
      labCode: 'Laboratory Code',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      fax: 'Fax',
      
      // Director
      directorName: 'Director Name',
      directorTitle: 'Director Title',
      directorSignature: 'Director Signature',
      
      // Accreditation
      accreditationNumber: 'Accreditation Number',
      accreditationBody: 'Accreditation Body',
      accreditationExpiry: 'Accreditation Expiry',
      licenseNumber: 'License Number',
      

      
      // Printing
      autoprint: 'Auto Print',
      defaultPrinter: 'Default Printer',
      printLogo: 'Print Logo',
      logoUrl: 'Logo URL',
      reportHeader: 'Report Header',
      reportFooter: 'Report Footer',
      
      // Notifications
      smsNotifications: 'SMS Notifications',
      emailNotifications: 'Email Notifications',
      smsProvider: 'SMS Provider',
      smsApiKey: 'SMS API Key',
      emailProvider: 'Email Provider',
      emailApiKey: 'Email API Key',
      
      // System
      language: 'Language',
      timezone: 'Timezone',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      

      
      // Backup
      autoBackup: 'Auto Backup',
      backupFrequency: 'Backup Frequency',
      backupRetentionDays: 'Backup Retention (days)',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      

      
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved',
      error: 'Error',
      showApiKeys: 'Show API Keys',
      hideApiKeys: 'Hide API Keys',
      uploadLogo: 'Upload Logo',
      uploadSignature: 'Upload Signature'
    }
  }[language];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/config', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('http://localhost:5001/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'laboratory', label: t.laboratory, icon: Building2 },
    { id: 'director', label: t.director, icon: User },
    { id: 'accreditation', label: t.accreditation, icon: Award },
    { id: 'printing', label: t.printing, icon: Printer },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'system', label: t.system, icon: Globe },
    { id: 'backup', label: t.backup, icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'laboratory':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.labName} *
                </label>
                <input
                  type="text"
                  value={config.labName}
                  onChange={(e) => handleChange('labName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.labCode}
                </label>
                <input
                  type="text"
                  value={config.labCode || ''}
                  onChange={(e) => handleChange('labCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.address} *
              </label>
              <textarea
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  value={config.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.website}
                </label>
                <input
                  type="url"
                  value={config.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.fax}
                </label>
                <input
                  type="tel"
                  value={config.fax || ''}
                  onChange={(e) => handleChange('fax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'director':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.directorName}
                </label>
                <input
                  type="text"
                  value={config.directorName || ''}
                  onChange={(e) => handleChange('directorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.directorTitle}
                </label>
                <input
                  type="text"
                  value={config.directorTitle || ''}
                  onChange={(e) => handleChange('directorTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.directorSignature}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="signature-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleChange('directorSignature', e.target?.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="signature-upload"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t.uploadSignature}
                </label>
                {config.directorSignature && (
                  <img
                    src={config.directorSignature}
                    alt="Director Signature"
                    className="h-12 border border-gray-300 rounded"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'accreditation':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.accreditationNumber}
                </label>
                <input
                  type="text"
                  value={config.accreditationNumber || ''}
                  onChange={(e) => handleChange('accreditationNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.accreditationBody}
                </label>
                <input
                  type="text"
                  value={config.accreditationBody || ''}
                  onChange={(e) => handleChange('accreditationBody', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.accreditationExpiry}
                </label>
                <input
                  type="date"
                  value={config.accreditationExpiry || ''}
                  onChange={(e) => handleChange('accreditationExpiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.licenseNumber}
                </label>
                <input
                  type="text"
                  value={config.licenseNumber || ''}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );



      case 'printing':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoprint}
                  onChange={(e) => handleChange('autoprint', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.autoprint}</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.printLogo}
                  onChange={(e) => handleChange('printLogo', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.printLogo}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.defaultPrinter}
              </label>
              <input
                type="text"
                value={config.defaultPrinter || ''}
                onChange={(e) => handleChange('defaultPrinter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.logoUrl}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleChange('logoUrl', e.target?.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t.uploadLogo}
                </label>
                {config.logoUrl && (
                  <img
                    src={config.logoUrl}
                    alt="Laboratory Logo"
                    className="h-12 border border-gray-300 rounded"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.reportHeader}
              </label>
              <textarea
                value={config.reportHeader || ''}
                onChange={(e) => handleChange('reportHeader', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.reportFooter}
              </label>
              <textarea
                value={config.reportFooter || ''}
                onChange={(e) => handleChange('reportFooter', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.smsNotifications}</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.emailNotifications}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.smsProvider}
                </label>
                <input
                  type="text"
                  value={config.smsProvider || ''}
                  onChange={(e) => handleChange('smsProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.emailProvider}
                </label>
                <input
                  type="text"
                  value={config.emailProvider || ''}
                  onChange={(e) => handleChange('emailProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.smsApiKey}
                </label>
                <div className="relative">
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={config.smsApiKey || ''}
                    onChange={(e) => handleChange('smsApiKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.emailApiKey}
                </label>
                <div className="relative">
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={config.emailApiKey || ''}
                    onChange={(e) => handleChange('emailApiKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.language}
                </label>
                <select
                  value={config.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.timezone}
                </label>
                <select
                  value={config.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Africa/Casablanca">Africa/Casablanca</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.dateFormat}
                </label>
                <select
                  value={config.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.timeFormat}
                </label>
                <select
                  value={config.timeFormat}
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24 Hours</option>
                  <option value="12h">12 Hours</option>
                </select>
              </div>
            </div>
          </div>
        );



      case 'backup':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.autoBackup}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.backupFrequency}
                </label>
                <select
                  value={config.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DAILY">{t.daily}</option>
                  <option value="WEEKLY">{t.weekly}</option>
                  <option value="MONTHLY">{t.monthly}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.backupRetentionDays}
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.backupRetentionDays}
                  onChange={(e) => handleChange('backupRetentionDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        
        <div className="flex items-center space-x-4">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              {t.saved}
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <X className="h-5 w-5 mr-2" />
              {t.error}
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}