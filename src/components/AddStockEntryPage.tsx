import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  DollarSign,
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
  hasExpiryDate?: boolean;
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
  supplierId?: string;
}

interface NewProductForm {
  name: string;
  code: string;
  category: string;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  description: string;
  hasExpiryDate: boolean;
}

export default function AddStockEntryPage() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
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
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [newProductForm, setNewProductForm] = useState<NewProductForm>({
    name: '',
    code: '',
    category: '',
    unit: '',
    minQuantity: 0,
    maxQuantity: 1000,
    description: '',
    hasExpiryDate: true
  });
  const [newProductErrors, setNewProductErrors] = useState<Record<string, string>>({});
  const [creatingProduct, setCreatingProduct] = useState(false);
  
  // Predefined categories and units
  const categories = [
    'Test Strips',
    'Reagents',
    'Equipment',
    'Consumables',
    'Chemicals',
    'Disposables',
    'Instruments',
    'Supplies',
    'Other'
  ];
  
  const units = [
    'Strips',
    'Pieces',
    'Units',
    'Bottles',
    'Boxes',
    'Tubes',
    'Kits',
    'Packs',
    'Milliliters',
    'Grams',
    'Other'
  ];

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
    back: language === 'fr' ? 'Retour' : 'Back',
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
    maxQuantity: language === 'fr' ? 'Quantité maximale' : 'Maximum Quantity',
    description: language === 'fr' ? 'Description' : 'Description',
    supplierName: language === 'fr' ? 'Nom du fournisseur' : 'Supplier Name',
    supplierCode: language === 'fr' ? 'Code du fournisseur' : 'Supplier Code',
    email: language === 'fr' ? 'Email' : 'Email',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    address: language === 'fr' ? 'Adresse' : 'Address',
    contactPerson: language === 'fr' ? 'Personne de contact' : 'Contact Person',
    hasExpiryDate: language === 'fr' ? 'A une date d\'expiration' : 'Has expiry date',
    expiryDateRequired: language === 'fr' ? 'Date d\'expiration requise' : 'Expiry date required',
    createNewProduct: language === 'fr' ? 'Créer un nouveau produit' : 'Create New Product',
    productCreated: language === 'fr' ? 'Produit créé avec succès' : 'Product created successfully',
    productCreationError: language === 'fr' ? 'Erreur lors de la création du produit' : 'Error creating product',
    creatingProduct: language === 'fr' ? 'Création du produit...' : 'Creating product...',
    productNameRequired: language === 'fr' ? 'Le nom du produit est requis' : 'Product name is required',
    productCodeRequired: language === 'fr' ? 'Le code du produit est requis' : 'Product code is required',
    categoryRequired: language === 'fr' ? 'La catégorie est requise' : 'Category is required',
    unitRequired: language === 'fr' ? 'L\'unité est requise' : 'Unit is required',
    codeExists: language === 'fr' ? 'Ce code de produit existe déjà' : 'This product code already exists',
    nameExists: language === 'fr' ? 'Ce nom de produit existe déjà' : 'This product name already exists',
    expiryDateHelp: language === 'fr' ? 'Date d\'expiration requise lors de l\'ajout de stock' : 'Expiry date will be required when adding stock',
    noExpiryDateHelp: language === 'fr' ? 'Aucune date d\'expiration requise pour ce produit' : 'No expiry date required for this product'
  };

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await stockService.getProducts({ limit: 100 });
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await stockService.getSuppliers({ limit: 100 });
      setSuppliers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = t.required;
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = t.invalidQuantity;
    }

    if (!formData.lotNumber.trim()) {
      newErrors.lotNumber = t.required;
    }

    // Check if selected product has expiry date requirement
    const selectedProduct = products.find(p => p.id === formData.productId);
    if (selectedProduct && selectedProduct.hasExpiryDate && !formData.expiryDate) {
      newErrors.expiryDate = t.expiryDateRequired;
    } else if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = t.invalidDate;
    }

    if (!formData.location.trim()) {
      newErrors.location = t.required;
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = t.invalidCost;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewProductForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newProductForm.name.trim()) {
      newErrors.name = t.productNameRequired;
    }

    if (!newProductForm.code.trim()) {
      newErrors.code = t.productCodeRequired;
    }

    if (!newProductForm.category.trim()) {
      newErrors.category = t.categoryRequired;
    }

    if (!newProductForm.unit.trim()) {
      newErrors.unit = t.unitRequired;
    }

    // Check if code already exists
    if (products.some(p => p.code.toLowerCase() === newProductForm.code.toLowerCase())) {
      newErrors.code = t.codeExists;
    }

    // Check if name already exists
    if (products.some(p => p.name.toLowerCase() === newProductForm.name.toLowerCase())) {
      newErrors.name = t.nameExists;
    }

    setNewProductErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await stockService.addStock(formData);
      alert(t.success);
      navigate('/stock/dashboard');
    } catch (error) {
      console.error('Error adding stock:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!validateNewProductForm()) {
      return;
    }

    setCreatingProduct(true);
    try {
      const newProduct = await stockService.createProduct(newProductForm);
      await loadProducts(); // Reload products list
      setFormData(prev => ({ ...prev, productId: newProduct.id }));
      setShowNewProductModal(false);
      setNewProductForm({
        name: '',
        code: '',
        category: '',
        unit: '',
        minQuantity: 0,
        maxQuantity: 1000,
        description: '',
        hasExpiryDate: true
      });
      alert(t.productCreated);
    } catch (error) {
      console.error('Error creating product:', error);
      alert(t.productCreationError);
    } finally {
      setCreatingProduct(false);
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
    product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedSupplier = suppliers.find(s => s.id === formData.productId);

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

          {/* Quantity and Lot Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.quantity} *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.lotNumber} *
              </label>
              <input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lotNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="LOT-001"
              />
              {errors.lotNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lotNumber}</p>
              )}
            </div>
          </div>

          {/* Expiry Date and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedProduct?.hasExpiryDate !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.expiryDate} {selectedProduct?.hasExpiryDate && '*'}
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
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.location} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Main Storage"
                />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
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
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.unitCost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0.00"
                />
                <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.unitCost && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unitCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.receivedBy}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.receivedBy}
                  onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
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
                    setShowNewProductModal(true);
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

      {/* New Product Creation Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.createNewProduct}</h3>
                <button
                  onClick={() => setShowNewProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }} className="space-y-4">
                {/* Product Name and Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.productName} *
                    </label>
                    <input
                      type="text"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newProductErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Glucose Test Strips"
                    />
                    {newProductErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newProductErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.productCode} *
                    </label>
                    <input
                      type="text"
                      value={newProductForm.code}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, code: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newProductErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="GLU-001"
                    />
                    {newProductErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newProductErrors.code}</p>
                    )}
                  </div>
                </div>

                {/* Category and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.category} *
                    </label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newProductErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">{language === 'fr' ? 'Sélectionner une catégorie' : 'Select a category'}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {newProductErrors.category && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newProductErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.unit} *
                    </label>
                    <select
                      value={newProductForm.unit}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, unit: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        newProductErrors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">{language === 'fr' ? 'Sélectionner une unité' : 'Select a unit'}</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {newProductErrors.unit && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newProductErrors.unit}</p>
                    )}
                  </div>
                </div>

                {/* Min/Max Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.minQuantity}
                    </label>
                    <input
                      type="number"
                      value={newProductForm.minQuantity}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.maxQuantity}
                    </label>
                    <input
                      type="number"
                      value={newProductForm.maxQuantity}
                      onChange={(e) => setNewProductForm(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 1000 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* Has Expiry Date Checkbox */}
                <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <input
                    type="checkbox"
                    id="hasExpiryDate"
                    checked={newProductForm.hasExpiryDate}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, hasExpiryDate: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label 
                    htmlFor="hasExpiryDate" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                  >
                    {t.hasExpiryDate}
                  </label>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {newProductForm.hasExpiryDate ? 
                      t.expiryDateHelp : 
                      t.noExpiryDateHelp
                    }
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.description}
                  </label>
                  <textarea
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product description..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowNewProductModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {creatingProduct ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.creatingProduct}
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
          </div>
        </div>
      )}
    </div>
  );
} 