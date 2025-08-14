import  React, { useState } from 'react';
import { Save, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAuth } from '../App';
import ResultStatusIndicator from './ResultStatusIndicator';

interface Analysis {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'pending' | 'completed' | 'abnormal' | 'missing';
  comment: string;
}

interface Result {
  id: string;
  requestId: string;
  analysisId: string;
  value: string | null;
  unit: string | null;
  reference: string | null;
  status: string;
  notes: string | null;
  analysis: {
    id: string;
    code: string;
    name: string;
    category: string;
  };
}

interface ResultEntryFormProps {
  requestInfo: {
    id: string;
    patientName: string;
  };
  results?: Result[];
}

export default function ResultEntryForm({ requestInfo, results }: ResultEntryFormProps) {
  const { language } = useAuth();
  
  // Convert backend results to frontend format
  const convertResultsToAnalyses = (results: Result[]): Analysis[] => {
    return results.map(result => ({
      id: result.analysisId,
      name: result.analysis.name,
      value: result.value || '',
      unit: result.unit || '',
      referenceRange: result.reference || '',
      status: result.status === 'PENDING' ? 'pending' : 
              result.status === 'VALIDATED' ? 'completed' : 
              result.status === 'REJECTED' ? 'abnormal' : 'missing',
      comment: result.notes || ''
    }));
  };

  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    if (results && results.length > 0) {
      return convertResultsToAnalyses(results);
    }
    // Fallback to sample data if no results
    return [
      {
        id: 'ANA001',
        name: 'Glycémie',
        value: '',
        unit: 'g/L',
        referenceRange: '0.7-1.1',
        status: 'pending',
        comment: ''
      },
      {
        id: 'ANA002',
        name: 'ASAT',
        value: '45',
        unit: 'UI/L',
        referenceRange: '10-40',
        status: 'abnormal',
        comment: 'Elevated level, suggest retesting'
      },
      {
        id: 'ANA003',
        name: 'ALAT',
        value: '38',
        unit: 'UI/L',
        referenceRange: '10-40',
        status: 'completed',
        comment: ''
      }
    ];
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const t = {
    fr: {
      analysis: 'Analyse',
      result: 'Résultat',
      reference: 'Référence',
      unit: 'Unité',
      comment: 'Commentaire',
      status: 'Statut',
      saveDraft: 'Sauvegarder brouillon',
      markReady: 'Marquer prêt',
      saved: 'Résultats sauvegardés',
      ready: 'Marqué comme prêt pour validation',
      addComment: 'Ajouter un commentaire...'
    },
    en: {
      analysis: 'Analysis',
      result: 'Result',
      reference: 'Reference',
      unit: 'Unit',
      comment: 'Comment',
      status: 'Status',
      saveDraft: 'Save Draft',
      markReady: 'Mark Ready',
      saved: 'Results saved',
      ready: 'Marked ready for validation',
      addComment: 'Add comment...'
    }
  }[language];

  const updateAnalysis = (id: string, field: keyof Analysis, value: string) => {
    setAnalyses(prev => prev.map(analysis => {
      if (analysis.id === id) {
        const updated = { ...analysis, [field]: value };
        if (field === 'value' && value) {
          const numValue = parseFloat(value);
          const [min, max] = updated.referenceRange.split('-').map(parseFloat);
          updated.status = numValue < min || numValue > max ? 'abnormal' : 'completed';
        }
        return updated;
      }
      return analysis;
    }));
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveDraft = () => {
    showToastMessage(t.saved);
  };

  const handleMarkReady = () => {
    showToastMessage(t.ready);
  };

  const getRowClass = (status: string) => {
    switch (status) {
      case 'abnormal': return 'bg-red-50 dark:bg-red-900/20';
      case 'completed': return 'bg-green-50 dark:bg-green-900/20';
      case 'missing': return 'bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {requestInfo.patientName} - {requestInfo.id}
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{t.saveDraft}</span>
            </button>
            <button
              onClick={handleMarkReady}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>{t.markReady}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.analysis}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.result}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.unit}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.reference}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.comment}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {analyses.map((analysis) => (
              <tr key={analysis.id} className={getRowClass(analysis.status)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-white">{analysis.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={analysis.value}
                    onChange={(e) => updateAnalysis(analysis.id, 'value', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {analysis.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {analysis.referenceRange}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ResultStatusIndicator status={analysis.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="text-gray-400" size={16} />
                    <input
                      type="text"
                      value={analysis.comment}
                      onChange={(e) => updateAnalysis(analysis.id, 'comment', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.addComment}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
 