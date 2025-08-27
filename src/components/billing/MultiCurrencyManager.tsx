import React, { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, Plus, Trash2, TrendingUp } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  position: 'BEFORE' | 'AFTER';
  decimalPlaces: number;
}

interface CurrencySettings {
  defaultCurrency: string;
  autoUpdateRates: boolean;
  rateUpdateFrequency: 'DAILY' | 'WEEKLY' | 'MANUAL';
  lastRateUpdate: string;
}

const MultiCurrencyManager: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [settings, setSettings] = useState<CurrencySettings>({
    defaultCurrency: 'MAD',
    autoUpdateRates: false,
    rateUpdateFrequency: 'MANUAL',
    lastRateUpdate: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
    exchangeRate: 1,
    isDefault: false,
    isActive: true,
    position: 'AFTER',
    decimalPlaces: 2
  });

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = () => {
    // Mock data - in real implementation, this would come from SystemConfig
    const mockCurrencies: Currency[] = [
      {
        code: 'MAD',
        name: 'Dirham Marocain',
        symbol: 'DH',
        exchangeRate: 1,
        isDefault: true,
        isActive: true,
        position: 'AFTER',
        decimalPlaces: 2
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        exchangeRate: 0.092,
        isDefault: false,
        isActive: true,
        position: 'AFTER',
        decimalPlaces: 2
      },
      {
        code: 'USD',
        name: 'Dollar Américain',
        symbol: '$',
        exchangeRate: 0.098,
        isDefault: false,
        isActive: true,
        position: 'BEFORE',
        decimalPlaces: 2
      }
    ];
    setCurrencies(mockCurrencies);
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    const formatted = amount.toFixed(currency.decimalPlaces);
    return currency.position === 'BEFORE' 
      ? `${currency.symbol}${formatted}`
      : `${formatted} ${currency.symbol}`;
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    const fromRate = currencies.find(c => c.code === fromCurrency)?.exchangeRate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.exchangeRate || 1;
    
    // Convert to base currency (MAD) then to target currency
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  };

  const handleSaveCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) return;

    const currency: Currency = {
      code: newCurrency.code!,
      name: newCurrency.name!,
      symbol: newCurrency.symbol!,
      exchangeRate: newCurrency.exchangeRate || 1,
      isDefault: newCurrency.isDefault || false,
      isActive: newCurrency.isActive !== false,
      position: newCurrency.position || 'AFTER',
      decimalPlaces: newCurrency.decimalPlaces || 2
    };

    if (editingCurrency) {
      setCurrencies(prev => prev.map(c => c.code === editingCurrency.code ? currency : c));
      setEditingCurrency(null);
    } else {
      setCurrencies(prev => [...prev, currency]);
    }

    setNewCurrency({
      code: '',
      name: '',
      symbol: '',
      exchangeRate: 1,
      isDefault: false,
      isActive: true,
      position: 'AFTER',
      decimalPlaces: 2
    });
    setShowAddModal(false);
  };

  const handleSetDefault = (code: string) => {
    setCurrencies(prev => prev.map(c => ({
      ...c,
      isDefault: c.code === code
    })));
    setSettings(prev => ({ ...prev, defaultCurrency: code }));
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setNewCurrency(currency);
    setShowAddModal(true);
  };

  const handleDeleteCurrency = (code: string) => {
    if (currencies.find(c => c.code === code)?.isDefault) {
      alert('Cannot delete default currency');
      return;
    }
    setCurrencies(prev => prev.filter(c => c.code !== code));
  };

  const updateExchangeRates = async () => {
    // Mock API call to update exchange rates
    console.log('Updating exchange rates...');
    setSettings(prev => ({ ...prev, lastRateUpdate: new Date().toISOString() }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Multi-Devises</h2>
          <p className="text-gray-600 dark:text-gray-400">Configuration des devises et taux de change</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={updateExchangeRates}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Mettre à jour les taux
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Devise
          </button>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres Généraux</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Devise par Défaut
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mise à jour Automatique
            </label>
            <select
              value={settings.rateUpdateFrequency}
              onChange={(e) => setSettings(prev => ({ ...prev, rateUpdateFrequency: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="MANUAL">Manuel</option>
              <option value="DAILY">Quotidienne</option>
              <option value="WEEKLY">Hebdomadaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dernière Mise à jour
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm text-gray-900 dark:text-white">
              {settings.lastRateUpdate 
                ? new Date(settings.lastRateUpdate).toLocaleDateString()
                : 'Jamais'}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Convertisseur de Devises</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Montant</label>
            <input
              type="number"
              defaultValue="1000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              id="convertAmount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">De</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              id="fromCurrency"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vers</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              id="toCurrency"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </div>
          <div>
            <button 
              onClick={() => {
                const amount = parseFloat((document.getElementById('convertAmount') as HTMLInputElement).value);
                const from = (document.getElementById('fromCurrency') as HTMLSelectElement).value;
                const to = (document.getElementById('toCurrency') as HTMLSelectElement).value;
                const converted = convertAmount(amount, from, to);
                const toCurrency = currencies.find(c => c.code === to)!;
                alert(`${amount} ${from} = ${formatCurrency(converted, toCurrency)}`);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Convertir
            </button>
          </div>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Devises Configurées</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Symbole</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Taux</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currencies.map((currency) => (
                <tr key={currency.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{currency.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    1 MAD = {currency.exchangeRate.toFixed(4)} {currency.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {currency.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                          Défaut
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        currency.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {currency.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {!currency.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(currency.code)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-xs"
                        >
                          Définir par défaut
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditCurrency(currency)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!currency.isDefault && (
                        <button 
                          onClick={() => handleDeleteCurrency(currency.code)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingCurrency ? 'Modifier Devise' : 'Ajouter Devise'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCurrency(null);
                  setNewCurrency({
                    code: '', name: '', symbol: '', exchangeRate: 1,
                    isDefault: false, isActive: true, position: 'AFTER', decimalPlaces: 2
                  });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
                <input
                  type="text"
                  value={newCurrency.code || ''}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="EUR, USD, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={newCurrency.name || ''}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Euro, Dollar américain, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbole</label>
                <input
                  type="text"
                  value={newCurrency.symbol || ''}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="€, $, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taux de Change (1 MAD =)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newCurrency.exchangeRate || 1}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCurrency(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveCurrency}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCurrencyManager;