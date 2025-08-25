import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, AlertTriangle, Check, X, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../App';
import { resultsService } from '../services/integrations';

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
    };
    doctor?: {
      firstName: string;
      lastName: string;
      specialty?: string;
    };
  };
}

export default function BiologistValidation() {
  const { language } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const t = {
    fr: {
      title: 'Validation des Résultats',
      subtitle: 'Panel de validation pour les biologistes',
      searchPlaceholder: 'Nom du patient, code analyse...',
      patient: 'Patient',
      analysis: 'Analyse',
      value: 'Valeur',
      reference: 'Référence',
      status: 'Statut',
      actions: 'Actions',
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté',
      validate: 'Valider',
      reject: 'Rejeter',
      view: 'Voir',
      refresh: 'Actualiser',
      notFound: 'Aucun résultat trouvé',
      error: 'Erreur lors de la récupération',
      loading: 'Chargement...',
      confirmValidation: 'Confirmer la validation',
      confirmRejection: 'Confirmer le rejet',
      validationNotes: 'Notes de validation',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      validationSuccess: 'Résultat validé avec succès',
      rejectionSuccess: 'Résultat rejeté avec succès',
      validationError: 'Erreur lors de la validation',
      rejectionError: 'Erreur lors du rejet',
      close: 'Fermer',
      doctor: 'Médecin',
      specialty: 'Spécialité',
      notes: 'Notes'
    },
    en: {
      title: 'Result Validation',
      subtitle: 'Biologist validation panel',
      searchPlaceholder: 'Patient name, analysis code...',
      patient: 'Patient',
      analysis: 'Analysis',
      value: 'Value',
      reference: 'Reference',
      status: 'Status',
      actions: 'Actions',
      pending: 'Pending',
      validated: 'Validated',
      rejected: 'Rejected',
      validate: 'Validate',
      reject: 'Reject',
      view: 'View',
      refresh: 'Refresh',
      notFound: 'No results found',
      error: 'Error fetching data',
      loading: 'Loading...',
      confirmValidation: 'Confirm validation',
      confirmRejection: 'Confirm rejection',
      validationNotes: 'Validation notes',
      cancel: 'Cancel',
      confirm: 'Confirm',
      validationSuccess: 'Result validated successfully',
      rejectionSuccess: 'Result rejected successfully',
      validationError: 'Error during validation',
      rejectionError: 'Error during rejection',
      close: 'Close',
      doctor: 'Doctor',
      specialty: 'Specialty',
      notes: 'Notes'
    }
  }[language];

  const showToastNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only fetch results with PENDING status that need validation
      const response = await resultsService.getResults({
        limit: 100,
        include: 'request,analysis',
        status: 'PENDING'
      });
      
      setResults(response.results || []);
    } catch (error) {
      console.error('Error loading results:', error);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VALIDATED': return t.validated;
      case 'REJECTED': return t.rejected;
      case 'PENDING': return t.pending;
      default: return status;
    }
  };

  const handleValidate = async (result: Result) => {
    try {
      setValidating(result.id);
      await resultsService.validateResult(result.id, 'biologist-user');
      
      // Update local state
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, status: 'VALIDATED' } : r
      ));
      
      // Close modal if open
      if (selectedResult?.id === result.id) {
        setShowModal(false);
        setSelectedResult(null);
      }
      
      showToastNotification(t.validationSuccess, 'success');
    } catch (error) {
      console.error('Error validating result:', error);
      showToastNotification(t.validationError, 'error');
    } finally {
      setValidating(null);
    }
  };

  const handleReject = async (result: Result) => {
    try {
      setValidating(result.id);
      await resultsService.updateResult(result.id, {
        status: 'REJECTED'
      });
      
      // Update local state
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, status: 'REJECTED' } : r
      ));
      
      // Close modal if open
      if (selectedResult?.id === result.id) {
        setShowModal(false);
        setSelectedResult(null);
      }
      
      showToastNotification(t.rejectionSuccess, 'success');
    } catch (error) {
      console.error('Error rejecting result:', error);
      showToastNotification(t.rejectionError, 'error');
    } finally {
      setValidating(null);
    }
  };

  const filteredResults = results.filter(result => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      result.request.patient.firstName.toLowerCase().includes(search) ||
      result.request.patient.lastName.toLowerCase().includes(search) ||
      result.analysis.code.toLowerCase().includes(search) ||
      result.analysis.name.toLowerCase().includes(search)
    );
  });

  const ResultModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedResult?.analysis.name} - {selectedResult?.request.patient.firstName} {selectedResult?.request.patient.lastName}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedResult(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          {selectedResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.patient}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.request.patient.firstName} {selectedResult.request.patient.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.request.patient.gender}, {new Date(selectedResult.request.patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.analysis}</h4>
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
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.reference}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.reference || '-'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.status}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedResult.status)}`}>
                  {getStatusText(selectedResult.status)}
                </span>
              </div>
              
              {selectedResult.request.doctor && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.doctor}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.request.doctor.firstName} {selectedResult.request.doctor.lastName}
                  </p>
                  {selectedResult.request.doctor.specialty && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedResult.request.doctor.specialty}
                    </p>
                  )}
                </div>
              )}
              
              {selectedResult.notes && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t.notes}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedResult.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {selectedResult && selectedResult.status === 'PENDING' && (
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleReject(selectedResult)}
                disabled={validating === selectedResult.id}
                className="px-4 py-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
              >
                {validating === selectedResult.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  t.reject
                )}
              </button>
              <button
                onClick={() => handleValidate(selectedResult)}
                disabled={validating === selectedResult.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {validating === selectedResult.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  t.validate
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.patient}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.analysis}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.value}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.reference}
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
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{t.loading}</span>
                  </div>
                </td>
              </tr>
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t.notFound}
                </td>
              </tr>
            ) : (
              filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.request.patient.firstName} {result.request.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {result.request.patient.gender}, {new Date(result.request.patient.dateOfBirth).toLocaleDateString()}
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
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.value || '-'} {result.unit}
                      </span>
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {result.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleValidate(result)}
                            disabled={validating === result.id}
                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50"
                            title={t.validate}
                          >
                            {validating === result.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(result)}
                            disabled={validating === result.id}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                            title={t.reject}
                          >
                            {validating === result.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <X size={16} />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title={t.view}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Result Detail Modal */}
      {showModal && <ResultModal />}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center z-50 ${
          toastType === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toastType === 'success' ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <AlertTriangle size={20} className="mr-2" />
          )}
          {toastMessage}
          <button onClick={() => setShowToast(false)} className="ml-4">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
} 