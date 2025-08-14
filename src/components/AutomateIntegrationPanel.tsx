import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Activity, 
  FileText, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Database,
  Code,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../App';
import { automatesService } from '../services/integrations';
import NewAutomateModal from './automates/NewAutomateModal';
import ConfigurationTab from './automates/ConfigurationTab';
import CodeMappingTab from './automates/CodeMappingTab';
import LogsMonitoringTab from './automates/LogsMonitoringTab';

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
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
  driverCodes: AutomateCodeMapping[];
  _count: {
    driverCodes: number;
    transferLogs: number;
    qcResults: number;
  };
}

interface AutomateCodeMapping {
  id: string;
  codeAutomate: string;
  silTestName: string;
  sampleType: string;
  unit?: string;
  refRangeLow?: number;
  refRangeHigh?: number;
}

interface AutomateTransferLog {
  id: string;
  type: string;
  status: string;
  duration?: number;
  errorMsg?: string;
  timestamp: string;
}

export default function AutomateIntegrationPanel() {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [automates, setAutomates] = useState<Automate[]>([]);
  const [selectedAutomate, setSelectedAutomate] = useState<Automate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState<AutomateTransferLog[]>([]);

  const t = {
    fr: {
      title: 'Intégration Automates',
      subtitle: 'Gestion des analyseurs de laboratoire',
      automatesList: 'Liste des Automates',
      configuration: 'Configuration',
      codeMapping: 'Mapping des Codes',
      logs: 'Logs et Monitoring',
      addNew: 'Ajouter un Automate',
      status: {
        online: 'Connecté',
        offline: 'Hors ligne',
        error: 'Erreur'
      },
      lastSync: 'Dernière synchronisation',
      viewLogs: 'Voir les Logs',
      noAutomates: 'Aucun automate configuré',
      loading: 'Chargement...'
    },
    en: {
      title: 'Automate Integration',
      subtitle: 'Laboratory analyzer management',
      automatesList: 'Automates List',
      configuration: 'Configuration',
      codeMapping: 'Code Mapping',
      logs: 'Logs & Monitoring',
      addNew: 'Add New Automate',
      status: {
        online: 'Connected',
        offline: 'Offline',
        error: 'Error'
      },
      lastSync: 'Last sync',
      viewLogs: 'View Logs',
      noAutomates: 'No automates configured',
      loading: 'Loading...'
    }
  }[language];

  useEffect(() => {
    loadAutomates();
  }, []);

  const loadAutomates = async () => {
    try {
      setLoading(true);
      const result = await automatesService.getAutomates();
      setAutomates(result.automates || []);
    } catch (error) {
      console.error('Error loading automates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi size={16} />;
      case 'offline':
        return <WifiOff size={16} />;
      case 'error':
        return <AlertTriangle size={16} />;
      default:
        return <WifiOff size={16} />;
    }
  };

  const handleViewLogs = async (automate: Automate) => {
    setSelectedAutomate(automate);
    try {
      const result = await automatesService.getTransferLogs(automate.id);
      setLogs(result.logs || []);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleRestartInterface = async (automate: Automate) => {
    try {
      await automatesService.updateStatus(automate.id, { status: 'offline' });
      setTimeout(() => {
        automatesService.updateStatus(automate.id, { status: 'online' });
      }, 2000);
      loadAutomates();
    } catch (error) {
      console.error('Error restarting interface:', error);
    }
  };

  const handleSyncNow = async (automate: Automate) => {
    try {
      await automatesService.updateStatus(automate.id, { 
        status: 'online',
        lastSync: new Date().toISOString()
      });
      loadAutomates();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  const tabs = [
    { id: 'list', label: t.automatesList, icon: Database },
    { id: 'config', label: t.configuration, icon: Settings },
    { id: 'mapping', label: t.codeMapping, icon: Code },
    { id: 'logs', label: t.logs, icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t.automatesList}
              </h2>
              <button
                onClick={() => setShowNewModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus size={20} className="mr-2" />
                {t.addNew}
              </button>
            </div>

            {/* Automates Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
              </div>
            ) : automates.length === 0 ? (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t.noAutomates}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Commencez par ajouter votre premier automate de laboratoire.
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t.addNew}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automates.map((automate) => (
                  <div
                    key={automate.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {automate.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {automate.manufacturer} - {automate.type}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(automate.status)}`}>
                        {getStatusIcon(automate.status)}
                        <span className="ml-1">{t.status[automate.status as keyof typeof t.status]}</span>
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Protocol:</span>
                        <span className="text-gray-900 dark:text-white">{automate.protocol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Connection:</span>
                        <span className="text-gray-900 dark:text-white">{automate.connection}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Code Mappings:</span>
                        <span className="text-gray-900 dark:text-white">{automate._count.driverCodes}</span>
                      </div>
                      {automate.lastSync && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t.lastSync}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(automate.lastSync).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewLogs(automate)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                      >
                        <Eye size={14} className="mr-1" />
                        {t.viewLogs}
                      </button>
                      <button
                        onClick={() => handleRestartInterface(automate)}
                        className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm hover:bg-yellow-200 flex items-center"
                        title="Restart Interface"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => handleSyncNow(automate)}
                        className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm hover:bg-green-200 flex items-center"
                        title="Sync Now"
                      >
                        <Play size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <ConfigurationTab automates={automates} onRefresh={loadAutomates} />
        )}

        {activeTab === 'mapping' && (
          <CodeMappingTab automates={automates} onRefresh={loadAutomates} />
        )}

        {activeTab === 'logs' && (
          <LogsMonitoringTab automates={automates} onRefresh={loadAutomates} />
        )}
      </div>

      {/* New Automate Modal */}
      <NewAutomateModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadAutomates}
      />

      {/* Logs Modal */}
      {showLogsModal && selectedAutomate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Logs - {selectedAutomate.name}
              </h3>
              <button onClick={() => setShowLogsModal(false)}>
                <span className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </span>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.duration ? `${log.duration}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {log.errorMsg || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 