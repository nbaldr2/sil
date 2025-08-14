import  React, { useState } from 'react';
import { Save, Settings, Printer, Database, DollarSign } from 'lucide-react';
import { useAuth } from '../App';

interface AnalysisPrice {
  code: string;
  nom: string;
  category: string;
  price: number;
  tva: number;
}

export default function ConfigCenter() {
  const { language } = useAuth();
  const [config, setConfig] = useState({
    labName: 'Laboratoire Central',
    address: '123 Rue de la Santé, 75014 Paris',
    phone: '01.42.34.56.78',
    email: 'contact@lab.fr',
    autoprint: true,
    defaultPrinter: 'HP LaserJet Pro',
    smsNotifications: true,
    emailNotifications: true
  });

  const [analysisPrices, setAnalysisPrices] = useState<AnalysisPrice[]>([
    { code: '4005', nom: 'Hémogramme (CBC)', category: 'Hématologie', price: 45.00, tva: 20 },
    { code: '4010', nom: 'Glycémie (Blood Sugar)', category: 'Biochimie', price: 25.00, tva: 20 },
    { code: '4015', nom: 'Cholestérol Total', category: 'Lipides', price: 30.00, tva: 20 },
    { code: '4020', nom: 'HDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20 },
    { code: '4025', nom: 'LDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20 },
    { code: '4030', nom: 'Triglycérides', category: 'Lipides', price: 30.00, tva: 20 },
    { code: '4035', nom: 'Créatininémie', category: 'Biochimie', price: 28.00, tva: 20 },
    { code: '4040', nom: 'Urée', category: 'Biochimie', price: 25.00, tva: 20 },
    { code: '4045', nom: 'Bilan hépatique', category: 'Biochimie', price: 55.00, tva: 20 },
    { code: '4050', nom: 'TSH', category: 'Hormonologie', price: 40.00, tva: 20 },
    { code: '4055', nom: 'T4 Libre', category: 'Hormonologie', price: 45.00, tva: 20 },
    { code: '4060', nom: 'T3 Libre', category: 'Hormonologie', price: 45.00, tva: 20 },
    { code: '4070', nom: 'Groupe Sanguin', category: 'Immunologie', price: 35.00, tva: 20 },
    { code: '4075', nom: 'CRP', category: 'Inflammation', price: 32.00, tva: 20 },
    { code: '4080', nom: 'VS', category: 'Inflammation', price: 20.00, tva: 20 }
  ]);

  const t = {
    fr: {
      title: 'Centre de Configuration',
      labSettings: 'Paramètres du Laboratoire',
      labName: 'Nom du Laboratoire',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      printSettings: 'Paramètres d\'Impression',
      autoprint: 'Impression automatique',
      defaultPrinter: 'Imprimante par défaut',
      notifications: 'Notifications',
      smsNotifications: 'Notifications SMS',
      emailNotifications: 'Notifications Email',
      pricing: 'Tarification des Analyses',
      analysisCode: 'Code',
      analysisName: 'Nom de l\'Analyse',
      category: 'Catégorie',
      price: 'Prix HT',
      tva: 'TVA (%)',
      totalPrice: 'Prix TTC',
      save: 'Enregistrer',
      savePrices: 'Enregistrer les Prix'
    },
    en: {
      title: 'Configuration Center',
      labSettings: 'Laboratory Settings',
      labName: 'Laboratory Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      printSettings: 'Print Settings',
      autoprint: 'Auto-print',
      defaultPrinter: 'Default Printer',
      notifications: 'Notifications',
      smsNotifications: 'SMS Notifications',
      emailNotifications: 'Email Notifications',
      pricing: 'Analysis Pricing',
      analysisCode: 'Code',
      analysisName: 'Analysis Name',
      category: 'Category',
      price: 'Price (excl. tax)',
      tva: 'VAT (%)',
      totalPrice: 'Total Price',
      save: 'Save',
      savePrices: 'Save Prices'
    }
  }[language];

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (code: string, field: 'price' | 'tva', value: number) => {
    setAnalysisPrices(prev => prev.map(analysis => 
      analysis.code === code ? { ...analysis, [field]: value } : analysis
    ));
  };

  const handleSave = () => {
    console.log('Saving configuration:', config);
    // Save to localStorage
    localStorage.setItem('sil_lab_config', JSON.stringify(config));
    localStorage.setItem('sil_lab_prices', JSON.stringify(analysisPrices));
    alert('Configuration sauvegardée avec succès!');
  };

  const calculateTotalPrice = (price: number, tva: number) => {
    return price * (1 + tva / 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laboratory Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.labSettings}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.labName}
              </label>
              <input
                type="text"
                value={config.labName}
                onChange={(e) => handleChange('labName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.address}
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.phone}
              </label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Print Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Printer className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.printSettings}</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoprint}
                onChange={(e) => handleChange('autoprint', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.autoprint}</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.defaultPrinter}
              </label>
              <input
                type="text"
                value={config.defaultPrinter}
                onChange={(e) => handleChange('defaultPrinter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.notifications}</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.smsNotifications}</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.emailNotifications}</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Save size={20} className="mr-2" />
            {t.save}
          </button>
        </div>
      </div>

      {/* Pricing Management */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.pricing}</h3>
          </div>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Save size={16} className="mr-2" />
            {t.savePrices}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.analysisCode}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.analysisName}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.category}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.price}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.tva}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.totalPrice}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analysisPrices.map((analysis) => (
                <tr key={analysis.code}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {analysis.code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {analysis.nom}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {analysis.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={analysis.price}
                      onChange={(e) => handlePriceChange(analysis.code, 'price', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={analysis.tva}
                      onChange={(e) => handlePriceChange(analysis.code, 'tva', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    {calculateTotalPrice(analysis.price, analysis.tva).toFixed(2)} dh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
 