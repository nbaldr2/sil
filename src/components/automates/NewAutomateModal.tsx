import React, { useState } from 'react';
import { X, Save, Database } from 'lucide-react';
import { useAuth } from '../../App';
import { automatesService } from '../../services/integrations';

interface NewAutomateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AutomateFormData {
  name: string;
  type: string;
  manufacturer: string;
  protocol: string;
  connection: string;
  config: {
    ipAddress?: string;
    port?: number;
    comPort?: string;
    baudRate?: number;
    ftpHost?: string;
    ftpPort?: number;
    ftpUser?: string;
    ftpPass?: string;
    autoSendWorklist: boolean;
    autoReceiveResults: boolean;
    enableQCMonitoring: boolean;
  };
  enabled: boolean;
}

export default function NewAutomateModal({ isOpen, onClose, onSuccess }: NewAutomateModalProps) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AutomateFormData>({
    name: '',
    type: '',
    manufacturer: '',
    protocol: 'HL7',
    connection: 'tcp',
    config: {
      autoSendWorklist: true,
      autoReceiveResults: true,
      enableQCMonitoring: true
    },
    enabled: true
  });

  const t = {
    fr: {
      title: 'Ajouter un Automate',
      name: 'Nom de l\'automate',
      type: 'Type',
      manufacturer: 'Fabricant',
      protocol: 'Protocole',
      connection: 'Type de connexion',
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
      save: 'Enregistrer',
      cancel: 'Annuler',
      required: 'Ce champ est requis',
      success: 'Automate ajouté avec succès',
      error: 'Erreur lors de l\'ajout de l\'automate'
    },
    en: {
      title: 'Add New Automate',
      name: 'Automate Name',
      type: 'Type',
      manufacturer: 'Manufacturer',
      protocol: 'Protocol',
      connection: 'Connection Type',
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
      save: 'Save',
      cancel: 'Cancel',
      required: 'This field is required',
      success: 'Automate added successfully',
      error: 'Error adding automate'
    }
  }[language];

  const automateTypes = [
    'Immunoassay',
    'Clinical Chemistry',
    'Hematology',
    'Coagulation',
    'Molecular',
    'Microbiology',
    'Other'
  ];

  const manufacturers = [
    'Roche',
    'Abbott',
    'Siemens',
    'Beckman Coulter',
    'Ortho Clinical Diagnostics',
    'Sysmex',
    'Bio-Rad',
    'DiaSorin',
    'Other'
  ];

  const protocols = [
    { value: 'HL7', label: 'HL7' },
    { value: 'ASTM', label: 'ASTM' },
    { value: 'LIS2-A2', label: 'LIS2-A2' }
  ];

  const connectionTypes = [
    { value: 'tcp', label: 'TCP/IP' },
    { value: 'serial', label: 'Serial' },
    { value: 'ftp', label: 'FTP' }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof AutomateFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.manufacturer) {
      alert(t.required);
      return;
    }

    setLoading(true);
    try {
      await automatesService.createAutomate(formData);
      alert(t.success);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        type: '',
        manufacturer: '',
        protocol: 'HL7',
        connection: 'tcp',
        config: {
          autoSendWorklist: true,
          autoReceiveResults: true,
          enableQCMonitoring: true
        },
        enabled: true
      });
    } catch (error) {
      console.error('Error creating automate:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Database size={20} className="mr-2" />
            {t.title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.name} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.type} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{language === 'fr' ? 'Sélectionner un type' : 'Select type'}</option>
                {automateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.manufacturer} *
              </label>
              <select
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{language === 'fr' ? 'Sélectionner un fabricant' : 'Select manufacturer'}</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.protocol}
              </label>
              <select
                value={formData.protocol}
                onChange={(e) => handleInputChange('protocol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {protocols.map(protocol => (
                  <option key={protocol.value} value={protocol.value}>{protocol.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.connection}
              </label>
              <select
                value={formData.connection}
                onChange={(e) => handleInputChange('connection', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {connectionTypes.map(connection => (
                  <option key={connection.value} value={connection.value}>{connection.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.enabled}
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.enabled ? (language === 'fr' ? 'Activé' : 'Enabled') : (language === 'fr' ? 'Désactivé' : 'Disabled')}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Configuration de connexion' : 'Connection Configuration'}
            </h4>

            {formData.connection === 'tcp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ipAddress}
                  </label>
                  <input
                    type="text"
                    value={formData.config.ipAddress || ''}
                    onChange={(e) => handleInputChange('config.ipAddress', e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.port}
                  </label>
                  <input
                    type="number"
                    value={formData.config.port || ''}
                    onChange={(e) => handleInputChange('config.port', parseInt(e.target.value) || undefined)}
                    placeholder="8080"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {formData.connection === 'serial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.comPort}
                  </label>
                  <input
                    type="text"
                    value={formData.config.comPort || ''}
                    onChange={(e) => handleInputChange('config.comPort', e.target.value)}
                    placeholder="COM3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.baudRate}
                  </label>
                  <select
                    value={formData.config.baudRate || ''}
                    onChange={(e) => handleInputChange('config.baudRate', parseInt(e.target.value) || undefined)}
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

            {formData.connection === 'ftp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ftpHost}
                  </label>
                  <input
                    type="text"
                    value={formData.config.ftpHost || ''}
                    onChange={(e) => handleInputChange('config.ftpHost', e.target.value)}
                    placeholder="ftp.example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ftpPort}
                  </label>
                  <input
                    type="number"
                    value={formData.config.ftpPort || ''}
                    onChange={(e) => handleInputChange('config.ftpPort', parseInt(e.target.value) || undefined)}
                    placeholder="21"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ftpUser}
                  </label>
                  <input
                    type="text"
                    value={formData.config.ftpUser || ''}
                    onChange={(e) => handleInputChange('config.ftpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ftpPass}
                  </label>
                  <input
                    type="password"
                    value={formData.config.ftpPass || ''}
                    onChange={(e) => handleInputChange('config.ftpPass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Automation Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Paramètres d\'automatisation' : 'Automation Settings'}
            </h4>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.autoSendWorklist}
                  onChange={(e) => handleInputChange('config.autoSendWorklist', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.autoSendWorklist}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.autoReceiveResults}
                  onChange={(e) => handleInputChange('config.autoReceiveResults', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.autoReceiveResults}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.config.enableQCMonitoring}
                  onChange={(e) => handleInputChange('config.enableQCMonitoring', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.enableQCMonitoring}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          </div>
        </form>
      </div>
    </div>
  );
} 