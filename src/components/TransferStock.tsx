import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  X, 
  Search,
  ArrowRight,
  MapPin,
  User,
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

interface TransferForm {
  productId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  transferredBy: string;
  notes: string;
}

export default function TransferStock({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const { user, language } = useAuth();
  const [formData, setFormData] = useState<TransferForm>({
    productId: '',
    fromLocation: '',
    toLocation: '',
    quantity: 0,
    transferredBy: user?.name || '',
    notes: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const t = {
    title: language === 'fr' ? 'Transférer Stock' : 'Transfer Stock',
    subtitle: language === 'fr' ? 'Déplacer du stock entre emplacements' : 'Move stock between locations',
    product: language === 'fr' ? 'Produit' : 'Product',
    selectProduct: language === 'fr' ? 'Sélectionner un produit' : 'Select a product',
    searchProduct: language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...',
    fromLocation: language === 'fr' ? 'Emplacement source' : 'Source Location',
    toLocation: language === 'fr' ? 'Emplacement destination' : 'Destination Location',
    quantity: language === 'fr' ? 'Quantité à transférer' : 'Quantity to Transfer',
    transferredBy: language === 'fr' ? 'Transféré par' : 'Transferred By',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    currentStock: language === 'fr' ? 'Stock actuel' : 'Current Stock',
    save: language === 'fr' ? 'Transférer' : 'Transfer',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidQuantity: language === 'fr' ? 'La quantité doit être supérieure à 0' : 'Quantity must be greater than 0',
    insufficientStock: language === 'fr' ? 'Stock insuffisant à l\'emplacement source' : 'Insufficient stock at source location',
    sameLocation: language === 'fr' ? 'Les emplacements source et destination doivent être différents' : 'Source and destination locations must be different',
    success: language === 'fr' ? 'Transfert effectué avec succès' : 'Transfer completed successfully',
    error: language === 'fr' ? 'Erreur lors du transfert' : 'Error during transfer',
    loading: language === 'fr' ? 'Transfert en cours...' : 'Transferring...',
    noProducts: language === 'fr' ? 'Aucun produit trouvé' : 'No products found',
    commonLocations: {
      fridge: language === 'fr' ? 'Réfrigérateur' : 'Fridge',
      freezer: language === 'fr' ? 'Congélateur' : 'Freezer',
      cabinet1: language === 'fr' ? 'Armoire 1' : 'Cabinet 1',
      cabinet2: language === 'fr' ? 'Armoire 2' : 'Cabinet 2',
      cabinet3: language === 'fr' ? 'Armoire 3' : 'Cabinet 3',
      shelf1: language === 'fr' ? 'Étagère 1' : 'Shelf 1',
      shelf2: language === 'fr' ? 'Étagère 2' : 'Shelf 2',
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

    if (!formData.fromLocation) {
      newErrors.fromLocation = t.required;
    }

    if (!formData.toLocation) {
      newErrors.toLocation = t.required;
    }

    if (formData.fromLocation === formData.toLocation) {
      newErrors.toLocation = t.sameLocation;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t.invalidQuantity;
    }

    if (!formData.transferredBy) {
      newErrors.transferredBy = t.required;
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
      await stockService.transferStock(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error transferring stock:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TransferForm, value: string | number) => {
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

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.fromLocation} *
              </label>
              <div className="relative">
                <select
                  value={formData.fromLocation}
                  onChange={(e) => handleInputChange('fromLocation', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fromLocation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">{t.commonLocations.other}</option>
                  <option value="fridge">{t.commonLocations.fridge}</option>
                  <option value="freezer">{t.commonLocations.freezer}</option>
                  <option value="cabinet1">{t.commonLocations.cabinet1}</option>
                  <option value="cabinet2">{t.commonLocations.cabinet2}</option>
                  <option value="cabinet3">{t.commonLocations.cabinet3}</option>
                  <option value="shelf1">{t.commonLocations.shelf1}</option>
                  <option value="shelf2">{t.commonLocations.shelf2}</option>
                </select>
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              {errors.fromLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.fromLocation}</p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.toLocation} *
              </label>
              <div className="relative">
                <select
                  value={formData.toLocation}
                  onChange={(e) => handleInputChange('toLocation', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.toLocation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">{t.commonLocations.other}</option>
                  <option value="fridge">{t.commonLocations.fridge}</option>
                  <option value="freezer">{t.commonLocations.freezer}</option>
                  <option value="cabinet1">{t.commonLocations.cabinet1}</option>
                  <option value="cabinet2">{t.commonLocations.cabinet2}</option>
                  <option value="cabinet3">{t.commonLocations.cabinet3}</option>
                  <option value="shelf1">{t.commonLocations.shelf1}</option>
                  <option value="shelf2">{t.commonLocations.shelf2}</option>
                </select>
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              {errors.toLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.toLocation}</p>
              )}
            </div>
          </div>

          {/* Quantity and Transferred By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.transferredBy} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.transferredBy}
                  onChange={(e) => handleInputChange('transferredBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.transferredBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.transferredBy && (
                <p className="mt-1 text-sm text-red-600">{errors.transferredBy}</p>
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
              placeholder="Additional notes about the transfer..."
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