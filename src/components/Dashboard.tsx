import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  Eye,
  Heart,
  Stethoscope,
  TestTube,
  Microscope
} from 'lucide-react';
import { useAuth } from '../App';
import { requestsService, pricingService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';
import { stockService } from '../services/integrations';

interface DashboardData {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  urgentRequests: number;
  totalRevenue: number;
  averageRevenue: number;
  totalPatients: number;
  totalDoctors: number;
  monthlyGrowth: number;
  topAnalyses: Array<{ name: string; count: number; revenue: number }>;
  recentRequests: Array<any>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  // Add these new properties for stock data
  expiringProducts?: Array<{ name: string; code: string; expiringStock: number; currentStock: number; expiryDate?: string }>;
  lowStockProducts?: Array<{ name: string; code: string; currentStock: number; minStock: number }>;
}

export default function Dashboard() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    urgentRequests: 0,
    totalRevenue: 0,
    averageRevenue: 0,
    totalPatients: 0,
    totalDoctors: 0,
    monthlyGrowth: 0,
    topAnalyses: [],
    recentRequests: [],
    revenueByMonth: [],
    statusDistribution: [],
    expiringProducts: [],
    lowStockProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const t = {
    fr: {
      title: 'Tableau de Bord',
      subtitle: 'Vue d\'ensemble du laboratoire',
      totalRequests: 'Total Demandes',
      pendingRequests: 'Demandes en Attente',
      completedRequests: 'Demandes Terminées',
      urgentRequests: 'Demandes Urgentes',
      totalRevenue: 'Revenu Total',
      averageRevenue: 'Revenu Moyen',
      totalPatients: 'Total Patients',
      totalDoctors: 'Total Médecins',
      monthlyGrowth: 'Croissance Mensuelle',
      topAnalyses: 'Analyses les Plus Demandées',
      recentRequests: 'Demandes Récentes',
      revenueByMonth: 'Revenus par Mois',
      statusDistribution: 'Répartition par Statut',
      efficiencyMetrics: 'Métriques d\'Efficacité',
      qualityMetrics: 'Métriques de Qualité',
      performance: 'Performance',
      turnaroundTime: 'Temps de Traitement',
      accuracy: 'Précision',
      satisfaction: 'Satisfaction',
      hours: 'heures',
      percentage: '%',
      outOf: '/5',
      newPatients: 'Nouveaux Patients',
      returningPatients: 'Patients Récurrents',
      doctorReferrals: 'Références Médecins',
      viewAll: 'Voir Tout',
      period: 'Période',
      today: 'Aujourd\'hui',
      week: 'Cette Semaine',
      month: 'Ce Mois',
      quarter: 'Ce Trimestre',
      year: 'Cette Année',
      patient: 'Patient',
      doctor: 'Médecin',
      analyses: 'Analyses',
      status: 'Statut',
      date: 'Date',
      amount: 'Montant',
      urgent: 'Urgent',
      normal: 'Normal',
      pending: 'En attente',
      completed: 'Terminé',
      processing: 'En cours',
      cancelled: 'Annulé',
      noData: 'Aucune donnée disponible',
      loading: 'Chargement...',
      rating: 'Note',
      averageTime: 'Temps Moyen',
      productivity: 'Productivité',
      topDoctors: 'Médecins les Plus Actifs',
      revenueTrend: 'Tendance des Revenus',
      requestTrend: 'Tendance des Demandes',
      financialMetrics: 'Métriques Financières',
      operationalMetrics: 'Métriques Opérationnelles',
      expiringProducts: 'Produits Expirant Bientôt',
      lowStockProducts: 'Produits en Stock Faible',
      expiryDate: 'expire bientôt',
      currentStock: 'Stock actuel',
      minStock: 'Stock min',
      viewStockReport: 'Voir Rapport Complet'
    },
    en: {
      title: 'Dashboard',
      subtitle: 'Laboratory Overview',
      totalRequests: 'Total Requests',
      pendingRequests: 'Pending Requests',
      completedRequests: 'Completed Requests',
      urgentRequests: 'Urgent Requests',
      totalRevenue: 'Total Revenue',
      averageRevenue: 'Average Revenue',
      totalPatients: 'Total Patients',
      totalDoctors: 'Total Doctors',
      monthlyGrowth: 'Monthly Growth',
      topAnalyses: 'Top Analyses',
      recentRequests: 'Recent Requests',
      revenueByMonth: 'Revenue by Month',
      statusDistribution: 'Status Distribution',
      efficiencyMetrics: 'Efficiency Metrics',
      qualityMetrics: 'Quality Metrics',
      performance: 'Performance',
      turnaroundTime: 'Turnaround Time',
      accuracy: 'Accuracy',
      satisfaction: 'Satisfaction',
      hours: 'hours',
      percentage: '%',
      outOf: '/5',
      newPatients: 'New Patients',
      returningPatients: 'Returning Patients',
      doctorReferrals: 'Doctor Referrals',
      viewAll: 'View All',
      period: 'Period',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      patient: 'Patient',
      doctor: 'Doctor',
      analyses: 'Analyses',
      status: 'Status',
      date: 'Date',
      amount: 'Amount',
      urgent: 'Urgent',
      normal: 'Normal',
      pending: 'Pending',
      completed: 'Completed',
      processing: 'Processing',
      cancelled: 'Cancelled',
      noData: 'No data available',
      loading: 'Loading...',
      rating: 'Rating',
      averageTime: 'Average Time',
      productivity: 'Productivity',
      topDoctors: 'Most Active Doctors',
      revenueTrend: 'Revenue Trend',
      requestTrend: 'Request Trend',
      financialMetrics: 'Financial Metrics',
      operationalMetrics: 'Operational Metrics',
      expiringProducts: 'Expiring Products',
      lowStockProducts: 'Low Stock Products',
      expiryDate: 'expiring soon',
      currentStock: 'Current stock',
      minStock: 'Min stock',
      viewStockReport: 'View Full Report'
    }
  }[language];

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load requests data
      const requestsResult = await requestsService.getRequests({ _t: Date.now() });
      const requests = requestsResult.requests || [];
      
      // Load prices data
      const prices = pricingService.getPrices();
      
      // Calculate dashboard metrics
      const totalRequests = requests.length;
      const pendingRequests = requests.filter((r: any) => r.status === 'PENDING' || r.status === 'PROCESSING').length;
      const completedRequests = requests.filter((r: any) => r.status === 'COMPLETED').length;
      const urgentRequests = requests.filter((r: any) => r.priority === 'URGENT').length;
      
      // Calculate revenue
      let totalRevenue = 0;
      const analysisCounts: { [key: string]: number } = {};
      
      requests.forEach((request: any) => {
        // Add total amount from request
        totalRevenue += request.totalAmount || 0;
        
        // Count analyses
        if (request.requestAnalyses) {
          request.requestAnalyses.forEach((ra: any) => {
            const analysisName = ra.analysis.name;
            analysisCounts[analysisName] = (analysisCounts[analysisName] || 0) + 1;
          });
        }
      });
      
      const averageRevenue = totalRequests > 0 ? totalRevenue / totalRequests : 0;
      
      // Get unique patients and doctors
      const uniquePatients = new Set(requests.map((r: any) => r.patient?.id)).size;
      const uniqueDoctors = new Set(requests.map((r: any) => r.doctor?.id)).size;
      
      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const lastMonth = new Date();
      lastMonth.setMonth(currentMonth - 1);
      
      const currentMonthRequests = requests.filter((r: any) => {
        const requestDate = new Date(r.createdAt);
        return requestDate.getMonth() === currentMonth;
      }).length;
      
      const lastMonthRequests = requests.filter((r: any) => {
        const requestDate = new Date(r.createdAt);
        return requestDate.getMonth() === lastMonth.getMonth();
      }).length;
      
      const monthlyGrowth = lastMonthRequests > 0 ? ((currentMonthRequests - lastMonthRequests) / lastMonthRequests) * 100 : 0;
      
      // Top analyses
      const topAnalyses = Object.entries(analysisCounts)
        .map(([name, count]) => {
          // Calculate revenue based on the analysis price from requests
          let revenue = 0;
          requests.forEach((request: any) => {
            if (request.requestAnalyses) {
              request.requestAnalyses.forEach((ra: any) => {
                if (ra.analysis.name === name) {
                  revenue += ra.price;
                }
              });
            }
          });
          return { name, count, revenue };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Recent requests
      const recentRequests = requests
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      // Revenue by month (last 6 months)
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' });
        
        const monthRequests = requests.filter((r: any) => {
          const requestDate = new Date(r.createdAt);
          return requestDate.getMonth() === date.getMonth() && requestDate.getFullYear() === date.getFullYear();
        });
        
        let monthRevenue = 0;
        monthRequests.forEach((request: any) => {
          monthRevenue += request.totalAmount || 0;
        });
        
        revenueByMonth.push({ month: monthName, revenue: monthRevenue });
      }
      
      // Status distribution
      const statusCounts: { [key: string]: number } = {};
      requests.forEach((r: any) => {
        const status = r.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalRequests) * 100
      }));
      
      // NEW CODE: Load stock data for expiring and low stock products
      let expiringProducts: { name: any; code: any; expiringStock: any; currentStock: any; expiryDate?: any; }[] = [];
      let lowStockProducts: { name: any; code: any; currentStock: any; minStock: any; }[] = [];
      
      try {
        // Fetch stock data using the exportStockReport function
        const stockData = await stockService.exportStockReport();
        
        if (stockData && Array.isArray(stockData)) {
          // Filter and sort products that are expiring soon (have expiringStock > 0)
          expiringProducts = stockData
            .filter(product => product.expiringStock > 0)
            .sort((a, b) => b.expiringStock - a.expiringStock)
            .slice(0, 5)  // Limit to 5 items
            .map(product => ({
              name: product.name,
              code: product.code,
              expiringStock: product.expiringStock,
              currentStock: product.currentStock,
              expiryDate: product.earliestExpiryDate // Store the expiry date
            }));
          
          // Filter and sort products that are low in stock (currentStock <= minStock)
          lowStockProducts = stockData
            .filter(product => product.currentStock <= product.minStock && product.currentStock > 0)
            .sort((a, b) => (a.currentStock / a.minStock) - (b.currentStock / b.minStock))
            .slice(0, 5)  // Limit to 5 items
            .map(product => ({
              name: product.name,
              code: product.code,
              currentStock: product.currentStock,
              minStock: product.minStock
            }));
        }
      } catch (stockError) {
        console.error('Error loading stock data:', stockError);
      }
      
      setDashboardData({
        totalRequests,
        pendingRequests,
        completedRequests,
        urgentRequests,
        totalRevenue,
        averageRevenue,
        totalPatients: uniquePatients,
        totalDoctors: uniqueDoctors,
        monthlyGrowth,
        topAnalyses,
        recentRequests,
        revenueByMonth,
        statusDistribution,
        expiringProducts,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'processing': return t.processing;
      case 'pending': return t.pending;
      case 'cancelled': return t.cancelled;
      default: return t.pending;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['today', 'week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t[period as keyof typeof t]}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/new-request')}
              className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <FileText size={16} className="mr-2" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Nouvelle Demande' : 'New Request'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Demande' : 'Request'}</span>
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <Users size={16} className="mr-2" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Nouveau Patient' : 'New Patient'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Patient' : 'Patient'}</span>
            </button>
            <button
              onClick={() => navigate('/results')}
              className="flex items-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              <BarChart3 size={16} className="mr-2" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Saisir Résultats' : 'Enter Results'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Résultats' : 'Results'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t.totalRequests}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalRequests}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs sm:text-sm">
            {dashboardData.monthlyGrowth > 0 ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mr-1" />
            )}
            <span className={dashboardData.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(dashboardData.monthlyGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t.totalRevenue}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalRevenue.toFixed(2)} dh
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t.averageRevenue}: {(dashboardData.averageRevenue).toFixed(2)} dh
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t.totalPatients}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalPatients}</p>
            </div>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t.totalDoctors}: {dashboardData.totalDoctors}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mr-2 sm:mr-3" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t.urgentRequests}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.urgentRequests}</p>
            </div>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t.pendingRequests}: {dashboardData.pendingRequests}
          </div>
        </div>
      </div>
  {/* Stock Report Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Expiring Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t.expiringProducts}
              </h3>
            </div>
            <button
              onClick={() => navigate('/stock/reports')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t.viewStockReport}
            </button>
          </div>
          <div className="space-y-2">
            {dashboardData.expiringProducts && dashboardData.expiringProducts.length > 0 ? (
              dashboardData.expiringProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{product.expiringStock} {t.expiryDate}</p>
                    {product.expiryDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(product.expiryDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.currentStock}: {product.currentStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noData}</p>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t.lowStockProducts}
              </h3>
            </div>
            <button
              onClick={() => navigate('/stock/reports')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t.viewStockReport}
            </button>
          </div>
          <div className="space-y-2">
            {dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
              dashboardData.lowStockProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">{product.currentStock} / {product.minStock}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.minStock}: {product.minStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noData}</p>
            )}
          </div>
        </div>
      </div>
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.efficiencyMetrics}</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.turnaroundTime}:</span>
              <span className="font-medium">24 {t.hours}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.accuracy}:</span>
              <span className="font-medium text-green-600">99.8{t.percentage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.satisfaction}:</span>
              <span className="font-medium">4.8 {t.outOf}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.qualityMetrics}</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.completedRequests}:</span>
              <span className="font-medium text-green-600">{dashboardData.completedRequests}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.processing}:</span>
              <span className="font-medium text-blue-600">{dashboardData.pendingRequests}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.urgentRequests}:</span>
              <span className="font-medium text-orange-600">{dashboardData.urgentRequests}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.performance}</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.newPatients}:</span>
              <span className="font-medium">{Math.floor(dashboardData.totalPatients * 0.3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.returningPatients}:</span>
              <span className="font-medium">{Math.floor(dashboardData.totalPatients * 0.7)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.doctorReferrals}:</span>
              <span className="font-medium">{dashboardData.totalDoctors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Top Analyses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.topAnalyses}</h3>
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {dashboardData.topAnalyses.length > 0 ? (
              dashboardData.topAnalyses.map((analysis, index) => (
                <div key={analysis.name} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{analysis.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{analysis.count} {t.analyses}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 ml-2 flex-shrink-0">{analysis.revenue.toFixed(2)} dh</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noData}</p>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.statusDistribution}</h3>
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {dashboardData.statusDistribution.length > 0 ? (
              dashboardData.statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full mr-2 sm:mr-3 bg-blue-500 flex-shrink-0"></div>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{getStatusText(item.status)}</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noData}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t.recentRequests}</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t.viewAll}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.patient}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  {t.doctor}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.analyses}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  {t.date}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.amount}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentRequests.length > 0 ? (
                dashboardData.recentRequests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="truncate max-w-[120px] sm:max-w-none">
                        {request.patient ? `${request.patient.firstName} ${request.patient.lastName}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                      <div className="truncate max-w-[120px]">
                        {request.doctor ? `Dr. ${request.doctor.firstName} ${request.doctor.lastName}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {request.requestAnalyses?.length || 0} {t.analyses}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-green-600">
                      {request.amountDue?.toFixed(2) || '0.00'} dh
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    
    </div>
  );
}
 