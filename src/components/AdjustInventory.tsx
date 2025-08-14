import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  X, 
  Search,
  User,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown
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

interface AdjustmentForm {
  productId: string;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  notes: string;
}

export default function AdjustInventory({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const { user, language } = useAuth();
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

    if (formData.newQuantity < 0) {
      newErrors.newQuantity = t.invalidQuantity;
    }

    if (!formData.reason || formData.reason.length < 5) {
      newErrors.reason = t.invalidReason;
    }

    if (!formData.adjustedBy) {
      newErrors.adjustedBy = t.required;
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
      onSuccess?.();
      onClose();
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const getDifference = () => {
    if (!selectedProduct || formData.newQuantity === undefined) return 0;
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
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

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
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {t.currentQuantity}: {selectedProduct.currentStock} {selectedProduct.unit}
                </div>
              </div>
            )}
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.currentQuantity}
              </label>
              <input
                type="number"
                value={selectedProduct?.currentStock || 0}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.newQuantity} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.newQuantity}
                onChange={(e) => handleInputChange('newQuantity', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newQuantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.newQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.newQuantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.difference}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={getDifference()}
                  disabled
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600 ${getDifferenceColor()}`}
                />
                {getDifferenceIcon()}
              </div>
            </div>
          </div>

          {/* Reason and Adjusted By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="">{t.reasons.other}</option>
                <option value="damage">{t.reasons.damage}</option>
                <option value="loss">{t.reasons.loss}</option>
                <option value="found">{t.reasons.found}</option>
                <option value="correction">{t.reasons.correction}</option>
                <option value="audit">{t.reasons.audit}</option>
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.adjustedBy} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.adjustedBy}
                  onChange={(e) => handleInputChange('adjustedBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adjustedBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.adjustedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.adjustedBy}</p>
              )}
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
              placeholder="Additional notes about the adjustment..."
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
                        setFormData(prev => ({ ...prev, productId: product.id, newQuantity: product.currentStock }));
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
                        {t.currentQuantity}: {product.currentStock} {product.unit}
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