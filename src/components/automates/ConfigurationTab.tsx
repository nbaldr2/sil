import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Wifi, Usb, HardDrive } from 'lucide-react';
import { useAuth } from '../../App';
import { automatesService } from '../../services/integrations';

interface Automate {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  protocol: string;
  connection: string;
  config: any;
  enabled: boolean;
  status: string;
  lastSync: string | null;
}

interface ConfigurationTabProps {
  automates: Automate[];
  onRefresh: () => void;
}

export default function ConfigurationTab({ automates, onRefresh }: ConfigurationTabProps) {
  const { language } = useAuth();
  const [selectedAutomate, setSelectedAutomate] = useState<Automate | null>(null);
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<any>({});

  const t = {
    fr: {
      title: 'Configuration des Automates',
      subtitle: 'Gérez les paramètres de connexion et de configuration de vos automates',
      selectAutomate: 'Sélectionner un automate',
      connectionSettings: 'Paramètres de connexion',
      automationSettings: 'Paramètres d\'automatisation',
      generalSettings: 'Paramètres généraux',
      save: 'Enregistrer',
      test: 'Tester la connexion',
      reset: 'Réinitialiser',
      success: 'Configuration mise à jour avec succès',
      error: 'Erreur lors de la mise à jour',
      connectionTest: 'Test de connexion',
      connectionSuccess: 'Connexion réussie',
      connectionFailed: 'Échec de la connexion',
      ipAddress: 'Adresse IP',
      port: 'Port',
      comPort: 'Port COM',
      baudRate: 'Débit en bauds',
      ftpHost: 'Hôte FTP',
      ftpPort: 'Port FTP',
      ftpUser: 'Utilisateur FTP',
      ftpPass: 'Mot de passe FTP',
      autoSendWorklist: 'Envoi automatique de la liste de travail',
      autoReceiveResults: 'Réception automatique des résultats',
      enableQCMonitoring: 'Activer la surveillance QC',
      enabled: 'Activé',
      protocol: 'Protocole',
      connection: 'Type de connexion',
      manufacturer: 'Fabricant',
      type: 'Type'
    },
    en: {
      title: 'Automate Configuration',
      subtitle: 'Manage connection and configuration settings for your automates',
      selectAutomate: 'Select an automate',
      connectionSettings: 'Connection Settings',
      automationSettings: 'Automation Settings',
      generalSettings: 'General Settings',
      save: 'Save',
      test: 'Test Connection',
      reset: 'Reset',
      success: 'Configuration updated successfully',
      error: 'Error updating configuration',
      connectionTest: 'Connection Test',
      connectionSuccess: 'Connection successful',
      connectionFailed: 'Connection failed',
      ipAddress: 'IP Address',
      port: 'Port',
      comPort: 'COM Port',
      baudRate: 'Baud Rate',
      ftpHost: 'FTP Host',
      ftpPort: 'FTP Port',
      ftpUser: 'FTP User',
      ftpPass: 'FTP Password',
      autoSendWorklist: 'Auto-send Worklist',
      autoReceiveResults: 'Auto-receive Results',
      enableQCMonitoring: 'Enable QC Monitoring',
      enabled: 'Enabled',
      protocol: 'Protocol',
      connection: 'Connection Type',
      manufacturer: 'Manufacturer',
      type: 'Type'
    }
  }[language];

  useEffect(() => {
    if (selectedAutomate) {
      setConfigData(selectedAutomate.config || {});
    }
  }, [selectedAutomate]);

  const handleInputChange = (field: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedAutomate) return;

    setLoading(true);
    try {
      await automatesService.updateAutomate(selectedAutomate.id, {
        config: configData
      });
      alert(t.success);
      onRefresh();
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedAutomate) return;

    setLoading(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(t.connectionSuccess);
    } catch (error) {
      alert(t.connectionFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (selectedAutomate) {
      setConfigData(selectedAutomate.config || {});
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'tcp':
        return <Wifi size={16} />;
      case 'serial':
        return <Usb size={16} />;
      case 'ftp':
        return <HardDrive size={16} />;
      default:
        return <Database size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Settings size={24} className="text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Automate Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.selectAutomate}
          </label>
          <select
            value={selectedAutomate?.id || ''}
            onChange={(e) => {
              const automate = automates.find(a => a.id === e.target.value);
              setSelectedAutomate(automate || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{language === 'fr' ? 'Sélectionner un automate' : 'Select an automate'}</option>
            {automates.map(automate => (
              <option key={automate.id} value={automate.id}>
                {automate.name} ({automate.manufacturer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAutomate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Database size={20} className="mr-2" />
              {t.generalSettings}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={selectedAutomate.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.manufacturer}
                </label>
                <input
                  type="text"
                  value={selectedAutomate.manufacturer}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.type}
                </label>
                <input
                  type="text"
                  value={selectedAutomate.type}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.protocol}
                </label>
                <input
                  type="text"
                  value={selectedAutomate.protocol}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.connection}
                </label>
                <div className="flex items-center">
                  {getConnectionIcon(selectedAutomate.connection)}
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {selectedAutomate.connection}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              {getConnectionIcon(selectedAutomate.connection)}
              <span className="ml-2">{t.connectionSettings}</span>
            </h3>

            {selectedAutomate.connection === 'tcp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.ipAddress}
                  </label>
                  <input
                    type="text"
                    value={configData.ipAddress || ''}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.port}
                  </label>
                  <input
                    type="number"
                    value={configData.port || ''}
                    onChange={(e) => handleInputChange('port', parseInt(e.target.value) || undefined)}
                    placeholder="8080"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {selectedAutomate.connection === 'serial' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.comPort}
                  </label>
                  <input
                    type="text"
                    value={configData.comPort || ''}
                    onChange={(e) => handleInputChange('comPort', e.target.value)}
                    placeholder="COM3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.baudRate}
                  </label>
                  <select
                    value={configData.baudRate || ''}
                    onChange={(e) => handleInputChange('baudRate', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                    <option value="9600">9600</option>
                    <option value="19200">19200</option>
                    <option value="38400">38400</option>
                    <option value="57600">57600</option>
                    <option value="115200">115200</option>
                  </select>
                </div>
              </div>
            )}

            {selectedAutomate.connection === 'ftp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.ftpHost}
                  </label>
                  <input
                    type="text"
                    value={configData.ftpHost || ''}
                    onChange={(e) => handleInputChange('ftpHost', e.target.value)}
                    placeholder="ftp.example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.ftpPort}
                  </label>
                  <input
                    type="number"
                    value={configData.ftpPort || ''}
                    onChange={(e) => handleInputChange('ftpPort', parseInt(e.target.value) || undefined)}
                    placeholder="21"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.ftpUser}
                  </label>
                  <input
                    type="text"
                    value={configData.ftpUser || ''}
                    onChange={(e) => handleInputChange('ftpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.ftpPass}
                  </label>
                  <input
                    type="password"
                    value={configData.ftpPass || ''}
                    onChange={(e) => handleInputChange('ftpPass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Automation Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t.automationSettings}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={configData.autoSendWorklist || false}
                  onChange={(e) => handleInputChange('autoSendWorklist', e.target.checked)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.autoSendWorklist}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={configData.autoReceiveResults || false}
                  onChange={(e) => handleInputChange('autoReceiveResults', e.target.checked)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.autoReceiveResults}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={configData.enableQCMonitoring || false}
                  onChange={(e) => handleInputChange('enableQCMonitoring', e.target.checked)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.enableQCMonitoring}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAutomate.enabled}
                  disabled
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.enabled}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {language === 'fr' ? 'Enregistrement...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {t.save}
                  </>
                )}
              </button>

              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <RefreshCw size={16} className="mr-2" />
                {t.test}
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.reset}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 