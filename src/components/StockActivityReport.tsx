import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Settings,
  Search
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';

interface StockActivity {
  id: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'ADJUSTMENT';
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  quantity: number;
  location: string;
  lotNumber: string;
  expiryDate: string | null;
  unitCost: number;
  supplier: string | null;
  performedBy: string | null;
  date: string;
  notes: string | null;
  description: string;
  department?: string;
  purpose?: string;
  fromLocation?: string;
  toLocation?: string;
  oldQuantity?: number;
  newQuantity?: number;
  reason?: string;
}

interface ActivitySummary {
  total: number;
  stockIn: number;
  stockOut: number;
  transfers: number;
  adjustments: number;
}

export default function StockActivityReport() {
  const { language } = useAuth();
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    type: '',
    startDate: '',
    endDate: '',
    limit: 100
  });

  const t = {
    title: language === 'fr' ? 'Rapport d\'Activité Stock' : 'Stock Activity Report',
    subtitle: language === 'fr' ? 'Historique complet des activités de stock' : 'Complete stock activity history',
    filter: language === 'fr' ? 'Filtrer' : 'Filter',
    export: language === 'fr' ? 'Exporter' : 'Export',
    search: language === 'fr' ? 'Rechercher...' : 'Search...',
    product: language === 'fr' ? 'Produit' : 'Product',
    type: language === 'fr' ? 'Type' : 'Type',
    date: language === 'fr' ? 'Date' : 'Date',
    startDate: language === 'fr' ? 'Date de début' : 'Start Date',
    endDate: language === 'fr' ? 'Date de fin' : 'End Date',
    limit: language === 'fr' ? 'Limite' : 'Limit',
    allTypes: language === 'fr' ? 'Tous les types' : 'All Types',
    stockIn: language === 'fr' ? 'Ajout Stock' : 'Stock In',
    stockOut: language === 'fr' ? 'Utilisation Stock' : 'Stock Out',
    transfer: language === 'fr' ? 'Transfert' : 'Transfer',
    adjustment: language === 'fr' ? 'Ajustement' : 'Adjustment',
    quantity: language === 'fr' ? 'Quantité' : 'Quantity',
    location: language === 'fr' ? 'Emplacement' : 'Location',
    performedBy: language === 'fr' ? 'Effectué par' : 'Performed By',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    department: language === 'fr' ? 'Département' : 'Department',
    purpose: language === 'fr' ? 'Objectif' : 'Purpose',
    supplier: language === 'fr' ? 'Fournisseur' : 'Supplier',
    lotNumber: language === 'fr' ? 'Numéro de lot' : 'Lot Number',
    expiryDate: language === 'fr' ? 'Date d\'expiration' : 'Expiry Date',
    unitCost: language === 'fr' ? 'Coût unitaire' : 'Unit Cost',
    reason: language === 'fr' ? 'Raison' : 'Reason',
    fromLocation: language === 'fr' ? 'De' : 'From',
    toLocation: language === 'fr' ? 'Vers' : 'To',
    oldQuantity: language === 'fr' ? 'Ancienne quantité' : 'Old Quantity',
    newQuantity: language === 'fr' ? 'Nouvelle quantité' : 'New Quantity',
    noData: language === 'fr' ? 'Aucune donnée' : 'No data available',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    summary: language === 'fr' ? 'Résumé' : 'Summary',
    total: language === 'fr' ? 'Total' : 'Total',
    clearFilters: language === 'fr' ? 'Effacer les filtres' : 'Clear Filters',
    applyFilters: language === 'fr' ? 'Appliquer' : 'Apply'
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await stockService.getStockActivities(filters);
      setActivities(response.activities || []);
      setSummary(response.summary || null);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      productId: '',
      type: '',
      startDate: '',
      endDate: '',
      limit: 100
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'STOCK_OUT':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'TRANSFER':
        return <ArrowRight size={16} className="text-blue-600" />;
      case 'ADJUSTMENT':
        return <Settings size={16} className="text-orange-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'STOCK_OUT':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'TRANSFER':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'ADJUSTMENT':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatQuantity = (quantity: number) => {
    const sign = quantity > 0 ? '+' : '';
    return `${sign}${quantity}`;
  };

  const exportReport = async () => {
    try {
      const response = await stockService.getStockActivities(filters);
      const activities = response.activities || [];
      
      // Create CSV content
      const headers = [
        'Date', 'Type', 'Product', 'Code', 'Category', 'Quantity', 'Location', 
        'Performed By', 'Notes', 'Department', 'Purpose', 'Supplier', 'Lot Number', 
        'Expiry Date', 'Unit Cost', 'Reason', 'From Location', 'To Location'
      ];
      
      const rows = activities.map(activity => [
        formatDate(activity.date),
        activity.type,
        activity.productName,
        activity.productCode,
        activity.category,
        formatQuantity(activity.quantity),
        activity.location,
        activity.performedBy || '',
        activity.notes || '',
        activity.department || '',
        activity.purpose || '',
        activity.supplier || '',
        activity.lotNumber || '',
        activity.expiryDate ? new Date(activity.expiryDate).toLocaleDateString() : '',
        activity.unitCost || '',
        activity.reason || '',
        activity.fromLocation || '',
        activity.toLocation || ''
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `stock-activities-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'exportation' : 'Error exporting report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.total}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.stockIn}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.stockIn}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.stockOut}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.stockOut}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <ArrowRight className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.transfer}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.transfers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.adjustment}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.adjustments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t.filter}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.clearFilters}
            </button>
            <button
              onClick={exportReport}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Download size={14} className="mr-1" />
              {t.export}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.type}
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.allTypes}</option>
              <option value="STOCK_IN">{t.stockIn}</option>
              <option value="STOCK_OUT">{t.stockOut}</option>
              <option value="TRANSFER">{t.transfer}</option>
              <option value="ADJUSTMENT">{t.adjustment}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.startDate}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.endDate}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.limit}
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t.loading}</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t.noData}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {activity.productName}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({activity.productCode})
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {activity.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {activity.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t.quantity}:</span>
                          <span className={`ml-1 ${activity.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatQuantity(activity.quantity)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t.location}:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.location}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t.performedBy}:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.performedBy || '-'}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t.date}:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{formatDate(activity.date)}</span>
                        </div>
                      </div>
                      
                      {/* Additional details based on activity type */}
                      {activity.type === 'STOCK_IN' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          {activity.supplier && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.supplier}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.supplier}</span>
                            </div>
                          )}
                          {activity.lotNumber && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.lotNumber}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.lotNumber}</span>
                            </div>
                          )}
                          {activity.expiryDate && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.expiryDate}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">
                                {new Date(activity.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {activity.unitCost > 0 && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.unitCost}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">${activity.unitCost}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.type === 'STOCK_OUT' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          {activity.department && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.department}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.department}</span>
                            </div>
                          )}
                          {activity.purpose && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.purpose}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.purpose}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.type === 'TRANSFER' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{t.fromLocation}:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.fromLocation}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{t.toLocation}:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.toLocation}</span>
                          </div>
                        </div>
                      )}
                      
                      {activity.type === 'ADJUSTMENT' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{t.oldQuantity}:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.oldQuantity}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{t.newQuantity}:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.newQuantity}</span>
                          </div>
                          {activity.reason && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t.reason}:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.reason}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.notes && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t.notes}:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{activity.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 