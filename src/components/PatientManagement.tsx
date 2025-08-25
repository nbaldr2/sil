import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, X, FileText } from 'lucide-react';
import { useAuth } from '../App';
import { patientsService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address?: string;
  cnssNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PatientManagement() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const t = {
    fr: {
      title: 'Gestion des Patients',
      newPatient: 'Nouveau Patient',
      search: 'Rechercher un patient...',
      name: 'Nom',
      birthDate: 'Date de Naissance',
      socialSecurity: 'Sécurité Sociale',
      phone: 'Téléphone',
      email: 'Email',
      lastVisit: 'Dernière Visite',
      actions: 'Actions',
      close: 'Fermer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      viewResults: 'Voir les résultats'
    },
    en: {
      title: 'Patient Management',
      newPatient: 'New Patient',
      search: 'Search patient...',
      name: 'Name',
      birthDate: 'Birth Date',
      socialSecurity: 'Social Security',
      phone: 'Phone',
      email: 'Email',
      lastVisit: 'Last Visit',
      actions: 'Actions',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      viewResults: 'View Results'
    }
  }[language];

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const result = await patientsService.getPatients();
        if (result.patients) {
          setPatients(result.patients);
        } else {
          setPatients([]);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowNewModal(true);
  };
  
  const handleViewResults = (patient: Patient) => {
    // Navigate to results page with patient ID as a query parameter
    // Make sure we're using the correct patient ID format from the database
    navigate(`/results?patientId=${patient.id}`);
    console.log('Navigating to results for patient:', patient.id);
  };

  const NewPatientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {selectedPatient ? 'Modifier Patient' : t.newPatient}
          </h3>
          <button onClick={() => setShowNewModal(false)} className="p-1">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Prénom"
            defaultValue={selectedPatient?.firstName || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Nom"
            defaultValue={selectedPatient?.lastName || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            defaultValue={selectedPatient?.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toISOString().split('T')[0] : ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Sécurité Sociale"
            defaultValue={selectedPatient?.cnssNumber || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            defaultValue={selectedPatient?.phone || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            defaultValue={selectedPatient?.email || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );

  const ViewPatientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Détails du patient</h3>
          <button onClick={() => setShowViewModal(false)} className="p-1">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedPatient && (
          <div className="space-y-3">
            <div><strong>ID:</strong> {selectedPatient.id}</div>
            <div><strong>Nom:</strong> {`${selectedPatient.firstName} ${selectedPatient.lastName}`}</div>
            <div><strong>Date de naissance:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</div>
            <div><strong>Genre:</strong> {selectedPatient.gender}</div>
            <div><strong>Sécurité Sociale:</strong> {selectedPatient.cnssNumber || 'N/A'}</div>
            <div><strong>Téléphone:</strong> {selectedPatient.phone}</div>
            <div><strong>Email:</strong> {selectedPatient.email}</div>
            <div><strong>Adresse:</strong> {selectedPatient.address || 'N/A'}</div>
            <div><strong>Créé le:</strong> {new Date(selectedPatient.createdAt).toLocaleDateString()}</div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={18} className="mr-2" />
          <span className="hidden sm:inline">{t.newPatient}</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.name}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">{t.birthDate}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{t.socialSecurity}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{t.phone}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{t.lastVisit}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun patient enregistré.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="truncate max-w-[120px] sm:max-w-none">
                      {`${patient.firstName} ${patient.lastName}`}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                    <div className="truncate max-w-[120px]">
                      {patient.cnssNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
                    {patient.phone}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(patient)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(patient)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewResults(patient)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title={t.viewResults}
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && <NewPatientModal />}
      {showViewModal && <ViewPatientModal />}
    </div>
  );
}
 