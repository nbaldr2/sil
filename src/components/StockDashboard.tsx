import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Save
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';
import AddStockEntry from './AddStockEntry';

interface StockDashboardData {
  totalProducts: number;
  totalValue: number;
  expiringSoon: number;
  lowStock: number;
  recentEntries: any[];
  recentOuts: any[];
}

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
  earliestExpiry: string | null;
  stockStatus?: string; // From API
  status: 'OK' | 'LOW' | 'EXPIRED' | 'EXPIRING'; // For frontend display
  supplier?: { name: string };
}

// Utility functions for status handling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'OK':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'LOW':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'EXPIRING':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case 'OK':
      return t.ok;
    case 'LOW':
      return t.low;
    case 'EXPIRED':
      return t.expired;
    case 'EXPIRING':
      return t.expiring;
    default:
      return status;
  }
};

export default function StockDashboard() {
  const { language } = useAuth();
  const [dashboardData, setDashboardData] = useState<StockDashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const t = {
    title: language === 'fr' ? 'Gestion des Stocks' : 'Stock Management',
    subtitle: language === 'fr' ? 'Vue d\'ensemble de l\'inventaire' : 'Inventory Overview',
    totalProducts: language === 'fr' ? 'Total Produits' : 'Total Products',
    totalValue: language === 'fr' ? 'Valeur Totale' : 'Total Value',
    expiringSoon: language === 'fr' ? 'Expire Bientôt' : 'Expiring Soon',
    lowStock: language === 'fr' ? 'Stock Faible' : 'Low Stock',
    addStock: language === 'fr' ? 'Ajouter Stock' : 'Add Stock',
    export: language === 'fr' ? 'Exporter' : 'Export',
    search: language === 'fr' ? 'Rechercher...' : 'Search...',
    category: language === 'fr' ? 'Catégorie' : 'Category',
    status: language === 'fr' ? 'Statut' : 'Status',
    allCategories: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    allStatus: language === 'fr' ? 'Tous les statuts' : 'All Status',
    product: language === 'fr' ? 'Produit' : 'Product',
    code: language === 'fr' ? 'Code' : 'Code',
    stock: language === 'fr' ? 'Stock' : 'Stock',
    unit: language === 'fr' ? 'Unité' : 'Unit',
    expiry: language === 'fr' ? 'Expiration' : 'Expiry',
    location: language === 'fr' ? 'Emplacement' : 'Location',
    supplier: language === 'fr' ? 'Fournisseur' : 'Supplier',
    actions: language === 'fr' ? 'Actions' : 'Actions',
    view: language === 'fr' ? 'Voir' : 'View',
    edit: language === 'fr' ? 'Modifier' : 'Edit',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
    noData: language === 'fr' ? 'Aucune donnée' : 'No data available',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    ok: 'OK',
    low: language === 'fr' ? 'FAIBLE' : 'LOW',
    expired: language === 'fr' ? 'EXPIRÉ' : 'EXPIRED',
    expiring: language === 'fr' ? 'EXPIRE' : 'EXPIRING'
  };

  // Map server stockStatus to frontend status
  const mapStockStatus = (stockStatus: string): 'OK' | 'LOW' | 'EXPIRED' | 'EXPIRING' => {
    switch (stockStatus) {
      case 'AVAILABLE':
        return 'OK';
      case 'LOW_STOCK':
        return 'LOW';
      case 'OUT_OF_STOCK':
        return 'LOW';
      case 'EXPIRED':
        return 'EXPIRED';
      default:
        return 'OK';
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await stockService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await stockService.getProducts({
        search: debouncedSearchTerm,
        category: categoryFilter,
        status: statusFilter
      });
      // The API returns products array directly, not wrapped in an object
      const productsArray = Array.isArray(response) ? response : [];
      // Map the stockStatus to frontend status and calculate earliest expiry
      const mappedProducts = productsArray.map(product => {
        // Calculate earliest expiry date from stock entries
        const earliestExpiry = product.stockEntries && product.stockEntries.length > 0
          ? product.stockEntries
              .filter((entry: any) => entry.expiryDate)
              .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0]?.expiryDate
          : null;

        return {
          ...product,
          status: mapStockStatus(product.stockStatus || 'AVAILABLE'),
          earliestExpiry
        };
      });
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadProducts();
  }, []);

  // Debounce search term to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reload products when filters change
  useEffect(() => {
    // Skip the initial load since it's handled by the first useEffect
    if (debouncedSearchTerm !== '' || categoryFilter !== '' || statusFilter !== '') {
      loadProducts();
    }
  }, [debouncedSearchTerm, categoryFilter, statusFilter]);



  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleExport = async () => {
    try {
      // Get the current filters to apply to the export
      const params = {
        search: debouncedSearchTerm,
        category: categoryFilter,
        status: statusFilter
      };
      
      // Call the export API
      const response = await stockService.exportStockReport(params);
      
      // Convert the response to a CSV or display it
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

  const handleViewProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowViewModal(true);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setShowEditModal(true);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce produit ?' : 'Are you sure you want to delete this product?')) {
      try {
        await stockService.deleteProduct(productId);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalProducts}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalValue}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.totalValue.toFixed(2)} dh
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.expiringSoon}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.expiringSoon}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.lowStock}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.lowStock}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {/* TODO: Add dynamic categories */}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.allStatus}</option>
              <option value="OK">{t.ok}</option>
              <option value="LOW">{t.low}</option>
              <option value="EXPIRED">{t.expired}</option>
              <option value="EXPIRING">{t.expiring}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addStock}
            </button>
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

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {showAddModal && (
          <AddStockEntry
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              loadDashboardData();
              loadProducts();
              setShowAddModal(false);
            }}
          />
        )}
        
        {/* View Modal */}
        {showViewModal && selectedProduct && (
          <ProductViewModal
            product={selectedProduct}
            onClose={() => {
              setShowViewModal(false);
              setSelectedProduct(null);
            }}
            t={t}
          />
        )}
        
        {/* Edit Modal */}
        {showEditModal && editingProduct && (
          <ProductEditModal
            product={editingProduct}
            onClose={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              loadProducts();
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            t={t}
          />
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.product}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.code}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.stock}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.unit}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.expiry}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.location}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.supplier}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.currentStock}
                        </span>
                        {product.currentStock <= (product as any).minStock && (
                          <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(product.earliestExpiry)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {/* TODO: Show location from stock entries */}
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.supplier?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

// Product View Modal Component
function ProductViewModal({ product, onClose, t }: {
  product: Product;
  onClose: () => void;
  t: any;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.viewProduct || 'View Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.code}
            </label>
            <p className="text-gray-900 dark:text-white">{product.code}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.product}
            </label>
            <p className="text-gray-900 dark:text-white">{product.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.category}
            </label>
            <p className="text-gray-900 dark:text-white">{product.category}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.stock}
            </label>
            <p className="text-gray-900 dark:text-white">{product.currentStock} {product.unit}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.expiry}
            </label>
            <p className="text-gray-900 dark:text-white">
              {product.earliestExpiry ? new Date(product.earliestExpiry).toLocaleDateString() : '-'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.status}
            </label>
            <p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                {getStatusText(product.status, t)}
              </span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.supplier || 'Supplier'}
            </label>
            <p className="text-gray-900 dark:text-white">{product.supplier?.name || '-'}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {t.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Edit Modal Component
function ProductEditModal({ product, onClose, onSuccess, t }: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    code: product.code,
    category: product.category,
    unit: product.unit,
    minStock: (product as any).minStock || 0,
    maxStock: (product as any).maxStock || 0
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t.required || 'This field is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = t.required || 'This field is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = t.required || 'This field is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = t.required || 'This field is required';
    }
    
    if (formData.minStock < 0) {
      newErrors.minStock = t.invalidMinStock || 'Minimum stock cannot be negative';
    }
    
    if (formData.maxStock < formData.minStock) {
      newErrors.maxStock = t.invalidMaxStock || 'Maximum stock must be greater than minimum stock';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await stockService.updateProduct(product.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.editProduct || 'Edit Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.code} *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.product} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.category} *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.unit} *
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.minStock || 'Min Stock'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.minStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.minStock && (
                <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.maxStock || 'Max Stock'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maxStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.maxStock && (
                <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t.loading || 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {t.save || 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}