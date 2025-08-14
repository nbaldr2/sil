import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, User, Mail, Phone, Building, Plus, X } from 'lucide-react';
import { doctorsService } from '../../services/integrations';

interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  orderNumber: string;
}

interface Step3DoctorRefProps {
  data: DoctorInfo;
  updateData: (field: keyof DoctorInfo, value: string) => void;
  language: 'fr' | 'en';
}

export default function Step3DoctorRef({ data, updateData, language }: Step3DoctorRefProps) {
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isNewDoctor, setIsNewDoctor] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const t = {
    title: language === 'fr' ? 'Référence du Médecin' : 'Doctor Reference',
    subtitle: language === 'fr' ? 'Sélectionnez le médecin prescripteur ou ajoutez un nouveau' : 'Select the prescribing doctor or add a new one',
    searchDoctor: language === 'fr' ? 'Rechercher un médecin...' : 'Search for a doctor...',
    selectDoctor: language === 'fr' ? 'Sélectionner un médecin' : 'Select a doctor',
    addNewDoctor: language === 'fr' ? 'Ajouter un nouveau médecin' : 'Add new doctor',
    firstName: language === 'fr' ? 'Prénom' : 'First Name',
    lastName: language === 'fr' ? 'Nom' : 'Last Name',
    email: language === 'fr' ? 'Email' : 'Email',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    specialty: language === 'fr' ? 'Spécialité' : 'Specialty',
    orderNumber: language === 'fr' ? 'Numéro d\'ordre' : 'Order Number',
    selectedDoctor: language === 'fr' ? 'Médecin sélectionné' : 'Selected Doctor',
    noDoctorSelected: language === 'fr' ? 'Aucun médecin sélectionné' : 'No doctor selected',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    noDoctorsFound: language === 'fr' ? 'Aucun médecin trouvé' : 'No doctors found',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    specialties: {
      cardiology: language === 'fr' ? 'Cardiologie' : 'Cardiology',
      endocrinology: language === 'fr' ? 'Endocrinologie' : 'Endocrinology',
      gastroenterology: language === 'fr' ? 'Gastro-entérologie' : 'Gastroenterology',
      dermatology: language === 'fr' ? 'Dermatologie' : 'Dermatology',
      neurology: language === 'fr' ? 'Neurologie' : 'Neurology',
      oncology: language === 'fr' ? 'Oncologie' : 'Oncology',
      pediatrics: language === 'fr' ? 'Pédiatrie' : 'Pediatrics',
      psychiatry: language === 'fr' ? 'Psychiatrie' : 'Psychiatry',
      radiology: language === 'fr' ? 'Radiologie' : 'Radiology',
      surgery: language === 'fr' ? 'Chirurgie' : 'Surgery',
      other: language === 'fr' ? 'Autre' : 'Other'
    }
  };

  useEffect(() => {
    console.log('Step3DoctorRef mounted, loading doctors...');
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorsService.getDoctors();
      console.log('Doctors API response:', response);
      // The API returns { doctors: [...], pagination: {...} }
      const doctors = response.doctors || response || [];
      console.log('Processed doctors:', doctors);
      setAvailableDoctors(doctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setAvailableDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor: any) => {
    updateData('id', doctor.id);
    updateData('firstName', doctor.firstName || '');
    updateData('lastName', doctor.lastName || '');
    updateData('email', doctor.email || '');
    updateData('phone', doctor.phone || '');
    updateData('specialty', doctor.specialty || '');
    updateData('orderNumber', doctor.orderNumber || '');
    setShowDoctorModal(false);
    setIsNewDoctor(false);
  };

  const handleClearDoctor = () => {
    updateData('id', '');
    updateData('firstName', '');
    updateData('lastName', '');
    updateData('email', '');
    updateData('phone', '');
    updateData('specialty', '');
    updateData('orderNumber', '');
    setIsNewDoctor(true);
  };

  const filteredDoctors = availableDoctors.filter(doctor => {
    const firstName = doctor.firstName || '';
    const lastName = doctor.lastName || '';
    const specialty = doctor.specialty || '';
    
    return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           specialty.toLowerCase().includes(searchTerm.toLowerCase());
  });

  console.log('Available doctors:', availableDoctors);
  console.log('Filtered doctors:', filteredDoctors);
  console.log('Search term:', searchTerm);

  const handleInputChange = (field: keyof DoctorInfo, value: string) => {
    updateData(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doctor Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.selectedDoctor}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('Opening doctor modal, available doctors:', availableDoctors);
                  setShowDoctorModal(true);
                }}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Search size={16} className="mr-1" />
                {t.selectDoctor}
              </button>
              <button
                onClick={handleClearDoctor}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus size={16} className="mr-1" />
                {t.addNewDoctor}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-2">
            Debug: availableDoctors={availableDoctors.length}, loading={loading.toString()}, modal={showDoctorModal.toString()}
          </div>
          {!data.id && !isNewDoctor ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t.noDoctorSelected}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Stethoscope size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.firstName} {data.lastName}
                  </span>
                </div>
                {data.id && (
                  <button
                    onClick={handleClearDoctor}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {data.specialty && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {data.specialty}
                </div>
              )}
              {data.email && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {data.email}
                </div>
              )}
              {data.phone && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {data.phone}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctor Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isNewDoctor ? t.addNewDoctor : t.selectDoctor}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.firstName} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.firstName}
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.lastName} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.lastName}
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.email}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="doctor@email.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.phone}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+212-6-12-345678"
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.specialty}
              </label>
              <div className="relative">
                <select
                  value={data.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t.selectDoctor}</option>
                  {Object.entries(t.specialties).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
                <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.orderNumber}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ORD-001"
                />
                <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Selection Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.selectDoctor}</h3>
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <input
                  type="text"
                  placeholder={t.searchDoctor}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{t.loading}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Total doctors: {availableDoctors.length}, Filtered: {filteredDoctors.length}
                  </div>
                  {filteredDoctors.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noDoctorsFound}</p>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => handleSelectDoctor(doctor)}
                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doctor.specialty}
                            </div>
                            {doctor.email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {doctor.email}
                              </div>
                            )}
                          </div>
                          <Stethoscope size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 