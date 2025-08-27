import React, { useState } from 'react';
import { Download, FileText, Table, Settings, CheckCircle } from 'lucide-react';

interface ExportOptions {
  format: 'PDF' | 'EXCEL';
  includeDetails: boolean;
  includePayments: boolean;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  invoiceIds: string[];
}

const InvoiceExport: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'PDF',
    includeDetails: true,
    includePayments: true,
    dateRange: {
      startDate: '',
      endDate: ''
    },
    invoiceIds: []
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the backend API
      console.log('Exporting invoices with options:', exportOptions);
      
      // Simulate file download
      const filename = `invoices_${new Date().toISOString().split('T')[0]}.${exportOptions.format.toLowerCase()}`;
      alert(`Export terminé: ${filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Download className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export des Factures
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Format d'Export
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="PDF"
                  checked={exportOptions.format === 'PDF'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'PDF' | 'EXCEL' }))}
                  className="mr-2"
                />
                <FileText className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">PDF (Recommandé)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="EXCEL"
                  checked={exportOptions.format === 'EXCEL'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'PDF' | 'EXCEL' }))}
                  className="mr-2"
                />
                <Table className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-900 dark:text-white">Excel (Analyse)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Période
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={exportOptions.dateRange.startDate}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, startDate: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Date de début"
              />
              <input
                type="date"
                value={exportOptions.dateRange.endDate}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, endDate: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Date de fin"
              />
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Options d'Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-900 dark:text-white">Inclure les détails des lignes</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includePayments}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includePayments: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-900 dark:text-white">Inclure l'historique des paiements</span>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md flex items-center"
          >
            {isExporting ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exporter {exportOptions.format}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Modèles d'Export Rapides
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Rapport Mensuel</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toutes les factures du mois en cours avec détails
            </p>
          </button>
          
          <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <Table className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Analyse Excel</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export Excel pour analyse financière
            </p>
          </button>
          
          <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Factures Payées</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uniquement les factures réglées
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceExport;