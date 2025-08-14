import  React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Users, FileText, Activity } from 'lucide-react';
import { useAuth } from '../App';

interface PendingValidation {
  id: string;
  patientName: string;
  requestDate: string;
  analysisCount: number;
  priority: 'normal' | 'urgent';
  status: 'technical' | 'biological';
}

export default function BiologistDashboard() {
  const { language } = useAuth();
  
  const [pendingValidations] = useState<PendingValidation[]>([
    { id: 'REQ001', patientName: 'Kabbaj, Ahmed', requestDate: '2024-01-15', analysisCount: 2, priority: 'urgent', status: 'technical' },
    { id: 'REQ002', patientName: 'Benali, Fatima', requestDate: '2024-01-15', analysisCount: 4, priority: 'normal', status: 'biological' },
    { id: 'REQ003', patientName: 'Tazi, Mohammed', requestDate: '2024-01-14', analysisCount: 1, priority: 'normal', status: 'technical' }
  ]);

  const t = {
    fr: {
      title: 'Tableau de Bord Biologiste',
      pendingValidations: 'Validations en Attente',
      technicalValidation: 'Validation Technique',
      biologicalValidation: 'Validation Biologique',
      todayValidations: 'Validations du Jour',
      criticalResults: 'Résultats Critiques',
      patient: 'Patient',
      analyses: 'Analyses',
      priority: 'Priorité',
      status: 'Statut',
      viewDetails: 'Voir Détails',
      urgent: 'Urgent',
      normal: 'Normal',
      technical: 'Technique',
      biological: 'Biologique',
      quickActions: 'Actions Rapides',
      validateAll: 'Valider Tout',
      printReports: 'Imprimer Rapports',
      reviewAbnormal: 'Réviser Anormaux'
    },
    en: {
      title: 'Biologist Dashboard',
      pendingValidations: 'Pending Validations',
      technicalValidation: 'Technical Validation',
      biologicalValidation: 'Biological Validation',
      todayValidations: 'Today\'s Validations',
      criticalResults: 'Critical Results',
      patient: 'Patient',
      analyses: 'Analyses',
      priority: 'Priority',
      status: 'Status',
      viewDetails: 'View Details',
      urgent: 'Urgent',
      normal: 'Normal',
      technical: 'Technical',
      biological: 'Biological',
      quickActions: 'Quick Actions',
      validateAll: 'Validate All',
      printReports: 'Print Reports',
      reviewAbnormal: 'Review Abnormal'
    }
  }[language];

  const stats = [
    { label: t.pendingValidations, value: pendingValidations.length.toString(), icon: Clock, color: 'text-yellow-600' },
    { label: t.technicalValidation, value: pendingValidations.filter(p => p.status === 'technical').length.toString(), icon: CheckCircle, color: 'text-blue-600' },
    { label: t.biologicalValidation, value: pendingValidations.filter(p => p.status === 'biological').length.toString(), icon: Activity, color: 'text-green-600' },
    { label: t.criticalResults, value: '3', icon: AlertTriangle, color: 'text-red-600' }
  ];

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'biological' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {t.validateAll}
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
            <FileText size={20} className="mr-2" />
            {t.printReports}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Pending Validations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.pendingValidations}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.patient}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.analyses}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.priority}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pendingValidations.map((validation) => (
                <tr key={validation.id} className={validation.priority === 'urgent' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {validation.priority === 'urgent' && (
                        <AlertTriangle size={16} className="text-red-500 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {validation.patientName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {validation.id} - {validation.requestDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {validation.analysisCount} analyses
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(validation.priority)}`}>
                      {validation.priority === 'urgent' ? t.urgent : t.normal}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(validation.status)}`}>
                      {validation.status === 'biological' ? t.biological : t.technical}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      {t.viewDetails}
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <CheckCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.quickActions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-yellow-100 text-yellow-800 p-4 rounded-lg hover:bg-yellow-200 flex items-center justify-center">
            <AlertTriangle size={20} className="mr-2" />
            {t.reviewAbnormal}
          </button>
          <button className="bg-green-100 text-green-800 p-4 rounded-lg hover:bg-green-200 flex items-center justify-center">
            <CheckCircle size={20} className="mr-2" />
            {t.validateAll}
          </button>
          <button className="bg-blue-100 text-blue-800 p-4 rounded-lg hover:bg-blue-200 flex items-center justify-center">
            <FileText size={20} className="mr-2" />
            {t.printReports}
          </button>
        </div>
      </div>
    </div>
  );
}
 