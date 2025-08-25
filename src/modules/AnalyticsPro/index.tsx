import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  Target,
  AlertTriangle,
  Zap,
  Settings,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle
} from 'lucide-react';
import { 
  LineChart, 
  BarChart, 
  PieChart as PieChartComponent, 
  StackedBarChart, 
  HeatmapChart, 
  ScatterChart, 
  PredictiveChart,
  KPICard 
} from '../../components/analytics/ChartComponents';

// Widget component for module store
const AnalyticsProWidget: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-2">Analytics Pro</h2>
    <p className="text-sm text-gray-600 dark:text-gray-300">Advanced analytics and BI: custom dashboards, KPI tracking, and predictive insights.</p>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="text-2xl font-bold">Advanced</div>
        <div className="text-sm text-gray-500">Interactive Charts</div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="text-2xl font-bold">Predictive</div>
        <div className="text-sm text-gray-500">AI Insights</div>
      </div>
    </div>
  </div>
);

// Interfaces
interface AdvancedAnalyticsData {
  workloadByDept: Record<string, Record<string, number>>;
  heatmapData: Record<string, Record<string, number>>;
  errorData: any[];
  technicianPerformance: any[];
  dailyRevenue: Record<string, number>;
  period: string;
}

interface PredictionsData {
  historical: Array<{ date: string; count: number }>;
  forecast: Array<{ day: number; predicted: number; confidence: number }>;
  insights: {
    trend: string;
    averageDaily: number;
    recommendation: string;
  };
}

interface BasicAnalyticsData {
  testsPerDay: Array<{ date: string; count: number }>;
  avgTAT: number;
  departmentShare: Array<{ category: string; revenue: number }>;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  activeTechnicians: number;
  completionRate: number;
}

// Main Analytics Pro Page Component
const AnalyticsProPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [period, setPeriod] = useState('30d');
  const [department, setDepartment] = useState('all');
  const [technician, setTechnician] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [basicData, setBasicData] = useState<BasicAnalyticsData | null>(null);
  const [advancedData, setAdvancedData] = useState<AdvancedAnalyticsData | null>(null);
  const [predictionsData, setPredictionsData] = useState<PredictionsData | null>(null);

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = 'http://localhost:5001/api';
      const token = localStorage.getItem('sil_lab_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [basicResponse, advancedResponse, predictionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview?period=${period}`, { headers }),
        fetch(`${API_BASE_URL}/analytics/advanced?period=${period}&department=${department}&technician=${technician}`, { headers }),
        fetch(`${API_BASE_URL}/analytics/predictions`, { headers })
      ]);

      if (basicResponse.ok) {
        const basic = await basicResponse.json();
        setBasicData(basic);
      }

      if (advancedResponse.ok) {
        const advanced = await advancedResponse.json();
        setAdvancedData(advanced);
      }

      if (predictionsResponse.ok) {
        const predictions = await predictionsResponse.json();
        setPredictionsData(predictions);
      }

    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Using sample data for demonstration.');
      
      // Set fallback data
      setBasicData({
        testsPerDay: [
          { date: '2025-08-15', count: 45 },
          { date: '2025-08-16', count: 52 },
          { date: '2025-08-17', count: 38 },
          { date: '2025-08-18', count: 61 },
          { date: '2025-08-19', count: 49 },
          { date: '2025-08-20', count: 55 },
          { date: '2025-08-21', count: 43 }
        ],
        avgTAT: 4.2,
        departmentShare: [
          { category: 'Hematology', revenue: 45 },
          { category: 'Biochemistry', revenue: 35 },
          { category: 'Immunology', revenue: 20 }
        ],
        totalRequests: 156,
        completedRequests: 142,
        pendingRequests: 14,
        activeTechnicians: 8,
        completionRate: 91.0
      });

      setAdvancedData({
        workloadByDept: {
          '2025-08-20': { 'Hematology': 15, 'Biochemistry': 12, 'Immunology': 8 },
          '2025-08-21': { 'Hematology': 18, 'Biochemistry': 10, 'Immunology': 6 }
        },
        heatmapData: {
          '8': { '1': 5, '2': 8, '3': 12, '4': 15, '5': 10 },
          '9': { '1': 8, '2': 12, '3': 18, '4': 20, '5': 15 },
          '10': { '1': 12, '2': 15, '3': 22, '4': 25, '5': 18 }
        },
        errorData: [],
        technicianPerformance: [],
        dailyRevenue: {
          '2025-08-20': 1250,
          '2025-08-21': 1180
        },
        period: '30d'
      });

      setPredictionsData({
        historical: [
          { date: '2025-08-15', count: 45 },
          { date: '2025-08-16', count: 52 },
          { date: '2025-08-17', count: 38 }
        ],
        forecast: [
          { day: 1, predicted: 48, confidence: 0.85 },
          { day: 2, predicted: 52, confidence: 0.80 },
          { day: 3, predicted: 46, confidence: 0.75 }
        ],
        insights: {
          trend: 'stable',
          averageDaily: 48,
          recommendation: 'Maintain current staffing levels'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, department, technician]);

  const handleExport = (format: string) => {
    // Export functionality would be implemented here
    console.log(`Exporting data in ${format} format`);
    alert(`Export in ${format} format - Feature coming soon!`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'predictions', label: 'Predictions', icon: <Zap className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <Eye className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const prepareStackedBarData = () => {
    if (!advancedData?.workloadByDept) return { series: [], categories: [] };
    
    const dates = Object.keys(advancedData.workloadByDept).sort();
    const departments = new Set<string>();
    
    dates.forEach(date => {
      Object.keys(advancedData.workloadByDept[date]).forEach(dept => {
        departments.add(dept);
      });
    });
    
    const series = Array.from(departments).map(dept => ({
      name: dept,
      data: dates.map(date => advancedData.workloadByDept[date][dept] || 0)
    }));
    
    return { series, categories: dates.map(d => new Date(d).toLocaleDateString()) };
  };

  const prepareHeatmapData = () => {
    if (!advancedData?.heatmapData) return { series: [], categories: [] };
    
    const hours = Object.keys(advancedData.heatmapData).sort((a, b) => parseInt(a) - parseInt(b));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const series = hours.map(hour => ({
      name: `${hour}:00`,
      data: days.map((_, dayIndex) => advancedData.heatmapData[hour]?.[dayIndex] || 0)
    }));
    
    return { series, categories: days };
  };

  const preparePredictiveData = () => {
    if (!predictionsData) return { actualData: [], forecastData: [], categories: [] };
    
    const historical = predictionsData.historical.map(h => h.count);
    const forecast = predictionsData.forecast.map(f => f.predicted);
    
    // Combine historical and forecast with nulls for separation
    const actualData = [...historical, ...Array(forecast.length).fill(null)];
    const forecastData = [...Array(historical.length).fill(null), ...forecast];
    
    const categories = [
      ...predictionsData.historical.map(h => new Date(h.date).toLocaleDateString()),
      ...predictionsData.forecast.map(f => `Day +${f.day}`)
    ];
    
    return { actualData, forecastData, categories };
  };

  const stackedBarData = prepareStackedBarData();
  const heatmapData = prepareHeatmapData();
  const predictiveData = preparePredictiveData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Pro</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Advanced laboratory analytics with predictive insights
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Departments</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Immunology">Immunology</option>
          </select>
          
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <div className="text-yellow-800">
              <strong>Note:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && basicData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Samples"
              value={basicData.totalRequests}
              icon={<Activity className="w-6 h-6 text-blue-500" />}
              trend={{ direction: 'up', value: '+12%', label: 'vs last period' }}
            />
            <KPICard
              title="Avg Turnaround Time"
              value={basicData.avgTAT.toFixed(1)}
              unit="hrs"
              icon={<Clock className="w-6 h-6 text-orange-500" />}
              trend={{ direction: 'down', value: '-8%', label: 'improvement' }}
            />
            <KPICard
              title="Active Technicians"
              value={basicData.activeTechnicians}
              icon={<Users className="w-6 h-6 text-green-500" />}
              trend={{ direction: 'stable', value: '0%', label: 'no change' }}
            />
            <KPICard
              title="Completion Rate"
              value={basicData.completionRate.toFixed(1)}
              unit="%"
              icon={<CheckCircle className="w-6 h-6 text-purple-500" />}
              trend={{ direction: 'up', value: '+3%', label: 'vs last period' }}
            />
          </div>

          {/* Advanced Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stacked Bar Chart */}
            <StackedBarChart
              title="Workload by Department Over Time"
              icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
              series={stackedBarData.series}
              categories={stackedBarData.categories}
              height={350}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
            />

            {/* Heatmap */}
            <HeatmapChart
              title="Test Volumes by Hour & Day"
              icon={<Target className="w-5 h-5 text-red-500" />}
              series={heatmapData.series}
              categories={heatmapData.categories}
              height={350}
              color="#EF4444"
            />
          </div>

          {/* Revenue and Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {basicData.testsPerDay.length > 0 && (
              <LineChart
                title="Daily Test Volume Trend"
                icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                data={basicData.testsPerDay.map(d => ({ date: d.date, value: d.count }))}
                height={300}
                color="#10B981"
                smooth={true}
                gradient={true}
              />
            )}

            {basicData.departmentShare.length > 0 && (
              <PieChartComponent
                title="Department Distribution"
                icon={<PieChart className="w-5 h-5 text-purple-500" />}
                data={basicData.departmentShare.map(d => ({ category: d.category, value: d.revenue }))}
                height={300}
                colors={['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444']}
                donut={true}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Trend Analysis</h3>
            <p className="text-gray-500">Detailed trend analysis and comparative views coming soon!</p>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && predictionsData && (
        <div className="space-y-6">
          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Trend</div>
                  <div className="text-xl font-bold capitalize">{predictionsData.insights.trend}</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Daily Average</div>
                  <div className="text-xl font-bold">{predictionsData.insights.averageDaily}</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Forecast Confidence</div>
                  <div className="text-xl font-bold">85%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Chart */}
          <PredictiveChart
            title="7-Day Workload Forecast"
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            actualData={predictiveData.actualData}
            forecastData={predictiveData.forecastData}
            categories={predictiveData.categories}
            height={400}
          />

          {/* Recommendation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start">
              <Target className="w-6 h-6 text-blue-500 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  AI Recommendation
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {predictionsData.insights.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Custom Reports</h3>
            <p className="text-gray-500">Advanced report builder and custom analytics coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsProPage;
export { AnalyticsProWidget };