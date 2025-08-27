import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  BarChart,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface ReportConfig {
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    status?: string[];
    paymentMethod?: string[];
    customerType?: string[];
  };
  format: 'PDF' | 'EXCEL' | 'CSV';
  includeCharts: boolean;
  includeDetails: boolean;
}

interface ReportGeneratorProps {
  onGenerateReport?: (config: ReportConfig) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerateReport }) => {
  const { language } = useAuth();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'FINANCIAL_SUMMARY',
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {},
    format: 'PDF',
    includeCharts: true,
    includeDetails: true
  });
  const [generating, setGenerating] = useState(false);

  const translations = {
    fr: {
      title: 'Générateur de Rapports',
      reportType: 'Type de Rapport',
      dateRange: 'Période',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      filters: 'Filtres',
      format: 'Format',
      options: 'Options',
      includeCharts: 'Inclure les graphiques',
      includeDetails: 'Inclure les détails',
      generateReport: 'Générer le Rapport',
      preview: 'Aperçu',
      download: 'Télécharger',
      print: 'Imprimer',
      generating: 'Génération en cours...',
      
      // Report Types
      financialSummary: 'Résumé Financier',
      invoiceReport: 'Rapport des Factures',
      paymentReport: 'Rapport des Paiements',
      customerReport: 'Rapport des Clients',
      taxReport: 'Rapport Fiscal',
      insuranceReport: 'Rapport d\'Assurance',
      
      // Filters
      invoiceStatus: 'Statut des factures',
      paymentMethod: 'Méthode de paiement',
      customerType: 'Type de client',
      
      // Status options
      allStatuses: 'Tous les statuts',
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      
      // Payment methods
      allMethods: 'Toutes les méthodes',
      cash: 'Espèces',
      card: 'Carte',
      bankTransfer: 'Virement',
      check: 'Chèque',
      insurance: 'Assurance',
      
      // Customer types
      allCustomers: 'Tous les clients',
      individual: 'Particulier',
      corporate: 'Entreprise',
      insuranceCompany: 'Assurance',
      
      // Quick date ranges
      quickRanges: 'Périodes rapides',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      thisWeek: 'Cette semaine',
      lastWeek: 'Semaine dernière',
      thisMonth: 'Ce mois',
      lastMonth: 'Mois dernier',
      thisQuarter: 'Ce trimestre',
      thisYear: 'Cette année'
    },
    en: {
      title: 'Report Generator',
      reportType: 'Report Type',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      filters: 'Filters',
      format: 'Format',
      options: 'Options',
      includeCharts: 'Include Charts',
      includeDetails: 'Include Details',
      generateReport: 'Generate Report',
      preview: 'Preview',
      download: 'Download',
      print: 'Print',
      generating: 'Generating...',
      
      // Report Types
      financialSummary: 'Financial Summary',
      invoiceReport: 'Invoice Report',
      paymentReport: 'Payment Report',
      customerReport: 'Customer Report',
      taxReport: 'Tax Report',
      insuranceReport: 'Insurance Report',
      
      // Filters
      invoiceStatus: 'Invoice Status',
      paymentMethod: 'Payment Method',
      customerType: 'Customer Type',
      
      // Status options
      allStatuses: 'All Statuses',
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      
      // Payment methods
      allMethods: 'All Methods',
      cash: 'Cash',
      card: 'Card',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      insurance: 'Insurance',
      
      // Customer types
      allCustomers: 'All Customers',
      individual: 'Individual',
      corporate: 'Corporate',
      insuranceCompany: 'Insurance',
      
      // Quick date ranges
      quickRanges: 'Quick Ranges',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisQuarter: 'This Quarter',
      thisYear: 'This Year'
    }
 } as const;

  const t = translations[language as keyof typeof translations];

  const reportTypes = [
    { value: 'FINANCIAL_SUMMARY', label: t.financialSummary, icon: DollarSign },
    { value: 'INVOICE_REPORT', label: t.invoiceReport, icon: FileText },
    { value: 'PAYMENT_REPORT', label: t.paymentReport, icon: DollarSign },
    { value: 'CUSTOMER_REPORT', label: t.customerReport, icon: Users },
    { value: 'TAX_REPORT', label: t.taxReport, icon: BarChart3 },
    { value: 'INSURANCE_REPORT', label: t.insuranceReport, icon: FileText }
  ];

  const quickDateRanges = [
    { 
      label: t.today, 
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    { 
      label: t.yesterday, 
      start: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      end: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    },
    { 
      label: t.thisWeek, 
      start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    { 
      label: t.thisMonth, 
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    { 
      label: t.lastMonth, 
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
    },
    { 
      label: t.thisYear, 
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  ];

  const handleDateRangeChange = (start: string, end: string) => {
    setReportConfig(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const handleFilterChange = (filterType: string, value: string[]) => {
    setReportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      onGenerateReport?.(reportConfig);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType?.icon || BarChart3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.reportType}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setReportConfig(prev => ({ ...prev, type: type.value }))}
                    className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                      reportConfig.type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.dateRange}</h3>
            
            {/* Quick Date Ranges */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.quickRanges}</p>
              <div className="flex flex-wrap gap-2">
                {quickDateRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateRangeChange(range.start, range.end)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  value={reportConfig.dateRange.start}
                  onChange={(e) => handleDateRangeChange(e.target.value, reportConfig.dateRange.end)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  value={reportConfig.dateRange.end}
                  onChange={(e) => handleDateRangeChange(reportConfig.dateRange.start, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.filters}</h3>
            <div className="space-y-4">
              {/* Invoice Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.invoiceStatus}
                </label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    handleFilterChange('status', values);
                  }}
                >
                  <option value="DRAFT">{t.draft}</option>
                  <option value="SENT">{t.sent}</option>
                  <option value="PAID">{t.paid}</option>
                  <option value="OVERDUE">{t.overdue}</option>
                  <option value="CANCELLED">{t.cancelled}</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.paymentMethod}
                </label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    handleFilterChange('paymentMethod', values);
                  }}
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="CARD">{t.card}</option>
                  <option value="BANK_TRANSFER">{t.bankTransfer}</option>
                  <option value="CHECK">{t.check}</option>
                  <option value="INSURANCE">{t.insurance}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <div className="space-y-6">
          {/* Format & Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.format}</h3>
            <div className="space-y-3">
              {['PDF', 'EXCEL', 'CSV'].map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={reportConfig.format === format}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">{format}</span>
                </label>
              ))}
            </div>

            <h4 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">{t.options}</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-white">{t.includeCharts}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeDetails}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeDetails: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-white">{t.includeDetails}</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-3">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.generating}
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.generateReport}
                  </>
                )}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-4 w-4 mr-1" />
                  {t.download}
                </button>
                <button className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Printer className="h-4 w-4 mr-1" />
                  {t.print}
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.preview}</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              {React.createElement(getReportIcon(reportConfig.type), { 
                className: "mx-auto h-12 w-12 text-gray-400 mb-2" 
              })}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reportTypes.find(rt => rt.value === reportConfig.type)?.label}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(reportConfig.dateRange.start).toLocaleDateString()} - {new Date(reportConfig.dateRange.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;