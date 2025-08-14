import  React, { useState } from 'react'; 
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../App';

interface Result {
  id: string;
  requestId: string;
  patientName: string;
  testName: string;
  value: string;
  unit: string;
  reference: string;
  status: 'pending' | 'entered' | 'validated';
}

export default function ResultEntry() {
  const { language } = useAuth();
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const t = {
    fr: {
      title: 'Saisie des Résultats',
      validate: 'Valider',
      request: 'Demande',
      patient: 'Patient',
      test: 'Analyse',
      value: 'Valeur',
      unit: 'Unité',
      reference: 'Référence',
      status: 'Statut',
      actions: 'Actions',
      close: 'Fermer',
      confirm: 'Confirmer',
      cancel: 'Annuler'
    },
    en: {
      title: 'Result Entry',
      validate: 'Validate',
      request: 'Request',
      patient: 'Patient',
      test: 'Test',
      value: 'Value',
      unit: 'Unit',
      reference: 'Reference',
      status: 'Status',
      actions: 'Actions',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  }[language];

   const [results, setResults] = useState<Result[]>([
    {
      id: 'RES001',
      requestId: 'REQ001',
      patientName: 'Dupont, Marie',
      testName: 'Hémogramme',
      value: '4.2',
      unit: 'G/L',
      reference: '4.0-5.5',
      status: 'entered'
    },
    {
      id: 'RES002',
      requestId: 'REQ001',
      patientName: 'Dupont, Marie',
      testName: 'Glycémie',
      value: '',
      unit: 'g/L',
      reference: '0.7-1.1',
      status: 'pending'
    },
    {
      id: 'RES003',
      requestId: 'REQ002',
      patientName: 'Martin, Pierre',
      testName: 'Créatinine',
      value: '12',
      unit: 'mg/L',
      reference: '7-13',
      status: 'entered'
    }
  ]); 

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'entered':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <AlertCircle className="text-red-500" size={16} />;
    }
  };

  const validateResult = (result: Result) => {
    setSelectedResult(result);
    setShowValidateModal(true);
  };

   const confirmValidation = () => {
    if (selectedResult) {
      setResults(prev => prev.map(result => 
        result.id === selectedResult.id 
          ? { ...result, status: 'validated' as const }
          : result
      ));
    }
    setShowValidateModal(false);
    setSelectedResult(null);
  };

  const updateResultValue = (id: string, value: string) => {
    setResults(prev => prev.map(result => 
      result.id === id 
        ? { ...result, value, status: value ? 'entered' as const : 'pending' as const }
        : result
    ));
  }; 

  const ValidateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Valider le résultat</h3>
          <button onClick={() => setShowValidateModal(false)}>
            <X size={20} className="text-gray-500" />
          </button> 
        </div>
        {selectedResult && (
          <div className="space-y-3 mb-6">
            <div><strong>Patient:</strong> {selectedResult.patientName}</div>
            <div><strong>Test:</strong> {selectedResult.testName}</div>
            <div><strong>Valeur:</strong> {selectedResult.value} {selectedResult.unit}</div>
            <div><strong>Référence:</strong> {selectedResult.reference}</div>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowValidateModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={confirmValidation}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.title}</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.request}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.patient}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.test}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.value}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.reference}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result) => (
              <tr key={result.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{result.requestId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.testName}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {result.status === 'pending' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={result.value}
                        onChange={(e) => updateResultValue(result.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Valeur"
                      />
                      <span className="text-gray-500">{result.unit}</span>
                    </div>
                  ) : (
                    `${result.value} ${result.unit}`
                  )}
                </td> 
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm">{result.status}</span>
                  </div>
                </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    {result.status === 'entered' && (
                      <button
                        onClick={() => validateResult(result)}
                        className="text-green-600 hover:text-green-900"
                        title={t.validate}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {result.status === 'validated' && (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle size={16} className="mr-1" />
                        Validé
                      </span>
                    )}
                  </div>
                </td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showValidateModal && <ValidateModal />}
    </div>
  );
}
 