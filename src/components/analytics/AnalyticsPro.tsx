import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  Plus,
  Zap,
  Target,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useAuth } from '../../App';
import { moduleService } from '../../services/moduleService';
import { analyticsService, AnalyticsData, KPIData, ChartData, InsightData } from '../../services/analyticsService';

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
  target?: number;
}

interface ChartData {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  period: string;
}

export default function AnalyticsPro() {
  const { language } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kpis' | 'reports' | 'settings'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [moduleAccess, setModuleAccess] = useState<any>(null);

  const t = {
    fr: {
      title: 'Analytics Pro',
      subtitle: 'Analyses avancées et intelligence d\'affaires',
      dashboard: 'Tableau de bord',
      kpis: 'Indicateurs KPI',
      reports: 'Rapports',
      settings: 'Paramètres',
      overview: 'Vue d\'ensemble',
      performance: 'Performance',
      trends: 'Tendances',
      insights: 'Insights',
      period: 'Période',
      last7days: '7 derniers jours',
      last30days: '30 derniers jours',
      last90days: '90 derniers jours',
      thisYear: 'Cette année',
      export: 'Exporter',
      refresh: 'Actualiser',
      customize: 'Personnaliser',
      addWidget: 'Ajouter Widget',
      totalTests: 'Tests Totaux',
      completedTests: 'Tests Terminés',
      pendingTests: 'Tests en Attente',
      averageTime: 'Temps Moyen',
      efficiency: 'Efficacité',
      revenue: 'Revenus',
      customers: 'Clients',
      growth: 'Croissance',
      target: 'Objectif',
      actual: 'Réel',
      vs: 'vs',
      increase: 'Augmentation',
      decrease: 'Diminution',
      stable: 'Stable',
      noAccess: 'Accès refusé',
      moduleNotActive: 'Le module Analytics Pro n\'est pas activé ou a expiré.',
      activateModule: 'Activer le module',
      trialExpired: 'Votre période d\'essai a expiré',
      daysRemaining: 'jours restants',
      upgradeNow: 'Mettre à niveau maintenant'
    },
    en: {
      title: 'Analytics Pro',
      subtitle: 'Advanced analytics and business intelligence',
      dashboard: 'Dashboard',
      kpis: 'KPIs',
      reports: 'Reports',
      settings: 'Settings',
      overview: 'Overview',
      performance: 'Performance',
      trends: 'Trends',
      insights: 'Insights',
      period: 'Period',
      last7days: 'Last 7 days',
      last30days: 'Last 30 days',
      last90days: 'Last 90 days',
      thisYear: 'This year',
      export: 'Export',
      refresh: 'Refresh',
      customize: 'Customize',
      addWidget: 'Add Widget',
      totalTests: 'Total Tests',
      completedTests: 'Completed Tests',
      pendingTests: 'Pending Tests',
      averageTime: 'Average Time',
      efficiency: 'Efficiency',
      revenue: 'Revenue',
      customers: 'Customers',
      growth: 'Growth',
      target: 'Target',
      actual: 'Actual',
      vs: 'vs',
      increase: 'Increase',
      decrease: 'Decrease',
      stable: 'Stable',
      noAccess: 'Access Denied',
      moduleNotActive: 'Analytics Pro module is not active or has expired.',
      activateModule: 'Activate Module',
      trialExpired: 'Your trial period has expired',
      daysRemaining: 'days remaining',
      upgradeNow: 'Upgrade Now'
    }
  }[language];

  useEffect(() => {
    checkModuleAccess();
  }, []);

  const checkModuleAccess = async () => {
    setLoading(true);
    try {
      const access = await moduleService.checkModuleAccess('analytics-pro');
      setModuleAccess(access);
      setHasAccess(access.hasAccess);
      
      if (access.hasAccess) {
        loadAnalyticsData();
      }
    } catch (error) {
      console.error('Error checking module access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = () => {
    // Mock KPI data
    setKpis([
      {
        id: '1',
        name: t.totalTests,
        value: 1247,
        previousValue: 1156,
        unit: '',
        trend: 'up',
        category: 'performance',
        target: 1300
      },
      {
        id: '2',
        name: t.completedTests,
        value: 1189,
        previousValue: 1098,
        unit: '',
        trend: 'up',
        category: 'performance'
      },
      {
        id: '3',
        name: t.pendingTests,
        value: 58,
        previousValue: 58,
        unit: '',
        trend: 'stable',
        category: 'performance'
      },
      {
        id: '4',
        name: t.averageTime,
        value: 24.5,
        previousValue: 26.2,
        unit: 'min',
        trend: 'down',
        category: 'efficiency'
      },
      {
        id: '5',
        name: t.efficiency,
        value: 95.3,
        previousValue: 94.1,
        unit: '%',
        trend: 'up',
        category: 'efficiency',
        target: 96
      },
      {
        id: '6',
        name: t.revenue,
        value: 45680,
        previousValue: 42150,
        unit: 'MAD',
        trend: 'up',
        category: 'financial'
      }
    ]);

    // Mock chart data
    setCharts([
      {
        id: '1',
        name: 'Tests per Day',
        type: 'line',
        data: [
          { date: '2024-01-01', value: 45 },
          { date: '2024-01-02', value: 52 },
          { date: '2024-01-03', value: 48 },
          { date: '2024-01-04', value: 61 },
          { date: '2024-01-05', value: 55 },
          { date: '2024-01-06', value: 67 },
          { date: '2024-01-07', value: 59 }
        ],
        period: selectedPeriod
      },
      {
        id: '2',
        name: 'Test Categories',
        type: 'pie',
        data: [
          { category: 'Hematology', value: 35 },
          { category: 'Biochemistry', value: 28 },
          { category: 'Microbiology', value: 22 },
          { category: 'Immunology', value: 15 }
        ],
        period: selectedPeriod
      }
    ]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t.noAccess}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.moduleNotActive}
            </p>
            {moduleAccess && moduleAccess.status === 'EXPIRED' && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  {t.trialExpired}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.href = '/config/modules'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {moduleAccess?.status === 'EXPIRED' ? t.upgradeNow : t.activateModule}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t.subtitle}
                </p>
              </div>
            </div>
            
            {/* Module Status */}
            {moduleAccess && (
              <div className="flex items-center space-x-4">
                {moduleAccess.status === 'TRIAL' && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1">
                    <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                      Trial: {moduleAccess.daysRemaining} {t.daysRemaining}
                    </span>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={loadAnalyticsData}
                    className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.refresh}
                  </button>
                  <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    {t.export}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
              { id: 'kpis', label: t.kpis, icon: Target },
              { id: 'reports', label: t.reports, icon: Activity },
              { id: 'settings', label: t.settings, icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.period}:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">{t.last7days}</option>
              <option value="30d">{t.last30days}</option>
              <option value="90d">{t.last90days}</option>
              <option value="1y">{t.thisYear}</option>
            </select>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {kpi.name}
                    </h3>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {kpi.value.toLocaleString()}
                    </span>
                    {kpi.unit && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {kpi.unit}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                      {kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}
                      {Math.abs(parseFloat(calculatePercentageChange(kpi.value, kpi.previousValue)))}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t.vs} {t.period.toLowerCase()}
                    </span>
                  </div>
                  
                  {kpi.target && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t.target}</span>
                        <span className="text-gray-900 dark:text-white">{kpi.target}</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t.trends}
                  </h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Chart visualization would be here</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Integration with Chart.js or similar</p>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Distribution
                  </h3>
                  <PieChart className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Pie chart visualization</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Test categories breakdown</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Tab */}
        {activeTab === 'kpis' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t.kpis} {t.overview}
              </h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t.addWidget}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {kpi.name}
                    </span>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpi.value.toLocaleString()} {kpi.unit}
                  </div>
                  <div className={`text-sm ${getTrendColor(kpi.trend)}`}>
                    {calculatePercentageChange(kpi.value, kpi.previousValue)}% change
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t.reports}
            </h2>
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Advanced Reporting
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Generate detailed reports with custom filters and export options
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Create Report
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t.settings}
            </h2>
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Analytics Configuration
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Configure dashboards, alerts, and data sources
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {t.customize}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}