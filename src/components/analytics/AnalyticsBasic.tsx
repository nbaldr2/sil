import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, BarChart, PieChart, KPICard } from './ChartComponents';
import { API_BASE_URL } from '../../config/api';

interface AnalyticsData {
  testsPerDay: Array<{ date: string; count: number }>;
  avgTAT: number;
  departmentShare: Array<{ category: string; revenue: number }>;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  activeTechnicians: number;
  completionRate: number;
}

const AnalyticsBasic: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('sil_lab_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/overview?period=${period}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      // Set fallback data for demo purposes
      setData({
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No analytics data available</div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const samplesLineData = data.testsPerDay.map(item => ({
    date: item.date,
    value: item.count
  }));

  const departmentBarData = data.departmentShare.map(item => ({
    category: item.category,
    value: item.revenue
  }));

  const departmentPieData = data.departmentShare.map(item => ({
    category: item.category,
    value: item.revenue
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Essential laboratory metrics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-800">
              <strong>Note:</strong> {error} Showing sample data for demonstration.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Samples"
          value={data.totalRequests}
          icon={<Activity className="w-6 h-6 text-blue-500" />}
          trend={{
            direction: 'up',
            value: '+12%',
            label: 'vs last period'
          }}
        />
        
        <KPICard
          title="Avg Turnaround Time"
          value={data.avgTAT.toFixed(1)}
          unit="hrs"
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          trend={{
            direction: 'down',
            value: '-8%',
            label: 'improvement'
          }}
        />
        
        <KPICard
          title="Active Technicians"
          value={data.activeTechnicians}
          icon={<Users className="w-6 h-6 text-green-500" />}
          trend={{
            direction: 'stable',
            value: '0%',
            label: 'no change'
          }}
        />
        
        <KPICard
          title="Completion Rate"
          value={data.completionRate.toFixed(1)}
          unit="%"
          icon={<CheckCircle className="w-6 h-6 text-purple-500" />}
          trend={{
            direction: 'up',
            value: '+3%',
            label: 'vs last period'
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Samples Processed Line Chart */}
        <LineChart
          title="Samples Processed Over Time"
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          data={samplesLineData}
          height={300}
          color="#3B82F6"
          smooth={true}
          gradient={true}
        />

        {/* Department Distribution Pie Chart */}
        <PieChart
          title="Work Distribution by Department"
          icon={<Target className="w-5 h-5 text-green-500" />}
          data={departmentPieData}
          height={300}
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
          donut={true}
        />
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tests by Category Bar Chart */}
        <BarChart
          title="Test Volume by Category"
          icon={<BarChart3 className="w-5 h-5 text-purple-500" />}
          data={departmentBarData}
          height={250}
          colors={['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444']}
          horizontal={false}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.completedRequests}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.pendingRequests}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.testsPerDay.length > 0 ? Math.round(data.testsPerDay.reduce((sum, day) => sum + day.count, 0) / data.testsPerDay.length) : 0}
            </div>
            <div className="text-sm text-gray-500">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.testsPerDay.length > 0 ? Math.max(...data.testsPerDay.map(d => d.count)) : 0}
            </div>
            <div className="text-sm text-gray-500">Peak Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsBasic;