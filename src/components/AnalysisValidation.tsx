import  React, { useState } from 'react';
import { Search, CheckCircle, AlertCircle, Printer, MessageSquare } from 'lucide-react';
import { useAuth } from '../App';

interface Result {
  id: string;
  analysisCode: string;
  analysisName: string;
  measuredValue: string;
  referenceRange: string;
  unit: string;
  status: 'pending' | 'validated';
  comment: string;
  abnormal: boolean;
}

interface Request {
  id: string;
  patientName: string;
  requestDate: string;
  results: Result[];
  technicalValidation: boolean;
  biologicalValidation: boolean;
}

export default function AnalysisValidation() {
  const { language } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);

  const t = {
    fr: {
      title: 'Validation des Analyses',
      search: 'Rechercher par Patient ou ID...',
      patientName: 'Patient',
      requestDate: 'Date de demande',
      analysis: 'Analyse',
      value: 'Valeur',
      reference: 'Référence',
      unit: 'Unité',
      status: 'Statut',
      comment: 'Commentaire',
      validateTechnical: 'Validation Technique',
      validateBiological: 'Validation Biologique',
      printReport: 'Imprimer Rapport',
      pending: 'En attente',
      validated: 'Validé',
      abnormal: 'Anormal'
    },
    en: {
      title: 'Analysis Validation',
      search: 'Search by Patient or ID...',
      patientName: 'Patient',
      requestDate: 'Request Date',
      analysis: 'Analysis',
      value: 'Value',
      reference: 'Reference',
      unit: 'Unit',
      status: 'Status',
      comment: 'Comment',
      validateTechnical: 'Technical Validation',
      validateBiological: 'Biological Validation',
      printReport: 'Print Report',
      pending: 'Pending',
      validated: 'Validated',
      abnormal: 'Abnormal'
    }
  }[language];

  const [requests] = useState<Request[]>([
    {
      id: 'REQ001',
      patientName: 'Kabbaj, Ahmed',
      requestDate: '2024-01-15',
      technicalValidation: true,
      biologicalValidation: false,
      results: [
        {
          id: '1',
          analysisCode: '4010',
          analysisName: 'Glycémie',
          measuredValue: '1.2',
          referenceRange: '0.7-1.1',
          unit: 'g/L',
          status: 'pending',
          comment: '',
          abnormal: true
        },
        {
          id: '2',
          analysisCode: '4020',
          analysisName: 'ALAT',
          measuredValue: '45',
          referenceRange: '< 40',
          unit: 'UI/L',
          status: 'pending',
          comment: '',
          abnormal: true
        }
      ]
    }
  ]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const found = requests.find(r => 
      r.patientName.toLowerCase().includes(term.toLowerCase()) ||
      r.id.toLowerCase().includes(term.toLowerCase())
    );
    setSelectedRequest(found || null);
  };

  const updateResultValue = (resultId: string, value: string) => {
    if (selectedRequest) {
      const updated = {
        ...selectedRequest,
        results: selectedRequest.results.map(r =>
          r.id === resultId ? { ...r, measuredValue: value } : r
        )
      };
      setSelectedRequest(updated);
    }
  };

  const updateComment = (resultId: string, comment: string) => {
    if (selectedRequest) {
      const updated = {
        ...selectedRequest,
        results: selectedRequest.results.map(r =>
          r.id === resultId ? { ...r, comment } : r
        )
      };
      setSelectedRequest(updated);
    }
    setEditingComment(null);
  };

  const validateTechnical = () => {
    if (selectedRequest) {
      setSelectedRequest({
        ...selectedRequest,
        technicalValidation: true
      });
    }
  };

  const validateBiological = () => {
    if (selectedRequest) {
      setSelectedRequest({
        ...selectedRequest,
        biologicalValidation: true,
        results: selectedRequest.results.map(r => ({ ...r, status: 'validated' }))
      });
    }
  };

  const printReport = () => {
    if (selectedRequest?.biologicalValidation) {
      console.log('Printing report for:', selectedRequest.id);
      // Integration with printing service
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.title}</h2>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {selectedRequest && (
        <div className="space-y-6">
          {/* Request Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.patientName}
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.patientName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Demande
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.requestDate}
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.requestDate}
                </p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.analysis}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.value}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.reference}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.unit}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.comment}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedRequest.results.map((result) => (
                  <tr 
                    key={result.id}
                    className={result.status === 'pending' ? 'bg-red-50 dark:bg-red-900/20' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {result.abnormal && (
                          <AlertCircle size={16} className="text-red-500 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.analysisName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.analysisCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={result.measuredValue}
                        onChange={(e) => updateResultValue(result.id, e.target.value)}
                        className={`w-20 px-2 py-1 border rounded text-sm ${
                          result.abnormal 
                            ? 'border-red-300 text-red-900' 
                            : 'border-gray-300'
                        } dark:bg-gray-700 dark:text-white`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {result.referenceRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {result.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.status === 'validated'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'validated' ? t.validated : t.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingComment === result.id ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={result.comment}
                            onChange={(e) => updateComment(result.id, e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:text-white"
                            onBlur={() => setEditingComment(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingComment(null)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingComment(result.id)}
                          className="flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <MessageSquare size={16} className="mr-1" />
                          {result.comment || 'Ajouter'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  onClick={validateTechnical}
                  disabled={selectedRequest.technicalValidation}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    selectedRequest.technicalValidation
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <CheckCircle size={20} className="mr-2" />
                  {t.validateTechnical}
                </button>
                
                <button
                  onClick={validateBiological}
                  disabled={!selectedRequest.technicalValidation || selectedRequest.biologicalValidation}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    selectedRequest.biologicalValidation
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : selectedRequest.technicalValidation
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={20} className="mr-2" />
                  {t.validateBiological}
                </button>
              </div>
              
              <button
                onClick={printReport}
                disabled={!selectedRequest.biologicalValidation}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  selectedRequest.biologicalValidation
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Printer size={20} className="mr-2" />
                {t.printReport}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 