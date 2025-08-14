import  React, { useState } from 'react';
import { Printer, RefreshCw, Eye, X } from 'lucide-react';
import { useAuth } from '../App';

interface PrintJob {
  id: string;
  type: 'report' | 'label' | 'invoice';
  patientName: string;
  status: 'pending' | 'printed' | 'failed';
  createdAt: string;
}

export default function PrintingModule() {
  const { language } = useAuth();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);

  const t = {
    fr: {
      title: 'Module d\'Impression',
      refresh: 'Actualiser',
      job: 'Tâche',
      type: 'Type',
      patient: 'Patient',
      status: 'Statut',
      date: 'Date',
      actions: 'Actions',
      close: 'Fermer',
      print: 'Imprimer'
    },
    en: {
      title: 'Printing Module',
      refresh: 'Refresh',
      job: 'Job',
      type: 'Type',
      patient: 'Patient',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      close: 'Close',
      print: 'Print'
    }
  }[language];

  const [printJobs] = useState<PrintJob[]>([
    {
      id: 'PRT001',
      type: 'report',
      patientName: 'Dupont, Marie',
      status: 'printed',
      createdAt: '2024-01-15 10:30'
    },
    {
      id: 'PRT002',
      type: 'label',
      patientName: 'Martin, Pierre',
      status: 'pending',
      createdAt: '2024-01-15 11:15'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      printed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      report: 'Rapport',
      label: 'Étiquette',
      invoice: 'Facture'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleView = (job: PrintJob) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  const handlePrint = (job: PrintJob) => {
    console.log('Printing job:', job.id);
  };

  const handleRefresh = () => {
    console.log('Refreshing print jobs...');
  };

  const ViewJobModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de la tâche</h3>
          <button onClick={() => setShowViewModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedJob && (
          <div className="space-y-3">
            <div><strong>ID:</strong> {selectedJob.id}</div>
            <div><strong>Type:</strong> {getTypeLabel(selectedJob.type)}</div>
            <div><strong>Patient:</strong> {selectedJob.patientName}</div>
            <div><strong>Statut:</strong> {selectedJob.status}</div>
            <div><strong>Date:</strong> {selectedJob.createdAt}</div>
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.close}
          </button>
          {selectedJob && selectedJob.status !== 'printed' && (
            <button
              onClick={() => handlePrint(selectedJob)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.print}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <RefreshCw size={20} className="mr-2" />
          {t.refresh}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.job}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.type}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.patient}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.date}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {printJobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{getTypeLabel(job.type)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{job.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{job.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleView(job)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handlePrint(job)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showViewModal && <ViewJobModal />}
    </div>
  );
}
 