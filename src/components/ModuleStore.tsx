import React, { useState, useEffect } from 'react';
import {
  Package,
  Download,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Shield,
  Zap,
  Calendar,
  Users,
  DollarSign,
  Play,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../App';
import { moduleService, Module, ModuleLicense } from '../services/moduleService';
import { useModules } from '../contexts/ModuleContext';

export default function ModuleStore() {
  const { language } = useAuth();
  const { refreshModules } = useModules();
  const [modules, setModules] = useState<Module[]>([]);
  const [installedModules, setInstalledModules] = useState<ModuleLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'store' | 'installed'>('store');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');

  const t = {
    fr: {
      title: 'Store de Modules',
      subtitle: 'Étendez les fonctionnalités de votre laboratoire',
      store: 'Store',
      installed: 'Installés',
      install: 'Installer',
      startTrial: 'Essai Gratuit',
      enterLicense: 'Entrer la Licence',
      licenseKey: 'Clé de Licence',
      organizationName: 'Nom de l\'Organisation',
      contactEmail: 'Email de Contact',
      activate: 'Activer',
      cancel: 'Annuler',
      trial: 'Essai',
      active: 'Actif',
      expired: 'Expiré',
      daysLeft: 'jours restants',
      features: 'Fonctionnalités',
      version: 'Version',
      author: 'Auteur',
      category: 'Catégorie',
      price: 'Prix',
      free: 'Gratuit',
      deactivate: 'Désactiver',
      refresh: 'Actualiser',
      noModules: 'Aucun module disponible',
      noInstalled: 'Aucun module installé',
      installSuccess: 'Module installé avec succès!',
      trialStarted: 'Essai gratuit démarré!',
      invalidLicense: 'Clé de licence invalide',
      licenseInUse: 'Cette clé de licence est déjà utilisée',
      installError: 'Erreur lors de l\'installation',
      generateDemo: 'Générer Clé Demo'
    },
    en: {
      title: 'Module Store',
      subtitle: 'Extend your laboratory functionality',
      store: 'Store',
      installed: 'Installed',
      install: 'Install',
      startTrial: 'Start Trial',
      enterLicense: 'Enter License',
      licenseKey: 'License Key',
      organizationName: 'Organization Name',
      contactEmail: 'Contact Email',
      activate: 'Activate',
      cancel: 'Cancel',
      trial: 'Trial',
      active: 'Active',
      expired: 'Expired',
      daysLeft: 'days left',
      features: 'Features',
      version: 'Version',
      author: 'Author',
      category: 'Category',
      price: 'Price',
      free: 'Free',
      deactivate: 'Deactivate',
      refresh: 'Refresh',
      noModules: 'No modules available',
      noInstalled: 'No modules installed',
      installSuccess: 'Module installed successfully!',
      trialStarted: 'Trial started successfully!',
      invalidLicense: 'Invalid license key',
      licenseInUse: 'License key already in use',
      installError: 'Installation error',
      generateDemo: 'Generate Demo Key'
    }
  }[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      console.log('Loading modules data...');
      const [modulesData, installedData] = await Promise.all([
        moduleService.getModules(),
        moduleService.getInstalledModules()
      ]);
      console.log('Modules loaded:', modulesData.length, 'available,', installedData.length, 'installed');
      setModules(modulesData);
      setInstalledModules(installedData);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      setError(`Failed to load modules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = (module: Module) => {
    setSelectedModule(module);
    setShowLicenseModal(true);
    setLicenseKey('');
    setOrganizationName('');
    setContactEmail('');
    setError('');
  };

  const handleStartTrial = async (module: Module) => {
    setInstalling(true);
    try {
      console.log('Starting trial for module:', module.id, 'with org:', organizationName, 'email:', contactEmail);
      await moduleService.startTrial(
        module.id, 
        organizationName || 'Demo Organization', 
        contactEmail || 'demo@example.com'
      );
      setError('');
      await loadData();
      refreshModules(); // Trigger sidebar refresh
      // Show success message
      setError(t.trialStarted);
      setTimeout(() => setError(''), 3000);
    } catch (error: any) {
      console.error('Trial start error:', error);
      setError(error.message || t.installError);
    } finally {
      setInstalling(false);
    }
  };

  const handleInstallWithLicense = async () => {
    if (!selectedModule || !licenseKey.trim()) {
      setError('License key is required');
      return;
    }

    setInstalling(true);
    try {
      await moduleService.installModule(
        selectedModule.id,
        licenseKey.trim(),
        organizationName.trim() || undefined,
        contactEmail.trim() || undefined
      );
      
      setShowLicenseModal(false);
      setError('');
      await loadData();
      refreshModules(); // Trigger sidebar refresh
      // Show success message
      setError(t.installSuccess);
      setTimeout(() => setError(''), 3000);
    } catch (error: any) {
      setError(error.message || t.installError);
    } finally {
      setInstalling(false);
    }
  };

  const handleDeactivate = async (licenseId: string) => {
    if (!confirm('Are you sure you want to deactivate this module?')) return;
    
    try {
      await moduleService.deactivateModule(licenseId);
      await loadData();
      refreshModules(); // Trigger sidebar refresh
    } catch (error: any) {
      setError(error.message || 'Failed to deactivate module');
    }
  };

  const generateDemoLicense = () => {
    if (selectedModule) {
      const demoKey = moduleService.generateLicenseKey(selectedModule.name);
      setLicenseKey(demoKey);
    }
  };

  const getStatusIcon = (status: string, daysRemaining: number) => {
    if (status === 'EXPIRED' || daysRemaining <= 0) return <XCircle className="w-4 h-4" />;
    if (status === 'TRIAL' || daysRemaining <= 7) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Package size={32} className="text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'store'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.store}
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'installed'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.installed} ({installedModules.length})
            </button>
          </div>
        </div>

        {/* Error/Success Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            error.includes('success') || error.includes('started')
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {error}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={loadData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} className="mr-2" />
            {t.refresh}
          </button>
        </div>

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noModules}
              </div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                        <Package size={24} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {module.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          v{module.version} • {module.author}
                        </p>
                      </div>
                    </div>
                    {module.isInstalled && (
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        moduleService.getStatusBadgeColor(module.licenseStatus || '', module.daysRemaining)
                      }`}>
                        {getStatusIcon(module.licenseStatus || '', module.daysRemaining)}
                        <span>{module.licenseStatus}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {module.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t.category}:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{module.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t.price}:</span>
                      <span className="text-gray-900 dark:text-white">
                        {module.price === 0 ? t.free : `$${module.price}`}
                      </span>
                    </div>
                    {module.isInstalled && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={moduleService.getStatusColor(module.licenseStatus || '', module.daysRemaining)}>
                          {moduleService.formatDaysRemaining(module.daysRemaining)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.features}:</p>
                    <div className="flex flex-wrap gap-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                          +{module.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!module.isInstalled ? (
                      <>
                        <button
                          onClick={() => handleStartTrial(module)}
                          disabled={installing}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          <Play size={14} className="mr-1" />
                          {t.startTrial}
                        </button>
                        <button
                          onClick={() => handleInstallClick(module)}
                          disabled={installing}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          <Key size={14} className="mr-1" />
                          {t.install}
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                        <CheckCircle size={14} className="mr-1" />
                        Installed
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            {installedModules.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noInstalled}
              </div>
            ) : (
              installedModules.map((license) => (
                <div
                  key={license.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                        <Package size={24} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {license.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          License: {license.licenseKey}
                        </p>
                        {license.organizationName && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Organization: {license.organizationName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        moduleService.getStatusBadgeColor(license.status, license.daysRemaining)
                      }`}>
                        {getStatusIcon(license.status, license.daysRemaining)}
                        <span>{license.status}</span>
                      </div>
                      <p className={`text-sm mt-1 ${moduleService.getStatusColor(license.status, license.daysRemaining)}`}>
                        {moduleService.formatDaysRemaining(license.daysRemaining)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Expires: {new Date(license.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>Max {license.maxUsers} users</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Since {new Date(license.activatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeactivate(license.id)}
                      className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      <Trash2 size={14} className="mr-1" />
                      {t.deactivate}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* License Installation Modal */}
        {showLicenseModal && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.enterLicense}
                </h3>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Installing: <strong>{selectedModule.displayName}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.licenseKey} *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your license key"
                    />
                    <button
                      onClick={generateDemoLicense}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      title={t.generateDemo}
                    >
                      <Zap size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.organizationName}
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.contactEmail}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleInstallWithLicense}
                  disabled={installing || !licenseKey.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {installing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Installing...
                    </>
                  ) : (
                    <>
                      <Key size={16} className="mr-2" />
                      {t.activate}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}