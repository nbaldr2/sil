import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../App';
import AddQCResultModal from './AddQCResultModal';
import QCStatistics from './QCStatistics';
import QCAlerts from './QCAlerts';
import QCReporting from './QCReporting';
import { qualityControlService } from '../services/qualityControl';

interface QualityControlResult {
  id: string;
  automateId: string;
  testName: string;
  level: string;
  value: number;
  expected: number;
  deviation: number;
  status: string;
  timestamp: string;
  automate: {
    name: string;
    type: string;
    manufacturer: string;
  };
}

interface QCStats {
  statusStats: Array<{
    status: string;
    _count: { status: number };
  }>;
  totalResults: number;
  testStats: Array<{
    testName: string;
    status: string;
    _count: { testName: number };
  }>;
  period: string;
}

interface Automate {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  status: string;
}

export default function QualityControl() {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [alertCount, setAlertCount] = useState(0);
  const [qcResults, setQcResults] = useState<QualityControlResult[]>([]);
  const [automates, setAutomates] = useState<Automate[]>([]);
  const [stats, setStats] = useState<QCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAutomate, setSelectedAutomate] = useState<string>('');
  const [filters, setFilters] = useState({
    status: '',
    level: '',
    testName: '',
    automateId: '',
    days: '30'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const t = {
    fr: {
      title: 'Contrôle Qualité',
      subtitle: 'Gestion des résultats de contrôle qualité des automates',
      overview: 'Vue d\'ensemble',
      results: 'Résultats',
      statistics: 'Statistiques',
      alerts: 'Alertes',
      reports: 'Rapports',
      addResult: 'Ajouter Résultat',
      testName: 'Nom du Test',
      level: 'Niveau',
      value: 'Valeur',
      expected: 'Valeur Attendue',
      deviation: 'Déviation',
      status: 'Statut',
      automate: 'Automate',
      timestamp: 'Date/Heure',
      actions: 'Actions',
      filter: 'Filtrer',
      search: 'Rechercher',
      export: 'Exporter',
      refresh: 'Actualiser',
      noResults: 'Aucun résultat trouvé',
      loading: 'Chargement...',
      totalResults: 'Total des résultats',
      passRate: 'Taux de réussite',
      failRate: 'Taux d\'échec',
      warningRate: 'Taux d\'avertissement',
      levels: {
        Low: 'Bas',
        Normal: 'Normal',
        High: 'Élevé'
      },
      statuses: {
        pass: 'Réussi',
        fail: 'Échec',
        warning: 'Avertissement'
      },
      last30Days: 'Derniers 30 jours',
      last7Days: 'Derniers 7 jours',
      last90Days: 'Derniers 90 jours',
      allTime: 'Tout le temps'
    },
    en: {
      title: 'Quality Control',
      subtitle: 'Management of automate quality control results',
      overview: 'Overview',
      results: 'Results',
      statistics: 'Statistics',
      alerts: 'Alerts',
      reports: 'Reports',
      addResult: 'Add Result',
      testName: 'Test Name',
      level: 'Level',
      value: 'Value',
      expected: 'Expected Value',
      deviation: 'Deviation',
      status: 'Status',
      automate: 'Automate',
      timestamp: 'Date/Time',
      actions: 'Actions',
      filter: 'Filter',
      search: 'Search',
      export: 'Export',
      refresh: 'Refresh',
      noResults: 'No results found',
      loading: 'Loading...',
      totalResults: 'Total results',
      passRate: 'Pass rate',
      failRate: 'Fail rate',
      warningRate: 'Warning rate',
      levels: {
        Low: 'Low',
        Normal: 'Normal',
        High: 'High'
      },
      statuses: {
        pass: 'Pass',
        fail: 'Fail',
        warning: 'Warning'
      },
      last30Days: 'Last 30 days',
      last7Days: 'Last 7 days',
      last90Days: 'Last 90 days',
      allTime: 'All time'
    }
  }[language];

  useEffect(() => {
    loadData();
  }, [filters, pagination.page]);

  useEffect(() => {
    loadAutomates();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load QC results
      const qcFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };

      const data = await qualityControlService.getAllQCResults(qcFilters);
      setQcResults(data.qcResults);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));

      // Load statistics if we have a selected automate
      if (selectedAutomate) {
        const statsData = await qualityControlService.getQCStats(selectedAutomate, parseInt(filters.days));
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading QC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAutomates = async () => {
    try {
      const data = await qualityControlService.getAutomates();
      setAutomates(data.automates);
      if (data.automates.length > 0 && !selectedAutomate) {
        setSelectedAutomate(data.automates[0].id);
      }
    } catch (error) {
      console.error('Error loading automates:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'fail':
        return <XCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'fail':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDeviationTrend = (deviation: number) => {
    if (Math.abs(deviation) < 5) {
      return <Activity size={16} className="text-green-600" />;
    } else if (deviation > 0) {
      return <TrendingUp size={16} className="text-red-600" />;
    } else {
      return <TrendingDown size={16} className="text-red-600" />;
    }
  };

  const calculatePassRate = () => {
    if (!stats || stats.totalResults === 0) return 0;
    const passCount = stats.statusStats.find(s => s.status === 'pass')?._count.status || 0;
    return Math.round((passCount / stats.totalResults) * 100);
  };

  const tabs = [
    { id: 'overview', label: t.overview, icon: BarChart3 },
    { id: 'results', label: t.results, icon: Activity },
    { id: 'statistics', label: t.statistics, icon: TrendingUp },
    { 
      id: 'alerts', 
      label: alertCount > 0 ? `${t.alerts} (${alertCount})` : t.alerts, 
      icon: AlertTriangle 
    },
    { id: 'reports', label: t.reports, icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            {t.addResult}
          </button>
          <button
            onClick={loadData}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <RefreshCw size={20} className="mr-2" />
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Automate Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.automate}:
          </label>
          <select
            value={selectedAutomate}
            onChange={(e) => setSelectedAutomate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tous les automates</option>
            {automates.map((automate) => (
              <option key={automate.id} value={automate.id}>
                {automate.name} - {automate.manufacturer}
              </option>
            ))}
          </select>
          <select
            value={filters.days}
            onChange={(e) => setFilters(prev => ({ ...prev, days: e.target.value }))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7">{t.last7Days}</option>
            <option value="30">{t.last30Days}</option>
            <option value="90">{t.last90Days}</option>
            <option value="365">{t.allTime}</option>
          </select>
        </div>
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Statistics Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalResults}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalResults || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.passRate}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {calculatePassRate()}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.failRate}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats ? Math.round(((stats.statusStats.find(s => s.status === 'fail')?._count.status || 0) / stats.totalResults) * 100) : 0}%
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.warningRate}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats ? Math.round(((stats.statusStats.find(s => s.status === 'warning')?._count.status || 0) / stats.totalResults) * 100) : 0}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.status}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Tous</option>
                    <option value="pass">{t.statuses.pass}</option>
                    <option value="fail">{t.statuses.fail}</option>
                    <option value="warning">{t.statuses.warning}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.level}
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Tous</option>
                    <option value="Low">{t.levels.Low}</option>
                    <option value="Normal">{t.levels.Normal}</option>
                    <option value="High">{t.levels.High}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.testName}
                  </label>
                  <input
                    type="text"
                    value={filters.testName}
                    onChange={(e) => setFilters(prev => ({ ...prev, testName: e.target.value }))}
                    placeholder={t.search}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ status: '', level: '', testName: '', automateId: '', days: '30' })}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
                </div>
              ) : qcResults.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t.noResults}
                  </h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.testName}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.automate}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.level}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.value}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.expected}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.deviation}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.status}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.timestamp}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {qcResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {result.testName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {result.automate.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {t.levels[result.level as keyof typeof t.levels] || result.level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {result.value.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {result.expected.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              {getDeviationTrend(result.deviation)}
                              <span className="ml-1">{result.deviation.toFixed(2)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                              {getStatusIcon(result.status)}
                              <span className="ml-1">{t.statuses[result.status as keyof typeof t.statuses]}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(result.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <Eye size={16} />
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                                <Edit size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Affichage de{' '}
                          <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                          {' '}à{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>
                          {' '}sur{' '}
                          <span className="font-medium">{pagination.total}</span>
                          {' '}résultats
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Précédent
                          </button>
                          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setPagination(prev => ({ ...prev, page }))}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === pagination.page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Suivant
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <QCStatistics stats={stats} loading={loading} />
        )}

        {activeTab === 'alerts' && (
          <QCAlerts onAlertCount={setAlertCount} />
        )}

        {activeTab === 'reports' && (
          <QCReporting />
        )}
      </div>

      {/* Add QC Result Modal */}
      <AddQCResultModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
        automateId={selectedAutomate}
      />
    </div>
  );
}