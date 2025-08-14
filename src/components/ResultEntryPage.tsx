import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Printer, 
  Download,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../App';
import { resultsService, requestsService } from '../services/integrations';
import ResultReport from './ResultReport';
import { generateResultPDF } from '../utils/pdfGenerator';

interface Result {
  id: string;
  value: string | null;
  unit: string | null;
  reference: string | null;
  status: string;
  notes: string | null;
  analysis: {
    id: string;
    name: string;
    code: string;
    category: string;
  };
  request: {
    id: string;
    patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
      gender: string;
    cnssNumber?: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
      specialty?: string;
    };
    createdAt: string;
  };
}

interface SearchFilters {
  patientName: string;
  patientId: string;
  cnssNumber: string;
  requestId: string;
  status: string;
  analysisCode: string;
}

export default function ResultEntryPage() {
  const { language } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    patientName: '',
    patientId: '',
    cnssNumber: '',
    requestId: '',
    status: '',
    analysisCode: ''
  });

  const t = {
    fr: {
      title: 'Livraison des Résultats',
      subtitle: 'Panel de réception pour la récupération des résultats',
      searchPlaceholder: 'Nom, ID, CNSS ou référence',
      search: 'Rechercher',
      patient: 'Patient',
      request: 'Demande',
      doctor: 'Médecin',
      date: 'Date d\'analyse',
      status: 'Statut',
      actions: 'Actions',
      notFound: 'Aucun résultat trouvé',
      error: 'Erreur lors de la récupération',
      noResults: 'Aucun résultat trouvé',
      generateReport: 'Générer Rapport',
      print: 'Imprimer',
      download: 'Télécharger',
      view: 'Voir',
      markDelivered: 'Marquer comme Livré',
      delivered: 'Livré',
      inProgress: 'En cours',
      completed: 'Terminé',
      validated: 'Validé',
      pending: 'En attente',
      rejected: 'Rejeté',
      allStatuses: 'Tous les statuts',
      clearFilters: 'Effacer les filtres',
      refresh: 'Actualiser',
      patientName: 'Nom du patient',
      patientId: 'ID Patient',
      cnssNumber: 'Numéro CNSS',
      requestId: 'ID Demande',
      analysisCode: 'Code Analyse',
      test: 'Test',
      value: 'Valeur',
      reference: 'Référence',
      printTest: 'Imprimer Test',
      printIndividualTest: 'Imprimer Test Individuel',
      notReady: 'Pas encore prêt pour l\'impression',
      loading: 'Chargement...',
      requestsFound: 'demandes trouvées',
      resultsFound: 'résultats trouvés'
    },
    en: {
      title: 'Result Delivery',
      subtitle: 'Reception panel for result retrieval',
      searchPlaceholder: 'Name, ID, CNSS or reference',
      search: 'Search',
      patient: 'Patient',
      request: 'Request',
      doctor: 'Doctor',
      date: 'Analysis Date',
      status: 'Status',
      actions: 'Actions',
      notFound: 'No results found',
      error: 'Error fetching data',
      noResults: 'No results found',
      generateReport: 'Generate Report',
      print: 'Print',
      download: 'Download',
      view: 'View',
      markDelivered: 'Mark as Delivered',
      delivered: 'Delivered',
      inProgress: 'In Progress',
      completed: 'Completed',
      validated: 'Validated',
      pending: 'Pending',
      rejected: 'Rejected',
      allStatuses: 'All Statuses',
      clearFilters: 'Clear Filters',
      refresh: 'Refresh',
      patientName: 'Patient Name',
      patientId: 'Patient ID',
      cnssNumber: 'CNSS Number',
      requestId: 'Request ID',
      analysisCode: 'Analysis Code',
      test: 'Test',
      value: 'Value',
      reference: 'Reference',
      printTest: 'Print Test',
      printIndividualTest: 'Print Individual Test',
      notReady: 'Not ready for printing',
      loading: 'Loading...',
      requestsFound: 'requests found',
      resultsFound: 'results found'
    }
  }[language];

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, filters]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await resultsService.getResults({
        limit: 100,
        include: 'request,analysis'
      });
      
      setResults(response.results || []);
    } catch (error) {
      console.error('Error loading results:', error);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = results;

    if (filters.patientName) {
      filtered = filtered.filter(result => 
        result.request.patient.firstName.toLowerCase().includes(filters.patientName.toLowerCase()) ||
        result.request.patient.lastName.toLowerCase().includes(filters.patientName.toLowerCase())
      );
    }

    if (filters.patientId) {
      filtered = filtered.filter(result => 
        result.request.id.toLowerCase().includes(filters.patientId.toLowerCase())
      );
    }

    if (filters.cnssNumber) {
      filtered = filtered.filter(result => 
        result.request.patient.cnssNumber?.toLowerCase().includes(filters.cnssNumber.toLowerCase())
      );
    }

    if (filters.requestId) {
      filtered = filtered.filter(result => 
        result.request.id.toLowerCase().includes(filters.requestId.toLowerCase())
      );
    }

    if (filters.analysisCode) {
      filtered = filtered.filter(result => 
        result.analysis.code.toLowerCase().includes(filters.analysisCode.toLowerCase()) ||
        result.analysis.name.toLowerCase().includes(filters.analysisCode.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(result => result.status === filters.status);
    }

    setFilteredResults(filtered);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      patientName: '',
      patientId: '',
      cnssNumber: '',
      requestId: '',
      status: '',
      analysisCode: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VALIDATED': return t.validated;
      case 'COMPLETED': return t.completed;
      case 'PENDING': return t.pending;
      case 'REJECTED': return t.rejected;
      default: return status;
    }
  };

  const handleGenerateReport = async (result: Result) => {
    try {
      // Get full request data for the report
      const request = await requestsService.getRequest(result.request.id);
      setReportRequest(request);
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(language === 'fr' ? 'Erreur lors de la génération du rapport' : 'Error generating report');
    }
  };

  const handlePrint = async (result: Result) => {
    try {
      // Get full request data for printing
      const request = await requestsService.getRequest(result.request.id);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${result.analysis.name} - ${result.request.patient.firstName} ${result.request.patient.lastName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                .result { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
                .value { font-size: 18px; font-weight: bold; color: #2563eb; }
                .reference { color: #666; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Résultat d'Analyse</h1>
                <h2>${result.analysis.name}</h2>
              </div>
              <div class="info">
                <p><strong>Patient:</strong> ${result.request.patient.firstName} ${result.request.patient.lastName}</p>
                <p><strong>Date:</strong> ${new Date(result.request.createdAt).toLocaleDateString()}</p>
                <p><strong>Demande:</strong> ${result.request.id}</p>
              </div>
              <div class="result">
                <p><strong>Valeur:</strong> <span class="value">${result.value || 'N/A'} ${result.unit || ''}</span></p>
                <p><strong>Référence:</strong> <span class="reference">${result.reference || 'N/A'}</span></p>
                ${result.notes ? `<p><strong>Notes:</strong> ${result.notes}</p>` : ''}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing result:', error);
      alert(language === 'fr' ? "Erreur lors de l'impression" : 'Error printing');
    }
  };

  const handleGeneratePDF = async (result: Result) => {
    try {
      setIsGeneratingPDF(true);
      // Get full request data for PDF generation
      const request = await requestsService.getRequest(result.request.id);
      
      // Get results for this request
      const resultsData = await resultsService.getResultsByRequest(result.request.id);
      
      // Create a complete request object with results
      const completeRequest = {
        ...request,
        results: resultsData || []
      };
      
      console.log('Complete request for PDF:', completeRequest);
      
      await generateResultPDF(completeRequest, language);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'fr' ? 'Erreur lors de la génération du PDF' : 'Error generating PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintIndividualTest = async (result: Result) => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${result.analysis.name} - ${result.request.patient.firstName} ${result.request.patient.lastName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .result { border: 2px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .value { font-size: 24px; font-weight: bold; color: #2563eb; }
                .reference { color: #666; font-size: 16px; }
                .status { color: #059669; font-weight: bold; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Résultat d'Analyse Médicale</h1>
                <h2>${result.analysis.name} (${result.analysis.code})</h2>
              </div>
              <div class="info">
                <p><strong>Patient:</strong> ${result.request.patient.firstName} ${result.request.patient.lastName}</p>
                <p><strong>Date de naissance:</strong> ${new Date(result.request.patient.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Sexe:</strong> ${result.request.patient.gender}</p>
                <p><strong>Date d'analyse:</strong> ${new Date(result.request.createdAt).toLocaleDateString()}</p>
                <p><strong>Numéro de demande:</strong> ${result.request.id}</p>
                ${result.request.patient.cnssNumber ? `<p><strong>CNSS:</strong> ${result.request.patient.cnssNumber}</p>` : ''}
              </div>
              <div class="result">
                <p><strong>Résultat:</strong> <span class="value">${result.value || 'N/A'} ${result.unit || ''}</span></p>
                <p><strong>Valeurs de référence:</strong> <span class="reference">${result.reference || 'N/A'}</span></p>
                <p><strong>Statut:</strong> <span class="status">${getStatusText(result.status)}</span></p>
                ${result.notes ? `<p><strong>Notes:</strong> ${result.notes}</p>` : ''}
              </div>
              <div style="margin-top: 40px; text-align: center;">
                <p><em>Ce rapport a été généré automatiquement par le système SIL Lab</em></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing individual test:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'impression du test' : 'Error printing test');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={loadResults}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t.refresh}</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              {language === 'fr' ? 'Comment imprimer les résultats' : 'How to print results'}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {language === 'fr' 
                ? '1. Trouvez un résultat avec statut "Validé" 2. Cliquez sur l\'icône imprimante pour imprimer le test individuel 3. Ou cliquez sur "Voir" puis "Générer PDF" pour le rapport complet'
                : '1. Find a result with "Validated" status 2. Click the printer icon to print individual test 3. Or click "View" then "Generate PDF" for complete report'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={filters.patientName}
              onChange={(e) => handleFilterChange('patientName', e.target.value)}
              placeholder={t.patientName}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={filters.patientId}
              onChange={(e) => handleFilterChange('patientId', e.target.value)}
              placeholder={t.patientId}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={filters.cnssNumber}
              onChange={(e) => handleFilterChange('cnssNumber', e.target.value)}
              placeholder={t.cnssNumber}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={filters.requestId}
              onChange={(e) => handleFilterChange('requestId', e.target.value)}
              placeholder={t.requestId}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={filters.analysisCode}
              onChange={(e) => handleFilterChange('analysisCode', e.target.value)}
              placeholder={t.analysisCode}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t.allStatuses}</option>
              <option value="PENDING">{t.pending}</option>
              <option value="COMPLETED">{t.completed}</option>
              <option value="VALIDATED">{t.validated}</option>
              <option value="REJECTED">{t.rejected}</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>{t.clearFilters}</span>
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredResults.length} {t.resultsFound}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.patient}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.test}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.value}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.reference}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.date}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t.notFound}
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.request.patient.firstName} {result.request.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.request.patient.cnssNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.analysis.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.analysis.code} - {result.analysis.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.value || '-'} {result.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {result.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(result.request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusText(result.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                          title={t.view}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {result.status === 'VALIDATED' && (
                          <>
                            <button
                              onClick={() => handlePrintIndividualTest(result)}
                              className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                              title={t.printIndividualTest}
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(result)}
                              disabled={isGeneratingPDF}
                              className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={language === 'fr' ? 'Générer PDF' : 'Generate PDF'}
                            >
                              {isGeneratingPDF ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedResult.analysis.name} - {selectedResult.request.patient.firstName} {selectedResult.request.patient.lastName}
                </h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <AlertCircle size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.patient}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.request.patient.firstName} {selectedResult.request.patient.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CNSS: {selectedResult.request.patient.cnssNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.status}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedResult.status)}`}>
                    {getStatusText(selectedResult.status)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.test}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.analysis.name} ({selectedResult.analysis.code})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.analysis.category}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.value}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.value || '-'} {selectedResult.unit}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Référence: {selectedResult.reference || '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {selectedResult.status === 'VALIDATED' ? (
                  <>
                    <button
                      onClick={() => handlePrintIndividualTest(selectedResult)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                      <Printer size={16} />
                      <span>{t.printIndividualTest}</span>
                    </button>
                    <button
                      onClick={() => handleGeneratePDF(selectedResult)}
                      disabled={isGeneratingPDF}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{language === 'fr' ? 'Génération...' : 'Generating...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{language === 'fr' ? 'Générer PDF' : 'Generate PDF'}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{t.notReady}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Report Modal */}
      {showReport && reportRequest && (
        <ResultReport
          request={reportRequest}
          onClose={() => {
            setShowReport(false);
            setReportRequest(null);
          }}
        />
      )}
    </div>
  );
}
 