import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../App';
import { automatesService } from '../../services/integrations';

interface Automate {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  status: string;
  lastSync: string | null;
  transferLogs: AutomateTransferLog[];
}

interface AutomateTransferLog {
  id: string;
  automateId: string;
  type: string;
  status: string;
  duration: number | null;
  errorMsg: string | null;
  timestamp: string;
}

interface LogsMonitoringTabProps {
  automates: Automate[];
  onRefresh: () => void;
}

export default function LogsMonitoringTab({ automates, onRefresh }: LogsMonitoringTabProps) {
  const { language } = useAuth();
  const [selectedAutomate, setSelectedAutomate] = useState<Automate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [logsByAutomate, setLogsByAutomate] = useState<Record<string, AutomateTransferLog[]>>({});
  const [loading, setLoading] = useState(false);

  // Load logs for all automates (limited) on mount and when list changes
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          (automates || []).map(async (a) => {
            try {
              const res = await automatesService.getTransferLogs(a.id, { limit: 50 });
              return [a.id, res.logs || []] as const;
            } catch (e) {
              console.error('Failed to load logs for', a.id, e);
              return [a.id, []] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, AutomateTransferLog[]> = {};
          for (const [id, logs] of entries) map[id] = logs;
          setLogsByAutomate(map);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (automates && automates.length) loadAll();
    return () => {
      cancelled = true;
    };
  }, [automates]);

  // derive logs from fetched map or props as fallback
  const selectedLogs = selectedAutomate
    ? (logsByAutomate[selectedAutomate.id] || automates.find(a => a.id === selectedAutomate.id)?.transferLogs || [])
    : (automates || []).flatMap(a => (logsByAutomate[a.id] || a.transferLogs || []));

  const t = {
    fr: {
      title: 'Logs et Monitoring',
      subtitle: 'Surveillez les transferts de données et l\'état de vos automates',
      selectAutomate: 'Sélectionner un automate',
      allAutomates: 'Tous les automates',
      status: 'Statut',
      type: 'Type',
      duration: 'Durée',
      timestamp: 'Horodatage',
      error: 'Erreur',
      noLogs: 'Aucun log trouvé',
      export: 'Exporter',
      refresh: 'Actualiser',
      filter: 'Filtrer',
      all: 'Tous',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      worklist: 'Liste de travail',
      results: 'Résultats',
      qc: 'Contrôle qualité',
      last24h: 'Dernières 24h',
      last7d: 'Derniers 7 jours',
      last30d: 'Derniers 30 jours',
      allTime: 'Tout le temps',
      online: 'En ligne',
      offline: 'Hors ligne',
      lastSync: 'Dernière synchronisation',
      never: 'Jamais',
      totalLogs: 'Total des logs',
      successRate: 'Taux de succès',
      avgDuration: 'Durée moyenne'
    },
    en: {
      title: 'Logs and Monitoring',
      subtitle: 'Monitor data transfers and automate status',
      selectAutomate: 'Select an automate',
      allAutomates: 'All automates',
      status: 'Status',
      type: 'Type',
      duration: 'Duration',
      timestamp: 'Timestamp',
      error: 'Error',
      noLogs: 'No logs found',
      export: 'Export',
      refresh: 'Refresh',
      filter: 'Filter',
      all: 'All',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      worklist: 'Worklist',
      results: 'Results',
      qc: 'Quality Control',
      last24h: 'Last 24h',
      last7d: 'Last 7 days',
      last30d: 'Last 30 days',
      allTime: 'All time',
      online: 'Online',
      offline: 'Offline',
      lastSync: 'Last sync',
      never: 'Never',
      totalLogs: 'Total logs',
      successRate: 'Success rate',
      avgDuration: 'Average duration'
    }
  }[language];

  const statusOptions = [
    { value: 'all', label: t.all },
    { value: 'success', label: t.success },
    { value: 'error', label: t.error },
    { value: 'warning', label: t.warning }
  ];

  const typeOptions = [
    { value: 'all', label: t.all },
    { value: 'worklist', label: t.worklist },
    { value: 'results', label: t.results },
    { value: 'qc', label: t.qc }
  ];

  const dateOptions = [
    { value: '24h', label: t.last24h },
    { value: '7d', label: t.last7d },
    { value: '30d', label: t.last30d },
    { value: 'all', label: t.allTime }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Activity size={16} className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getAutomateStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const filteredLogs = selectedLogs.filter(log => {
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;
    const typeMatch = filterType === 'all' || log.type === filterType;
    return statusMatch && typeMatch;
  });

  const allLogs = (automates || []).flatMap(automate => 
    (automate.transferLogs || []).map(log => ({ ...log, automateName: automate.name }))
  );

  const filteredAllLogs = allLogs.filter(log => {
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;
    const typeMatch = filterType === 'all' || log.type === filterType;
    return statusMatch && typeMatch;
  });

  const stats = {
    totalLogs: filteredAllLogs.length,
    successRate: filteredAllLogs.length > 0 
      ? Math.round((filteredAllLogs.filter(log => log.status === 'success').length / filteredAllLogs.length) * 100)
      : 0,
    avgDuration: filteredAllLogs.length > 0
      ? Math.round(filteredAllLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / filteredAllLogs.length)
      : 0
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Automate', 'Type', 'Status', 'Duration', 'Error'].join(','),
      ...filteredAllLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.automateName || selectedAutomate?.name || '',
        log.type,
        log.status,
        formatDuration(log.duration),
        log.errorMsg || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automate-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Activity size={24} className="text-blue-600 mr-3" />
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
            <option value="">{t.allAutomates}</option>
            {automates.map(automate => (
              <option key={automate.id} value={automate.id}>
                {automate.name} ({automate.manufacturer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Activity size={20} className="text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalLogs}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <CheckCircle size={20} className="text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.successRate}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Clock size={20} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.avgDuration}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automate Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {language === 'fr' ? 'État des automates' : 'Automate Status'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {automates.map(automate => (
            <div key={automate.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {automate.name}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAutomateStatusColor(automate.status)}`}>
                  {automate.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {automate.manufacturer} - {automate.type}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.lastSync}: {automate.lastSync ? formatTimestamp(automate.lastSync) : t.never}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download size={16} className="mr-2" />
              {t.export}
            </button>
            <button
              onClick={async () => {
                if (selectedAutomate) {
                  try {
                    const res = await automatesService.getTransferLogs(selectedAutomate.id, { limit: 50 });
                    setLogsByAutomate(prev => ({ ...prev, [selectedAutomate.id]: res.logs || [] }));
                  } catch (e) {
                    console.error('Refresh logs failed', e);
                  }
                } else {
                  // refresh all
                  try {
                    const entries = await Promise.all(
                      (automates || []).map(async (a) => {
                        try {
                          const r = await automatesService.getTransferLogs(a.id, { limit: 50 });
                          return [a.id, r.logs || []] as const;
                        } catch {
                          return [a.id, []] as const;
                        }
                      })
                    );
                    const map: Record<string, AutomateTransferLog[]> = {};
                    for (const [id, logs] of entries) map[id] = logs;
                    setLogsByAutomate(map);
                  } catch (e) {
                    console.error('Refresh all logs failed', e);
                  }
                }
                // also allow parent to refresh automate list if needed
                onRefresh();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              {t.refresh}
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.timestamp}
                </th>
                {!selectedAutomate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Automate
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.type}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.duration}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.error}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(selectedAutomate ? filteredLogs : filteredAllLogs).length === 0 ? (
                <tr>
                  <td colSpan={!selectedAutomate ? 6 : 5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t.noLogs}
                  </td>
                </tr>
              ) : (
                (selectedAutomate ? filteredLogs : filteredAllLogs).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    {!selectedAutomate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(log as any).automateName || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                      {log.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDuration(log.duration)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {log.errorMsg || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 