import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Plus, Trash2, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../App';
import { pricingService } from '../services/integrations';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

interface AnalysisPrice {
  id?: string;
  code: string;
  nom: string;
  category: string;
  price: number;
  tva: number;
  cost?: number;
  profit?: number;
  lastUpdated?: string;
}

interface CurrencySettings {
  symbol: string;
  code: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

export default function PriceManagement() {
  const { language } = useAuth();
  const [analysisPrices, setAnalysisPrices] = useState<AnalysisPrice[]>([]);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>({
    symbol: 'dh',
    code: 'MAD',
    position: 'after',
    decimalPlaces: 2
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<AnalysisPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'success' | 'danger' | 'warning' | 'info'>('success');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string>('');

  const t = {
    fr: {
      title: 'Gestion des Prix',
      subtitle: 'Configuration des tarifs des analyses',
      currency: 'Devise',
      currencySymbol: 'Symbole de devise',
      currencyCode: 'Code devise',
      currencyPosition: 'Position du symbole',
      decimalPlaces: 'Décimales',
      before: 'Avant',
      after: 'Après',
      search: 'Rechercher...',
      filter: 'Filtrer par catégorie',
      allCategories: 'Toutes les catégories',
      addPrice: 'Ajouter un prix',
      editPrice: 'Modifier le prix',
      code: 'Code',
      name: 'Nom',
      category: 'Catégorie',
      price: 'Prix HT',
      tva: 'TVA (%)',
      cost: 'Coût',
      profit: 'Marge',
      totalPrice: 'Prix TTC',
      lastUpdated: 'Dernière mise à jour',
      actions: 'Actions',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      saveAll: 'Enregistrer tout',
      priceHistory: 'Historique des prix',
      profitAnalysis: 'Analyse des marges',
      totalRevenue: 'Revenu total',
      averagePrice: 'Prix moyen',
      totalAnalyses: 'Total analyses',
      priceChanges: 'Changements de prix',
      success: 'Prix enregistré avec succès',
      error: 'Erreur lors de l\'enregistrement',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce prix ?'
    },
    en: {
      title: 'Price Management',
      subtitle: 'Analysis pricing configuration',
      currency: 'Currency',
      currencySymbol: 'Currency symbol',
      currencyCode: 'Currency code',
      currencyPosition: 'Symbol position',
      decimalPlaces: 'Decimal places',
      before: 'Before',
      after: 'After',
      search: 'Search...',
      filter: 'Filter by category',
      allCategories: 'All categories',
      addPrice: 'Add price',
      editPrice: 'Edit price',
      code: 'Code',
      name: 'Name',
      category: 'Category',
      price: 'Price (excl. tax)',
      tva: 'VAT (%)',
      cost: 'Cost',
      profit: 'Profit',
      totalPrice: 'Total price',
      lastUpdated: 'Last updated',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      saveAll: 'Save all',
      priceHistory: 'Price history',
      profitAnalysis: 'Profit analysis',
      totalRevenue: 'Total revenue',
      averagePrice: 'Average price',
      totalAnalyses: 'Total analyses',
      priceChanges: 'Price changes',
      success: 'Price saved successfully',
      error: 'Error saving price',
      confirmDelete: 'Are you sure you want to delete this price?'
    }
  }[language];

  // Load prices and currency settings on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const prices = await pricingService.getPrices();
      setAnalysisPrices(prices.length > 0 ? prices : getDefaultPrices());
      
      const savedCurrency = await pricingService.getCurrencySettings();
      if (savedCurrency) {
        setCurrencySettings(savedCurrency);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setAnalysisPrices(getDefaultPrices());
      setIsLoading(false);
    }
  };

  const getDefaultPrices = (): AnalysisPrice[] => [
    { code: '4005', nom: 'Hémogramme (CBC)', category: 'Hématologie', price: 45.00, tva: 20, cost: 15.00, profit: 30.00 },
    { code: '4010', nom: 'Glycémie (Blood Sugar)', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00, profit: 17.00 },
    { code: '4015', nom: 'Cholestérol Total', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00, profit: 20.00 },
    { code: '4020', nom: 'HDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00, profit: 23.00 },
    { code: '4025', nom: 'LDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00, profit: 23.00 },
    { code: '4030', nom: 'Triglycérides', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00, profit: 20.00 },
    { code: '4035', nom: 'Créatininémie', category: 'Biochimie', price: 28.00, tva: 20, cost: 9.00, profit: 19.00 },
    { code: '4040', nom: 'Urée', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00, profit: 17.00 },
    { code: '4045', nom: 'Bilan hépatique', category: 'Biochimie', price: 55.00, tva: 20, cost: 18.00, profit: 37.00 },
    { code: '4050', nom: 'TSH', category: 'Hormonologie', price: 40.00, tva: 20, cost: 13.00, profit: 27.00 },
    { code: '4055', nom: 'T4 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00, profit: 30.00 },
    { code: '4060', nom: 'T3 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00, profit: 30.00 },
    { code: '4070', nom: 'Groupe Sanguin', category: 'Immunologie', price: 35.00, tva: 20, cost: 11.00, profit: 24.00 },
    { code: '4075', nom: 'CRP', category: 'Inflammation', price: 32.00, tva: 20, cost: 10.00, profit: 22.00 },
    { code: '4080', nom: 'VS', category: 'Inflammation', price: 20.00, tva: 20, cost: 6.00, profit: 14.00 }
  ];

  const categories = ['Hématologie', 'Biochimie', 'Lipides', 'Hormonologie', 'Immunologie', 'Inflammation'];

  const showNotification = (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setShowDialog(true);
  };

  const filteredPrices = analysisPrices.filter(price => {
    const matchesSearch = (price.nom && price.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (price.code && price.code.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || price.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const calculateTotalPrice = (price: number, tva: number) => {
    return price * (1 + tva / 100);
  };

  const calculateProfit = (price: number, cost: number = 0) => {
    return price - cost;
  };

  const formatPrice = (price: number) => {
    const formatted = price.toFixed(currencySettings.decimalPlaces);
    return currencySettings.position === 'before' 
      ? `${currencySettings.symbol}${formatted}`
      : `${formatted}${currencySettings.symbol}`;
  };

  const handlePriceChange = (code: string, field: keyof AnalysisPrice, value: any) => {
    setAnalysisPrices(prev => prev.map(analysis => {
      if (analysis.code === code) {
        const updated = { ...analysis, [field]: value };
        if (field === 'price' || field === 'cost') {
          updated.profit = calculateProfit(updated.price, updated.cost);
        }
        return updated;
      }
      return analysis;
    }));
  };

  const handleSave = async () => {
    setDialogLoading(true);
    try {
      const success = await pricingService.savePrices(analysisPrices);
      pricingService.saveCurrencySettings(currencySettings);
      
      setDialogLoading(false);
      
      if (success) {
        showNotification('success', t.success, 'Les prix ont été sauvegardés avec succès.');
      } else {
        showNotification('danger', t.error, 'Certains prix n\'ont peut-être pas été sauvegardés. Veuillez vérifier la console pour plus de détails.');
      }
    } catch (error) {
      console.error('Save error:', error);
      setDialogLoading(false);
      showNotification('danger', t.error, 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleDelete = (code: string) => {
    setDeleteCode(code);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setAnalysisPrices(prev => prev.filter(price => price.code !== deleteCode));
    setShowDeleteConfirm(false);
    setDeleteCode('');
    showNotification('success', 'Supprimé', 'Le prix a été supprimé avec succès.');
  };

  const handleAddPrice = () => {
    const newPrice: AnalysisPrice = {
      code: '',
      nom: '',
      category: 'Biochimie',
      price: 0,
      tva: 20,
      cost: 0,
      profit: 0,
      lastUpdated: new Date().toISOString()
    };
    setEditingPrice(newPrice);
    setShowAddForm(true);
  };

  const handleSaveNewPrice = () => {
    if (editingPrice && editingPrice.code && editingPrice.nom) {
      const newPrice = {
        ...editingPrice,
        profit: calculateProfit(editingPrice.price, editingPrice.cost),
        lastUpdated: new Date().toISOString()
      };
      setAnalysisPrices(prev => [...prev, newPrice]);
      setEditingPrice(null);
      setShowAddForm(false);
    }
  };

  // Calculate KPIs
  const totalRevenue = analysisPrices.reduce((sum, price) => sum + price.price, 0);
  const averagePrice = totalRevenue / analysisPrices.length;
  const totalProfit = analysisPrices.reduce((sum, price) => sum + (price.profit || 0), 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Currency Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.currency}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.currencySymbol}
            </label>
            <input
              type="text"
              value={currencySettings.symbol}
              onChange={(e) => setCurrencySettings(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.currencyCode}
            </label>
            <input
              type="text"
              value={currencySettings.code}
              onChange={(e) => setCurrencySettings(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.currencyPosition}
            </label>
            <select
              value={currencySettings.position}
              onChange={(e) => setCurrencySettings(prev => ({ ...prev, position: e.target.value as 'before' | 'after' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="before">{t.before}</option>
              <option value="after">{t.after}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.decimalPlaces}
            </label>
            <input
              type="number"
              min="0"
              max="4"
              value={currencySettings.decimalPlaces}
              onChange={(e) => setCurrencySettings(prev => ({ ...prev, decimalPlaces: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalRevenue}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.averagePrice}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(averagePrice)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.profitAnalysis}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalProfit)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Marge (%)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddPrice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addPrice}
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save size={16} className="mr-2" />
              {t.saveAll}
            </button>
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.code}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.category}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.price}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.tva}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.cost}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.profit}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.totalPrice}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPrices.map((price) => (
                <tr key={price.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {price.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {price.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {price.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price.price}
                      onChange={(e) => handlePriceChange(price.code, 'price', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={price.tva}
                      onChange={(e) => handlePriceChange(price.code, 'tva', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price.cost || 0}
                      onChange={(e) => handlePriceChange(price.code, 'cost', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    {formatPrice(price.profit || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatPrice(calculateTotalPrice(price.price, price.tva))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(price.code)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Price Modal */}
      {showAddForm && editingPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.addPrice}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.code}
                </label>
                <input
                  type="text"
                  value={editingPrice.code}
                  onChange={(e) => setEditingPrice(prev => prev ? { ...prev, code: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={editingPrice.nom}
                  onChange={(e) => setEditingPrice(prev => prev ? { ...prev, nom: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.category}
                </label>
                <select
                  value={editingPrice.category}
                  onChange={(e) => setEditingPrice(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.price}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPrice.price}
                    onChange={(e) => setEditingPrice(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.tva}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingPrice.tva}
                    onChange={(e) => setEditingPrice(prev => prev ? { ...prev, tva: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPrice(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveNewPrice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Dialog */}
      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={() => setShowDialog(false)}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        confirmText="OK"
        // Don't show cancel button for notifications
        loading={dialogLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteCode('');
        }}
        onConfirm={confirmDelete}
        title={t.confirmDelete}
        message={`Êtes-vous sûr de vouloir supprimer le prix pour le code ${deleteCode} ?`}
        type="danger"
        confirmText={t.delete}
        cancelText={t.cancel}
      />
    </div>
  );
} 