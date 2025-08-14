import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter,
  ArrowLeft,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';
import StockActivityReport from './StockActivityReport';

interface ReportItem {
  code: string;
  name: string;
  category: string;
  currentStock: number;
  expiringStock: number;
  unit: string;
  minStock: number;
}

export default function StockReport() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'activities'>('summary');
  
  const t = {
    title: language === 'fr' ? 'Rapport de Stock' : 'Stock Report',
    subtitle: language === 'fr' ? 'Visualiser et exporter les données de stock' : 'View and export stock data',
    search: language === 'fr' ? 'Rechercher...' : 'Search...',
    allCategories: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    export: language === 'fr' ? 'Exporter' : 'Export',
    back: language === 'fr' ? 'Retour' : 'Back',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    product: language === 'fr' ? 'Produit' : 'Product',
    code: language === 'fr' ? 'Code' : 'Code',
    category: language === 'fr' ? 'Catégorie' : 'Category',
    currentStock: language === 'fr' ? 'Stock Actuel' : 'Current Stock',
    expiringStock: language === 'fr' ? 'Stock Expirant' : 'Expiring Stock',
    unit: language === 'fr' ? 'Unité' : 'Unit',
    minStock: language === 'fr' ? 'Stock Minimum' : 'Min Stock',
    noData: language === 'fr' ? 'Aucune donnée disponible' : 'No data available',
    summary: language === 'fr' ? 'Résumé' : 'Summary',
    activities: language === 'fr' ? 'Activités' : 'Activities',
    stockSummary: language === 'fr' ? 'Résumé du Stock' : 'Stock Summary',
    stockActivities: language === 'fr' ? 'Activités de Stock' : 'Stock Activities'
  };

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await stockService.exportStockReport();
      setReport(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Get the current filters to apply to the export
      const params = {
        search: searchTerm,
        category: categoryFilter
      };
      
      // Call the export API
      const response = await stockService.exportStockReport(params);
      
      // Convert the response to a CSV
      if (response && Array.isArray(response)) {
        // Create CSV content
        const headers = Object.keys(response[0]).join(',');
        const rows = response.map(item => Object.values(item).join(','));
        const csvContent = [headers, ...rows].join('\n');
        
        // Create a blob and download it
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Invalid response format for export');
      }
    } catch (error) {
      console.error('Error exporting stock report:', error);
    }
  };

  const filteredReport = report.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for the filter
  const categories = [...new Set(report.map(item => item.category))].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/stock/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.back}
        </button>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 size={16} className="mr-2" />
              {t.stockSummary}
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Activity size={16} className="mr-2" />
              {t.stockActivities}
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'summary' ? (
        <>
          {/* Filters and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t.allCategories}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={handleExport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  {t.export}
                </button>
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">{t.loading}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.code}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.product}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.category}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.currentStock}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.expiringStock}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.unit}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.minStock}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReport.length > 0 ? (
                      filteredReport.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.currentStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.expiringStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.minStock}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t.noData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <StockActivityReport />
      )}
    </div>
  );
}