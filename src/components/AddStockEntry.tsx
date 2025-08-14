import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  X, 
  Search,
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface StockEntryForm {
  productId: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
  location: string;
  unitCost: number;
  notes: string;
  receivedBy: string;
}

export default function AddStockEntry({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const { user, language } = useAuth();
  const [formData, setFormData] = useState<StockEntryForm>({
    productId: '',
    quantity: 0,
    lotNumber: '',
    expiryDate: '',
    location: '',
    unitCost: 0,
    notes: '',
    receivedBy: user?.name || ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  const t = {
    title: language === 'fr' ? 'Ajouter Stock' : 'Add Stock Entry',
    subtitle: language === 'fr' ? 'Enregistrer un nouvel arrivage' : 'Record new stock arrival',
    product: language === 'fr' ? 'Produit' : 'Product',
    selectProduct: language === 'fr' ? 'Sélectionner un produit' : 'Select a product',
    searchProduct: language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...',
    quantity: language === 'fr' ? 'Quantité' : 'Quantity',
    lotNumber: language === 'fr' ? 'Numéro de lot' : 'Lot Number',
    expiryDate: language === 'fr' ? 'Date d\'expiration' : 'Expiry Date',
    location: language === 'fr' ? 'Emplacement' : 'Location',
    unitCost: language === 'fr' ? 'Coût unitaire' : 'Unit Cost',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    receivedBy: language === 'fr' ? 'Reçu par' : 'Received By',
    supplier: language === 'fr' ? 'Fournisseur' : 'Supplier',
    selectSupplier: language === 'fr' ? 'Sélectionner un fournisseur' : 'Select a supplier',
    searchSupplier: language === 'fr' ? 'Rechercher un fournisseur...' : 'Search for a supplier...',
    addNewProduct: language === 'fr' ? 'Ajouter un nouveau produit' : 'Add New Product',
    addNewSupplier: language === 'fr' ? 'Ajouter un nouveau fournisseur' : 'Add New Supplier',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidQuantity: language === 'fr' ? 'La quantité doit être supérieure à 0' : 'Quantity must be greater than 0',
    invalidCost: language === 'fr' ? 'Le coût doit être positif' : 'Cost must be positive',
    invalidDate: language === 'fr' ? 'La date d\'expiration doit être dans le futur' : 'Expiry date must be in the future',
    success: language === 'fr' ? 'Stock ajouté avec succès' : 'Stock added successfully',
    error: language === 'fr' ? 'Erreur lors de l\'ajout du stock' : 'Error adding stock',
    loading: language === 'fr' ? 'Enregistrement...' : 'Saving...',
    noProducts: language === 'fr' ? 'Aucun produit trouvé' : 'No products found',
    noSuppliers: language === 'fr' ? 'Aucun fournisseur trouvé' : 'No suppliers found',
    createProduct: language === 'fr' ? 'Créer un produit' : 'Create Product',
    createSupplier: language === 'fr' ? 'Créer un fournisseur' : 'Create Supplier',
    productName: language === 'fr' ? 'Nom du produit' : 'Product Name',
    productCode: language === 'fr' ? 'Code du produit' : 'Product Code',
    category: language === 'fr' ? 'Catégorie' : 'Category',
    unit: language === 'fr' ? 'Unité' : 'Unit',
    minQuantity: language === 'fr' ? 'Quantité minimale' : 'Minimum Quantity',
    supplierName: language === 'fr' ? 'Nom du fournisseur' : 'Supplier Name',
    supplierEmail: language === 'fr' ? 'Email du fournisseur' : 'Supplier Email',
    supplierPhone: language === 'fr' ? 'Téléphone du fournisseur' : 'Supplier Phone',
    supplierAddress: language === 'fr' ? 'Adresse du fournisseur' : 'Supplier Address',
    contactPerson: language === 'fr' ? 'Personne de contact' : 'Contact Person'
  };

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await stockService.getProducts({ limit: 100 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await stockService.getSuppliers({ limit: 100 });
      setSuppliers(response.suppliers || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
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

    if (!formData.location) {
      newErrors.location = t.required;
    }

    if (!formData.receivedBy) {
      newErrors.receivedBy = t.required;
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = t.invalidCost;
    }

    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = t.invalidDate;
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
      await stockService.addStockEntry(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding stock entry:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StockEntryForm, value: string | number) => {
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

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
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
          </div>

          {/* Quantity and Lot Number */}
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
                {t.lotNumber}
              </label>
              <input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Expiry Date and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.expiryDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.location} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Fridge A, Cabinet 3"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Unit Cost and Received By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.unitCost}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.unitCost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.unitCost && (
                <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.receivedBy} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.receivedBy}
                  onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.receivedBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.receivedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.receivedBy}</p>
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
              placeholder="Additional notes..."
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
                        setShowProductModal(false);
                      }}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.code} • {product.category} • {product.unit}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    // TODO: Navigate to create product form
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  {t.addNewProduct}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 