import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  ArrowLeft,
  Search,
  User,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
}

interface AdjustmentForm {
  productId: string;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  notes: string;
}

export default function AdjustInventoryPage() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdjustmentForm>({
    productId: '',
    newQuantity: 0,
    reason: '',
    adjustedBy: user?.name || '',
    notes: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const t = {
    title: language === 'fr' ? 'Ajuster Inventaire' : 'Adjust Inventory',
    subtitle: language === 'fr' ? 'Corriger manuellement les niveaux de stock' : 'Manually correct stock levels',
    product: language === 'fr' ? 'Produit' : 'Product',
    selectProduct: language === 'fr' ? 'Sélectionner un produit' : 'Select a product',
    searchProduct: language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...',
    currentQuantity: language === 'fr' ? 'Quantité actuelle' : 'Current Quantity',
    newQuantity: language === 'fr' ? 'Nouvelle quantité' : 'New Quantity',
    difference: language === 'fr' ? 'Différence' : 'Difference',
    reason: language === 'fr' ? 'Raison de l\'ajustement' : 'Adjustment Reason',
    adjustedBy: language === 'fr' ? 'Ajusté par' : 'Adjusted By',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    save: language === 'fr' ? 'Ajuster' : 'Adjust',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    back: language === 'fr' ? 'Retour' : 'Back',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidQuantity: language === 'fr' ? 'La quantité doit être positive' : 'Quantity must be positive',
    invalidReason: language === 'fr' ? 'La raison doit contenir au moins 5 caractères' : 'Reason must be at least 5 characters',
    success: language === 'fr' ? 'Ajustement effectué avec succès' : 'Adjustment completed successfully',
    error: language === 'fr' ? 'Erreur lors de l\'ajustement' : 'Error during adjustment',
    loading: language === 'fr' ? 'Ajustement en cours...' : 'Adjusting...',
    noProducts: language === 'fr' ? 'Aucun produit trouvé' : 'No products found',
    reasons: {
      damage: language === 'fr' ? 'Produit endommagé' : 'Damaged product',
      loss: language === 'fr' ? 'Perte de stock' : 'Stock loss',
      found: language === 'fr' ? 'Stock retrouvé' : 'Stock found',
      correction: language === 'fr' ? 'Correction d\'erreur' : 'Error correction',
      audit: language === 'fr' ? 'Audit d\'inventaire' : 'Inventory audit',
      other: language === 'fr' ? 'Autre' : 'Other'
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await stockService.getProducts({ limit: 100 });
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = t.required;
    }

    if (formData.newQuantity < 0) {
      newErrors.newQuantity = t.invalidQuantity;
    }

    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      newErrors.reason = t.invalidReason;
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
      await stockService.adjustInventory(formData);
      alert(t.success);
      navigate('/stock/dashboard');
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdjustmentForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getDifference = () => {
    if (!selectedProduct) return 0;
    return formData.newQuantity - selectedProduct.currentStock;
  };

  const getDifferenceColor = () => {
    const diff = getDifference();
    if (diff > 0) return 'text-green-600 dark:text-green-400';
    if (diff < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getDifferenceIcon = () => {
    const diff = getDifference();
    if (diff > 0) return <TrendingUp size={16} className="text-green-600 dark:text-green-400" />;
    if (diff < 0) return <TrendingDown size={16} className="text-red-600 dark:text-red-400" />;
    return null;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/stock/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.back}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.product} *
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedProduct?.name || ''}
                onClick={() => setShowProductModal(true)}
                readOnly
                placeholder={t.selectProduct}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.productId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.productId}</p>
            )}
          </div>

          {/* Current Stock Display */}
          {selectedProduct && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.currentQuantity}:
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* New Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.newQuantity} *
            </label>
            <input
              type="number"
              value={formData.newQuantity}
              onChange={(e) => handleInputChange('newQuantity', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newQuantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="0"
            />
            {errors.newQuantity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newQuantity}</p>
            )}
          </div>

          {/* Difference Display */}
          {selectedProduct && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.difference}:
                </span>
                <div className="flex items-center space-x-2">
                  {getDifferenceIcon()}
                  <span className={`text-lg font-semibold ${getDifferenceColor()}`}>
                    {getDifference() > 0 ? '+' : ''}{getDifference()} {selectedProduct.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.reason} *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">{t.selectProduct}</option>
              <option value={t.reasons.damage}>{t.reasons.damage}</option>
              <option value={t.reasons.loss}>{t.reasons.loss}</option>
              <option value={t.reasons.found}>{t.reasons.found}</option>
              <option value={t.reasons.correction}>{t.reasons.correction}</option>
              <option value={t.reasons.audit}>{t.reasons.audit}</option>
              <option value={t.reasons.other}>{t.reasons.other}</option>
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>

          {/* Adjusted By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.adjustedBy}
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.adjustedBy}
                onChange={(e) => handleInputChange('adjustedBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
              <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
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
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/stock/dashboard')}
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
                        setSelectedProduct(product);
                        setProductSearch(product.name);
                        setShowProductModal(false);
                      }}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.code} • {product.category} • {product.unit}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {t.currentQuantity}: {product.currentStock}
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