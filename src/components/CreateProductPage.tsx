import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Save, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Hash,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Building
} from 'lucide-react';
import { useAuth } from '../App';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  barcode: string;
  unitPrice: number;
  costPrice: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  supplier: string;
  expirationDate: string;
  batchNumber: string;
  location: string;
  notes: string;
}

export default function CreateProductPage() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    sku: '',
    barcode: '',
    unitPrice: 0,
    costPrice: 0,
    unit: '',
    minStock: 0,
    maxStock: 0,
    reorderLevel: 0,
    supplier: '',
    expirationDate: '',
    batchNumber: '',
    location: '',
    notes: ''
  });

  const t = {
    fr: {
      title: 'Créer un nouveau produit',
      subtitle: 'Ajouter un nouveau produit au système de gestion des stocks',
      backToStock: 'Retour aux stocks',
      productInfo: 'Informations du produit',
      pricingInfo: 'Informations de prix',
      stockInfo: 'Informations de stock',
      additionalInfo: 'Informations supplémentaires',
      productName: 'Nom du produit',
      productNamePlaceholder: 'Entrez le nom du produit',
      description: 'Description',
      descriptionPlaceholder: 'Description détaillée du produit',
      category: 'Catégorie',
      categoryPlaceholder: 'Sélectionnez une catégorie',
      sku: 'Code SKU',
      skuPlaceholder: 'Code unique du produit',
      barcode: 'Code-barres',
      barcodePlaceholder: 'Code-barres du produit',
      unitPrice: 'Prix unitaire',
      costPrice: 'Prix de revient',
      unit: 'Unité',
      unitPlaceholder: 'Ex: pièce, boîte, ml',
      minStock: 'Stock minimum',
      maxStock: 'Stock maximum',
      reorderLevel: 'Niveau de réapprovisionnement',
      supplier: 'Fournisseur',
      supplierPlaceholder: 'Nom du fournisseur',
      expirationDate: 'Date d\'expiration',
      batchNumber: 'Numéro de lot',
      batchNumberPlaceholder: 'Numéro de lot du produit',
      location: 'Emplacement',
      locationPlaceholder: 'Emplacement de stockage',
      notes: 'Notes',
      notesPlaceholder: 'Notes supplémentaires',
      save: 'Enregistrer le produit',
      cancel: 'Annuler',
      required: 'Champ obligatoire',
      success: 'Produit créé avec succès!',
      error: 'Erreur lors de la création du produit',
      categories: {
        reagents: 'Réactifs',
        consumables: 'Consommables',
        equipment: 'Équipements',
        maintenance: 'Maintenance',
        calibration: 'Étalonnage',
        quality_control: 'Contrôle qualité',
        other: 'Autre'
      }
    },
    en: {
      title: 'Create New Product',
      subtitle: 'Add a new product to the stock management system',
      backToStock: 'Back to Stock',
      productInfo: 'Product Information',
      pricingInfo: 'Pricing Information',
      stockInfo: 'Stock Information',
      additionalInfo: 'Additional Information',
      productName: 'Product Name',
      productNamePlaceholder: 'Enter product name',
      description: 'Description',
      descriptionPlaceholder: 'Detailed product description',
      category: 'Category',
      categoryPlaceholder: 'Select a category',
      sku: 'SKU Code',
      skuPlaceholder: 'Unique product code',
      barcode: 'Barcode',
      barcodePlaceholder: 'Product barcode',
      unitPrice: 'Unit Price',
      costPrice: 'Cost Price',
      unit: 'Unit',
      unitPlaceholder: 'Ex: piece, box, ml',
      minStock: 'Minimum Stock',
      maxStock: 'Maximum Stock',
      reorderLevel: 'Reorder Level',
      supplier: 'Supplier',
      supplierPlaceholder: 'Supplier name',
      expirationDate: 'Expiration Date',
      batchNumber: 'Batch Number',
      batchNumberPlaceholder: 'Product batch number',
      location: 'Location',
      locationPlaceholder: 'Storage location',
      notes: 'Notes',
      notesPlaceholder: 'Additional notes',
      save: 'Save Product',
      cancel: 'Cancel',
      required: 'Required field',
      success: 'Product created successfully!',
      error: 'Error creating product',
      categories: {
        reagents: 'Reagents',
        consumables: 'Consumables',
        equipment: 'Equipment',
        maintenance: 'Maintenance',
        calibration: 'Calibration',
        quality_control: 'Quality Control',
        other: 'Other'
      }
    }
  }[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Stock') || name === 'reorderLevel' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const categoryPrefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    return `${categoryPrefix}-${randomStr}-${timestamp}`;
  };

  const handleGenerateSKU = () => {
    setFormData(prev => ({
      ...prev,
      sku: generateSKU()
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom du produit est obligatoire');
      return false;
    }
    if (!formData.category) {
      setError('La catégorie est obligatoire');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('Le code SKU est obligatoire');
      return false;
    }
    if (!formData.unit.trim()) {
      setError('L\'unité est obligatoire');
      return false;
    }
    if (formData.unitPrice < 0 || formData.costPrice < 0) {
      setError('Les prix ne peuvent pas être négatifs');
      return false;
    }
    if (formData.minStock < 0 || formData.maxStock < 0 || formData.reorderLevel < 0) {
      setError('Les quantités de stock ne peuvent pas être négatives');
      return false;
    }
    if (formData.maxStock > 0 && formData.minStock > formData.maxStock) {
      setError('Le stock minimum ne peut pas être supérieur au stock maximum');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would call an API
      const productData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: `product_${Date.now()}`,
        currentStock: 0,
        status: 'active'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo purposes
      const existingProducts = JSON.parse(localStorage.getItem('sil_products') || '[]');
      existingProducts.push(productData);
      localStorage.setItem('sil_products', JSON.stringify(existingProducts));
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/stock/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/stock/dashboard');
  };

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
              Le produit "{formData.name}" a été créé avec succès.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
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
            onClick={handleCancel}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Tag size={20} className="mr-2 text-blue-600" />
              {t.productInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.productNamePlaceholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.category} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t.categoryPlaceholder}</option>
                  <option value="reagents">{t.categories.reagents}</option>
                  <option value="consumables">{t.categories.consumables}</option>
                  <option value="equipment">{t.categories.equipment}</option>
                  <option value="maintenance">{t.categories.maintenance}</option>
                  <option value="calibration">{t.categories.calibration}</option>
                  <option value="quality_control">{t.categories.quality_control}</option>
                  <option value="other">{t.categories.other}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.description}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.sku} *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder={t.skuPlaceholder}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                  >
                    Générer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.barcode}
                </label>
                <div className="relative">
                  <Hash size={20} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder={t.barcodePlaceholder}
                    className="w-full pl-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.unit} *
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder={t.unitPlaceholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-600" />
              {t.pricingInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.unitPrice}
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.costPrice}
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Package size={20} className="mr-2 text-purple-600" />
              {t.stockInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.minStock}
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.maxStock}
                </label>
                <input
                  type="number"
                  name="maxStock"
                  value={formData.maxStock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.reorderLevel}
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FileText size={20} className="mr-2 text-orange-600" />
              {t.additionalInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.supplier}
                </label>
                <div className="relative">
                  <Building size={20} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder={t.supplierPlaceholder}
                    className="w-full pl-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.expirationDate}
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.batchNumber}
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  placeholder={t.batchNumberPlaceholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.location}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={t.locationPlaceholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.notes}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {t.cancel}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
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
  );
}