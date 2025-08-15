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
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';
import CreateProductModal from './CreateProductModal';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  hasExpiryDate?: boolean;
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

export default function AddStockEntryPage() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<StockEntryForm>({
    productId: '',
    quantity: 0,
    lotNumber: '',
    expiryDate: '',
    location: 'Main Storage',
    unitCost: 0,
    notes: '',
    receivedBy: user?.name || ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const t = {
    fr: {
      title: 'Ajouter Stock',
      subtitle: 'Enregistrer un nouvel arrivage de stock',
      backToStock: 'Retour aux stocks',
      product: 'Produit',
      selectProduct: 'Sélectionner un produit',
      searchProduct: 'Rechercher un produit...',
      quantity: 'Quantité',
      lotNumber: 'Numéro de lot',
      expiryDate: 'Date d\'expiration',
      location: 'Emplacement',
      unitCost: 'Coût unitaire',
      notes: 'Notes',
      receivedBy: 'Reçu par',
      save: 'Enregistrer',
      cancel: 'Annuler',
      createNewProduct: 'Créer un nouveau produit',
      required: 'Ce champ est requis',
      success: 'Stock ajouté avec succès!',
      error: 'Erreur lors de l\'ajout du stock',
      loading: 'Enregistrement...',
      noProducts: 'Aucun produit trouvé',
      additionalNotes: 'Notes supplémentaires...',
      redirecting: 'Redirection vers le tableau de bord...'
    },
    en: {
      title: 'Add Stock Entry',
      subtitle: 'Record new stock arrival',
      backToStock: 'Back to Stock',
      product: 'Product',
      selectProduct: 'Select a product',
      searchProduct: 'Search for a product...',
      quantity: 'Quantity',
      lotNumber: 'Lot Number',
      expiryDate: 'Expiry Date',
      location: 'Location',
      unitCost: 'Unit Cost',
      notes: 'Notes',
      receivedBy: 'Received By',
      save: 'Save',
      cancel: 'Cancel',
      createNewProduct: 'Create New Product',
      required: 'This field is required',
      success: 'Stock added successfully!',
      error: 'Error adding stock',
      loading: 'Saving...',
      noProducts: 'No products found',
      additionalNotes: 'Additional notes...',
      redirecting: 'Redirecting to dashboard...'
    }
  }[language];

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load products from database
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await stockService.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitCost' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productId: product.id
    }));
    setShowProductModal(false);
    setProductSearch('');
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Validate form
  const validateForm = () => {
    if (!formData.productId) {
      setError('Veuillez sélectionner un produit');
      return false;
    }
    if (formData.quantity <= 0) {
      setError('La quantité doit être supérieure à 0');
      return false;
    }
    if (!formData.lotNumber.trim()) {
      setError('Le numéro de lot est requis');
      return false;
    }
    if (!formData.location.trim()) {
      setError('L\'emplacement est requis');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for API
      const stockData = {
        productId: formData.productId,
        quantity: formData.quantity,
        lotNumber: formData.lotNumber,
        expiryDate: formData.expiryDate || null,
        location: formData.location,
        unitCost: formData.unitCost,
        notes: formData.notes,
        receivedBy: formData.receivedBy,
        receivedAt: new Date().toISOString(),
        type: 'stock_in'
      };

      // Call API to add stock
      await stockService.addStock(stockData);
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/stock/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error adding stock:', error);
      setError('Erreur lors de l\'ajout du stock. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle product creation success
  const handleProductCreated = (newProduct: any) => {
    setProducts(prev => [...prev, newProduct]);
    setSelectedProduct(newProduct);
    setFormData(prev => ({
      ...prev,
      productId: newProduct.id
    }));
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t.success}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedProduct?.name} - {formData.quantity} {selectedProduct?.unit}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.redirecting}
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/stock/dashboard')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t.backToStock}
          </button>
          
          <div className="flex items-center space-x-3">
            <Package size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Main Form - Matching your HTML structure */}
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
                  readOnly
                  placeholder={t.selectProduct}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600 cursor-pointer"
                  value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.code})` : ''}
                  onClick={() => setShowProductModal(true)}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Quantity and Lot Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.quantity} *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.lotNumber} *
                </label>
                <input
                  type="text"
                  name="lotNumber"
                  value={formData.lotNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                  placeholder="LOT-001"
                  required
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
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.location} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                    placeholder="Main Storage"
                    required
                  />
                  <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
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
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                    placeholder="0.00"
                    min="0"
                  />
                  <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.receivedBy}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="receivedBy"
                    value={formData.receivedBy}
                    onChange={handleInputChange}
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
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.additionalNotes}
              />
            </div>

            {/* Action Buttons */}
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
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
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
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.selectProduct}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex space-x-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t.searchProduct}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setShowCreateProductModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  {t.createNewProduct}
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t.noProducts}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.code} • {product.category} • {product.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        onSuccess={handleProductCreated}
      />
    </div>
  );
}