import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, BarChart3, TrendingUp, Printer } from 'lucide-react';
import { useAuth } from '../App';
import { qualityControlService } from '../services/qualityControl';

interface QCReportData {
  automates: Array<{
    id: string;
    name: string;
    manufacturer: string;
    type: string;
    totalResults: number;
    passRate: number;
    warningRate: number;
    failRate: number;
    tests: Array<{
      testName: string;
      totalResults: number;
      passRate: number;
      avgDeviation: number;
    }>;
  }>;
  summary: {
    totalResults: number;
    overallPassRate: number;
    totalAutomates: number;
    reportPeriod: string;
  };
  trends: Array<{
    date: string;
    passRate: number;
    totalResults: number;
  }>;
}

export default function QCReporting() {
  const { language } = useAuth();
  const [reportData, setReportData] = useState<QCReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedAutomates, setSelectedAutomates] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'trends'>('summary');
  const [automates, setAutomates] = useState<any[]>([]);

  const t = {
    fr: {
      title: 'Rapports Contrôle Qualité',
      generateReport: 'Générer le rapport',
      exportPDF: 'Exporter PDF',
      exportExcel: 'Exporter Excel',
      print: 'Imprimer',
      dateRange: 'Période',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      selectAutomates: 'Sélectionner les automates',
      allAutomates: 'Tous les automates',
      reportType: 'Type de rapport',
      summary: 'Résumé',
      detailed: 'Détaillé',
      trends: 'Tendances',
      loading: 'Génération du rapport...',
      noData: 'Aucune donnée disponible pour la période sélectionnée',
      overallSummary: 'Résumé général',
      totalResults: 'Total des résultats',
      overallPassRate: 'Taux de réussite global',
      totalAutomates: 'Nombre d\'automates',
      reportPeriod: 'Période du rapport',
      automatePerformance: 'Performance par automate',
      automate: 'Automate',
      manufacturer: 'Fabricant',
      type: 'Type',
      results: 'Résultats',
      passRate: 'Taux de réussite',
      warningRate: 'Taux d\'avertissement',
      failRate: 'Taux d\'échec',
      testPerformance: 'Performance par test',
      testName: 'Nom du test',
      avgDeviation: 'Déviation moyenne',
      trendAnalysis: 'Analyse des tendances',
      date: 'Date',
      dailyPassRate: 'Taux de réussite quotidien',
      dailyResults: 'Résultats quotidiens'
    },
    en: {
      title: 'Quality Control Reports',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      print: 'Print',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      selectAutomates: 'Select Automates',
      allAutomates: 'All Automates',
      reportType: 'Report Type',
      summary: 'Summary',
      detailed: 'Detailed',
      trends: 'Trends',
      loading: 'Generating report...',
      noData: 'No data available for the selected period',
      overallSummary: 'Overall Summary',
      totalResults: 'Total Results',
      overallPassRate: 'Overall Pass Rate',
      totalAutomates: 'Total Automates',
      reportPeriod: 'Report Period',
      automatePerformance: 'Automate Performance',
      automate: 'Automate',
      manufacturer: 'Manufacturer',
      type: 'Type',
      results: 'Results',
      passRate: 'Pass Rate',
      warningRate: 'Warning Rate',
      failRate: 'Fail Rate',
      testPerformance: 'Test Performance',
      testName: 'Test Name',
      avgDeviation: 'Avg Deviation',
      trendAnalysis: 'Trend Analysis',
      date: 'Date',
      dailyPassRate: 'Daily Pass Rate',
      dailyResults: 'Daily Results'
    }
  }[language];

  useEffect(() => {
    loadAutomates();
  }, []);

  const loadAutomates = async () => {
    try {
      const data = await qualityControlService.getAutomates();
      setAutomates(data.automates);
      setSelectedAutomates(data.automates.map((a: any) => a.id));
    } catch (error) {
      console.error('Error loading automates:', error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call a dedicated reporting API
      const reportData: QCReportData = {
        automates: [],
        summary: {
          totalResults: 0,
          overallPassRate: 0,
          totalAutomates: selectedAutomates.length,
          reportPeriod: `${dateRange.startDate} - ${dateRange.endDate}`
        },
        trends: []
      };

      // Generate data for each selected automate
      for (const automateId of selectedAutomates) {
        const qcData = await qualityControlService.getAutomateQCResults(automateId, {
          limit: 1000
        });
        
        const stats = await qualityControlService.getQCStats(automateId, 30);
        
        const automate = automates.find(a => a.id === automateId);
        if (automate && qcData.qcResults.length > 0) {
          const passCount = stats.statusStats.find(s => s.status === 'pass')?._count.status || 0;
          const warningCount = stats.statusStats.find(s => s.status === 'warning')?._count.status || 0;
          const failCount = stats.statusStats.find(s => s.status === 'fail')?._count.status || 0;
          const total = passCount + warningCount + failCount;

          // Group tests by name and calculate averages
          const testGroups = qcData.qcResults.reduce((acc: any, result: any) => {
            if (!acc[result.testName]) {
              acc[result.testName] = { results: [], deviations: [] };
            }
            acc[result.testName].results.push(result);
            acc[result.testName].deviations.push(Math.abs(result.deviation));
            return acc;
          }, {});

          const tests = Object.entries(testGroups).map(([testName, data]: [string, any]) => {
            const testPassCount = data.results.filter((r: any) => r.status === 'pass').length;
            const avgDeviation = data.deviations.reduce((sum: number, dev: number) => sum + dev, 0) / data.deviations.length;
            
            return {
              testName,
              totalResults: data.results.length,
              passRate: Math.round((testPassCount / data.results.length) * 100),
              avgDeviation: Math.round(avgDeviation * 10) / 10
            };
          });

          reportData.automates.push({
            id: automate.id,
            name: automate.name,
            manufacturer: automate.manufacturer,
            type: automate.type,
            totalResults: total,
            passRate: total > 0 ? Math.round((passCount / total) * 100) : 0,
            warningRate: total > 0 ? Math.round((warningCount / total) * 100) : 0,
            failRate: total > 0 ? Math.round((failCount / total) * 100) : 0,
            tests
          });

          reportData.summary.totalResults += total;
        }
      }

      // Calculate overall pass rate
      const totalPass = reportData.automates.reduce((sum, a) => sum + (a.totalResults * a.passRate / 100), 0);
      reportData.summary.overallPassRate = reportData.summary.totalResults > 0 
        ? Math.round((totalPass / reportData.summary.totalResults) * 100) 
        : 0;

      // Generate trend data (mock data for demonstration)
      const days = Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24));
      for (let i = 0; i < Math.min(days, 30); i++) {
        const date = new Date(new Date(dateRange.startDate).getTime() + i * 24 * 60 * 60 * 1000);
        reportData.trends.push({
          date: date.toISOString().split('T')[0],
          passRate: Math.round(85 + Math.random() * 10), // Mock data
          totalResults: Math.round(20 + Math.random() * 30) // Mock data
        });
      }

      setReportData(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // In a real implementation, this would generate a PDF
    console.log('Exporting to PDF...');
    alert('PDF export functionality would be implemented here');
  };

  const exportToExcel = () => {
    // In a real implementation, this would generate an Excel file
    console.log('Exporting to Excel...');
    alert('Excel export functionality would be implemented here');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h2>
        
        {reportData && (
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <FileText size={16} />
              <span>{t.exportPDF}</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={16} />
              <span>{t.exportExcel}</span>
            </button>
            <button
              onClick={printReport}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <Printer size={16} />
              <span>{t.print}</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.dateRange}
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Automate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.selectAutomates}
            </label>
            <select
              multiple
              value={selectedAutomates}
              onChange={(e) => setSelectedAutomates(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20"
            >
              {automates.map((automate) => (
                <option key={automate.id} value={automate.id}>
                  {automate.name}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.reportType}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="summary">{t.summary}</option>
              <option value="detailed">{t.detailed}</option>
              <option value="trends">{t.trends}</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading || selectedAutomates.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <BarChart3 size={16} />
                  <span>{t.generateReport}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6 print:space-y-4">
          {/* Overall Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t.overallSummary}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalResults}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.totalResults}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.summary.overallPassRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.overallPassRate}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{reportData.summary.totalAutomates}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.totalAutomates}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{reportData.summary.reportPeriod}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.reportPeriod}</div>
              </div>
            </div>
          </div>

          {/* Automate Performance */}
          {(reportType === 'summary' || reportType === 'detailed') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t.automatePerformance}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.automate}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.manufacturer}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.type}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.results}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.passRate}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.warningRate}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.failRate}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.automates.map((automate) => (
                      <tr key={automate.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {automate.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {automate.manufacturer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {automate.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {automate.totalResults}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {automate.passRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-yellow-600">
                            {automate.warningRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-600">
                            {automate.failRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Test Performance */}
          {reportType === 'detailed' && reportData.automates.map((automate) => (
            <div key={automate.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t.testPerformance} - {automate.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.testName}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.results}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.passRate}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.avgDeviation}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {automate.tests.map((test, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {test.testName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {test.totalResults}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {test.passRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {test.avgDeviation}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Trend Analysis */}
          {reportType === 'trends' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t.trendAnalysis}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.date}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.dailyResults}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.dailyPassRate}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.trends.map((trend, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(trend.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trend.totalResults}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {trend.passRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {reportData && reportData.summary.totalResults === 0 && (
        <div className="text-center py-8">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.noData}
          </h3>
        </div>
      )}
    </div>
  );
}