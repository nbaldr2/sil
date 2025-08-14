import  React, { useState } from 'react';
import { Upload, Download, FileText, Database, X } from 'lucide-react';
import { useAuth } from '../App';

interface ImportJob {
  id: string;
  filename: string;
  type: 'patient' | 'analysis' | 'billing';
  status: 'pending' | 'completed' | 'failed';
  importedAt: string;
}

export default function ImportExport() {
  const { language } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const t = {
    fr: {
      title: 'Import/Export',
      importData: 'Importer des Données',
      exportData: 'Exporter des Données',
      recentImports: 'Imports Récents',
      filename: 'Fichier',
      type: 'Type',
      status: 'Statut',
      date: 'Date',
      selectFile: 'Sélectionner un fichier',
      upload: 'Télécharger',
      close: 'Fermer',
      cancel: 'Annuler'
    },
    en: {
      title: 'Import/Export',
      importData: 'Import Data',
      exportData: 'Export Data',
      recentImports: 'Recent Imports',
      filename: 'Filename',
      type: 'Type',
      status: 'Status',
      date: 'Date',
      selectFile: 'Select file',
      upload: 'Upload',
      close: 'Close',
      cancel: 'Cancel'
    }
  }[language];

  const [imports] = useState<ImportJob[]>([
    {
      id: 'IMP001',
      filename: 'patients_january.csv',
      type: 'patient',
      status: 'completed',
      importedAt: '2024-01-15 10:30'
    },
    {
      id: 'IMP002',
      filename: 'analyses_batch.xlsx',
      type: 'analysis',
      status: 'pending',
      importedAt: '2024-01-15 11:15'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      patient: 'Patients',
      analysis: 'Analyses',
      billing: 'Facturation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleUpload = () => {
    console.log('Uploading file:', selectedFile?.name);
    setShowUploadModal(false);
    setSelectedFile(null);
  };

  const handleExport = (type: string) => {
    console.log('Exporting:', type);
  };

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer l'import</h3>
          <button onClick={() => setShowUploadModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedFile && (
          <div className="space-y-3 mb-6">
            <div><strong>Fichier:</strong> {selectedFile.name}</div>
            <div><strong>Taille:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</div>
            <div><strong>Type:</strong> {selectedFile.type}</div>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowUploadModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.upload}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.importData}</h3>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button 
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {t.selectFile}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Download className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.exportData}</h3>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => handleExport('patients')}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <FileText size={16} className="mr-2" />
              Export Patients CSV
            </button>
            <button 
              onClick={() => handleExport('analyses')}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Database size={16} className="mr-2" />
              Export Analyses JSON
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentImports}</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.filename}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.type}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.date}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {imports.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.filename}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{getTypeLabel(job.type)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{job.importedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUploadModal && <UploadModal />}
    </div>
  );
}
 