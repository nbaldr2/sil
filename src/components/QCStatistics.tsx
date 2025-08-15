import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../App';

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

interface QCStatisticsProps {
  stats: QCStats | null;
  loading: boolean;
}

export default function QCStatistics({ stats, loading }: QCStatisticsProps) {
  const { language } = useAuth();

  const t = {
    fr: {
      title: 'Statistiques de Contrôle Qualité',
      totalResults: 'Total des résultats',
      passRate: 'Taux de réussite',
      failRate: 'Taux d\'échec',
      warningRate: 'Taux d\'avertissement',
      testDistribution: 'Distribution par test',
      statusDistribution: 'Distribution par statut',
      noData: 'Aucune donnée disponible',
      loading: 'Chargement des statistiques...',
      statuses: {
        pass: 'Réussi',
        fail: 'Échec',
        warning: 'Avertissement'
      }
    },
    en: {
      title: 'Quality Control Statistics',
      totalResults: 'Total results',
      passRate: 'Pass rate',
      failRate: 'Fail rate',
      warningRate: 'Warning rate',
      testDistribution: 'Distribution by test',
      statusDistribution: 'Distribution by status',
      noData: 'No data available',
      loading: 'Loading statistics...',
      statuses: {
        pass: 'Pass',
        fail: 'Fail',
        warning: 'Warning'
      }
    }
  }[language];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
      </div>
    );
  }

  if (!stats || stats.totalResults === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t.noData}
        </h3>
      </div>
    );
  }

  const getStatusCount = (status: string) => {
    return stats.statusStats.find(s => s.status === status)?._count.status || 0;
  };

  const passCount = getStatusCount('pass');
  const failCount = getStatusCount('fail');
  const warningCount = getStatusCount('warning');

  const passRate = Math.round((passCount / stats.totalResults) * 100);
  const failRate = Math.round((failCount / stats.totalResults) * 100);
  const warningRate = Math.round((warningCount / stats.totalResults) * 100);

  // Group test stats by test name
  const testGroups = stats.testStats.reduce((acc, stat) => {
    if (!acc[stat.testName]) {
      acc[stat.testName] = { pass: 0, fail: 0, warning: 0, total: 0 };
    }
    acc[stat.testName][stat.status as keyof typeof acc[stat.testName]] += stat._count.testName;
    acc[stat.testName].total += stat._count.testName;
    return acc;
  }, {} as Record<string, { pass: number; fail: number; warning: number; total: number }>);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {t.title}
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalResults}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalResults}
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
                {passRate}%
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
                {failRate}%
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
                {warningRate}%
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t.statusDistribution}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.statuses.pass}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                  {passCount}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${passRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.statuses.warning}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                  {warningCount}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${warningRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.statuses.fail}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                  {failCount}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${failRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t.testDistribution}
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(testGroups)
              .sort(([,a], [,b]) => b.total - a.total)
              .slice(0, 10)
              .map(([testName, counts]) => {
                const testPassRate = Math.round((counts.pass / counts.total) * 100);
                return (
                  <div key={testName} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {testName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {counts.total} tests
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <div
                        className="bg-green-500 h-2 rounded-l"
                        style={{ width: `${(counts.pass / counts.total) * 100}%` }}
                      ></div>
                      <div
                        className="bg-yellow-500 h-2"
                        style={{ width: `${(counts.warning / counts.total) * 100}%` }}
                      ></div>
                      <div
                        className="bg-red-500 h-2 rounded-r"
                        style={{ width: `${(counts.fail / counts.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{testPassRate}% réussite</span>
                      <span>
                        {counts.pass}P / {counts.warning}W / {counts.fail}F
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Analyse des tendances
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Tendance positive</p>
            <p className="text-lg font-semibold text-green-600">
              {passRate > 80 ? 'Excellente' : passRate > 60 ? 'Bonne' : 'À améliorer'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Stabilité</p>
            <p className="text-lg font-semibold text-blue-600">
              {warningRate < 10 ? 'Stable' : warningRate < 20 ? 'Modérée' : 'Instable'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Alertes</p>
            <p className="text-lg font-semibold text-red-600">
              {failRate < 5 ? 'Faible' : failRate < 15 ? 'Modéré' : 'Élevé'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}