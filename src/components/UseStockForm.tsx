import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  X, 
  Search,
  User,
  Building,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
}

interface StockOutForm {
  productId: string;
  quantity: number;
  usedBy: string;
  department: string;
  purpose: string;
  notes: string;
}

export default function UseStockForm({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const { user, language } = useAuth();
  const [formData, setFormData] = useState<StockOutForm>({
    productId: '',
    quantity: 0,
    usedBy: user?.name || '',
    department: '',
    purpose: '',
    notes: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const t = {
    title: language === 'fr' ? 'Utiliser Stock' : 'Use Stock',
    subtitle: language === 'fr' ? 'Enregistrer l\'utilisation de stock' : 'Record stock usage',
    product: language === 'fr' ? 'Produit' : 'Product',
    selectProduct: language === 'fr' ? 'Sélectionner un produit' : 'Select a product',
    searchProduct: language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...',
    quantity: language === 'fr' ? 'Quantité utilisée' : 'Quantity Used',
    usedBy: language === 'fr' ? 'Utilisé par' : 'Used By',
    department: language === 'fr' ? 'Département' : 'Department',
    purpose: language === 'fr' ? 'Objectif' : 'Purpose',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    currentStock: language === 'fr' ? 'Stock actuel' : 'Current Stock',
    availableStock: language === 'fr' ? 'Stock disponible' : 'Available Stock',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidQuantity: language === 'fr' ? 'La quantité doit être supérieure à 0' : 'Quantity must be greater than 0',
    insufficientStock: language === 'fr' ? 'Stock insuffisant' : 'Insufficient stock',
    success: language === 'fr' ? 'Utilisation enregistrée avec succès' : 'Usage recorded successfully',
    error: language === 'fr' ? 'Erreur lors de l\'enregistrement' : 'Error recording usage',
    loading: language === 'fr' ? 'Enregistrement...' : 'Saving...',
    noProducts: language === 'fr' ? 'Aucun produit trouvé' : 'No products found',
    departments: {
      lab: language === 'fr' ? 'Laboratoire' : 'Laboratory',
      research: language === 'fr' ? 'Recherche' : 'Research',
      quality: language === 'fr' ? 'Contrôle Qualité' : 'Quality Control',
      maintenance: language === 'fr' ? 'Maintenance' : 'Maintenance',
      other: language === 'fr' ? 'Autre' : 'Other'
    },
    purposes: {
      testing: language === 'fr' ? 'Tests' : 'Testing',
      calibration: language === 'fr' ? 'Étalonnage' : 'Calibration',
      maintenance: language === 'fr' ? 'Maintenance' : 'Maintenance',
      research: language === 'fr' ? 'Recherche' : 'Research',
      other: language === 'fr' ? 'Autre' : 'Other'
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await stockService.getProducts({ limit: 100 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = t.required;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t.invalidQuantity;
    }

    if (!formData.usedBy) {
      newErrors.usedBy = t.required;
    }

    if (selectedProduct && formData.quantity > selectedProduct.currentStock) {
      newErrors.quantity = t.insufficientStock;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await stockService.useStock(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error using stock:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StockOutForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.product} *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.selectProduct}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onClick={() => setShowProductModal(true)}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.productId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
            )}
            {selectedProduct && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {t.currentStock}: {selectedProduct.currentStock} {selectedProduct.unit}
                  </span>
                  {selectedProduct.currentStock <= 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.quantity} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          {/* Used By and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.usedBy} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.usedBy}
                  onChange={(e) => handleInputChange('usedBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.usedBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.usedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.usedBy}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.department}
              </label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t.departments.other}</option>
                  <option value="lab">{t.departments.lab}</option>
                  <option value="research">{t.departments.research}</option>
                  <option value="quality">{t.departments.quality}</option>
                  <option value="maintenance">{t.departments.maintenance}</option>
                </select>
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.purpose}
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.purposes.other}</option>
              <option value="testing">{t.purposes.testing}</option>
              <option value="calibration">{t.purposes.calibration}</option>
              <option value="maintenance">{t.purposes.maintenance}</option>
              <option value="research">{t.purposes.research}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about the usage..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t.loading}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.selectProduct}</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder={t.searchProduct}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noProducts}</p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, productId: product.id }));
                        setProductSearch(product.name);
                        setSelectedProduct(product);
                        setShowProductModal(false);
                      }}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.code} • {product.category} • {product.unit}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {t.currentStock}: {product.currentStock} {product.unit}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 