import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, Filter, Stethoscope, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../App';

interface Doctor {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  adresse: string;
  numeroOrdre: string;
  dateInscription: string;
  statut: 'actif' | 'inactif';
  notes?: string;
}

export default function DoctorManagement() {
  const { language } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    fr: {
      title: 'Gestion des Médecins',
      subtitle: 'Gestion des médecins référents',
      search: 'Rechercher un médecin...',
      filter: 'Filtrer',
      allSpecialties: 'Toutes les spécialités',
      allStatus: 'Tous les statuts',
      addDoctor: 'Ajouter un médecin',
      editDoctor: 'Modifier le médecin',
      nom: 'Nom',
      prenom: 'Prénom',
      specialite: 'Spécialité',
      email: 'Email',
      telephone: 'Téléphone',
      adresse: 'Adresse',
      numeroOrdre: 'Numéro d\'ordre',
      dateInscription: 'Date d\'inscription',
      statut: 'Statut',
      notes: 'Notes',
      actif: 'Actif',
      inactif: 'Inactif',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      actions: 'Actions',
      totalDoctors: 'Total médecins',
      activeDoctors: 'Médecins actifs',
      specialties: 'Spécialités',
      recentRegistrations: 'Inscriptions récentes',
      success: 'Médecin enregistré avec succès',
      error: 'Erreur lors de l\'enregistrement',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce médecin ?',
      doctorDetails: 'Détails du médecin',
      noDoctors: 'Aucun médecin trouvé',
      addNewDoctor: 'Ajouter un nouveau médecin'
    },
    en: {
      title: 'Doctor Management',
      subtitle: 'Managing referring doctors',
      search: 'Search for a doctor...',
      filter: 'Filter',
      allSpecialties: 'All specialties',
      allStatus: 'All status',
      addDoctor: 'Add doctor',
      editDoctor: 'Edit doctor',
      nom: 'Last Name',
      prenom: 'First Name',
      specialite: 'Specialty',
      email: 'Email',
      telephone: 'Phone',
      adresse: 'Address',
      numeroOrdre: 'License Number',
      dateInscription: 'Registration Date',
      statut: 'Status',
      notes: 'Notes',
      actif: 'Active',
      inactif: 'Inactive',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      actions: 'Actions',
      totalDoctors: 'Total doctors',
      activeDoctors: 'Active doctors',
      specialties: 'Specialties',
      recentRegistrations: 'Recent registrations',
      success: 'Doctor saved successfully',
      error: 'Error saving doctor',
      confirmDelete: 'Are you sure you want to delete this doctor?',
      doctorDetails: 'Doctor details',
      noDoctors: 'No doctors found',
      addNewDoctor: 'Add new doctor'
    }
  }[language];

  const specialties = [
    'Médecine générale',
    'Cardiologie',
    'Endocrinologie',
    'Dermatologie',
    'Gastroentérologie',
    'Neurologie',
    'Pneumologie',
    'Rhumatologie',
    'Urologie',
    'Gynécologie',
    'Pédiatrie',
    'Psychiatrie',
    'Radiologie',
    'Chirurgie générale',
    'Orthopédie'
  ];

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    try {
      const savedDoctors = localStorage.getItem('sil_lab_doctors');
      if (savedDoctors) {
        setDoctors(JSON.parse(savedDoctors));
      } else {
        // Default doctors
        const defaultDoctors: Doctor[] = [
          {
            id: '1',
            nom: 'Boulahcen',
            prenom: 'Hicham',
            specialite: 'Médecine générale',
            email: 'h.boulahcen@medecin.fr',
            telephone: '01.42.34.56.78',
            adresse: '123 Rue de la Santé, 75014 Paris',
            numeroOrdre: '12345678',
            dateInscription: '2020-01-15',
            statut: 'actif',
            notes: 'Médecin généraliste expérimenté'
          },
          {
            id: '2',
            nom: 'Bensaïd',
            prenom: 'Youssef',
            specialite: 'Cardiologie',
            email: 'y.bensaid@cardio.fr',
            telephone: '01.42.34.56.79',
            adresse: '456 Avenue des Médecins, 75016 Paris',
            numeroOrdre: '87654321',
            dateInscription: '2019-03-20',
            statut: 'actif',
            notes: 'Cardiologue spécialisé en échographie'
          },
          {
            id: '3',
            nom: 'Alaoui',
            prenom: 'Fatima',
            specialite: 'Endocrinologie',
            email: 'f.alaoui@endo.fr',
            telephone: '01.42.34.56.80',
            adresse: '789 Boulevard de la Médecine, 75008 Paris',
            numeroOrdre: '11223344',
            dateInscription: '2021-06-10',
            statut: 'actif',
            notes: 'Spécialiste en diabétologie'
          },
          {
            id: '4',
            nom: 'Tazi',
            prenom: 'Mohamed',
            specialite: 'Médecine générale',
            email: 'm.tazi@medecin.fr',
            telephone: '01.42.34.56.81',
            adresse: '321 Rue du Médecin, 75011 Paris',
            numeroOrdre: '55667788',
            dateInscription: '2018-09-05',
            statut: 'actif',
            notes: 'Médecin de famille'
          },
          {
            id: '5',
            nom: 'El Amrani',
            prenom: 'Karim',
            specialite: 'Dermatologie',
            email: 'k.elamrani@dermato.fr',
            telephone: '01.42.34.56.82',
            adresse: '654 Avenue de la Dermatologie, 75006 Paris',
            numeroOrdre: '99887766',
            dateInscription: '2022-01-12',
            statut: 'actif',
            notes: 'Dermatologue esthétique'
          }
        ];
        setDoctors(defaultDoctors);
        localStorage.setItem('sil_lab_doctors', JSON.stringify(defaultDoctors));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setIsLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = `${doctor.prenom} ${doctor.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialite === specialtyFilter;
    const matchesStatus = statusFilter === 'all' || doctor.statut === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleSave = () => {
    try {
      localStorage.setItem('sil_lab_doctors', JSON.stringify(doctors));
      alert(t.success);
    } catch (error) {
      console.error('Save error:', error);
      alert(t.error);
    }
  };

  const handleAddDoctor = () => {
    const newDoctor: Doctor = {
      id: Date.now().toString(),
      nom: '',
      prenom: '',
      specialite: 'Médecine générale',
      email: '',
      telephone: '',
      adresse: '',
      numeroOrdre: '',
      dateInscription: new Date().toISOString().split('T')[0],
      statut: 'actif',
      notes: ''
    };
    setEditingDoctor(newDoctor);
    setShowForm(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const updatedDoctors = doctors.filter(doctor => doctor.id !== id);
      setDoctors(updatedDoctors);
      localStorage.setItem('sil_lab_doctors', JSON.stringify(updatedDoctors));
    }
  };

  const handleSaveDoctor = () => {
    if (editingDoctor && editingDoctor.nom && editingDoctor.prenom) {
      let updatedDoctors;
      if (editingDoctor.id && doctors.find(d => d.id === editingDoctor.id)) {
        // Update existing doctor
        updatedDoctors = doctors.map(doctor => 
          doctor.id === editingDoctor.id ? editingDoctor : doctor
        );
      } else {
        // Add new doctor
        const newDoctor = { ...editingDoctor, id: Date.now().toString() };
        updatedDoctors = [...doctors, newDoctor];
      }
      
      setDoctors(updatedDoctors);
      localStorage.setItem('sil_lab_doctors', JSON.stringify(updatedDoctors));
      setEditingDoctor(null);
      setShowForm(false);
      alert(t.success);
    }
  };

  // Calculate KPIs
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(d => d.statut === 'actif').length;
  const uniqueSpecialties = new Set(doctors.map(d => d.specialite)).size;
  const recentRegistrations = doctors.filter(d => {
    const registrationDate = new Date(d.dateInscription);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return registrationDate > threeMonthsAgo;
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalDoctors}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDoctors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.activeDoctors}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeDoctors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.specialties}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueSpecialties}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.recentRegistrations}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentRegistrations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.allSpecialties}</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.allStatus}</option>
              <option value="actif">{t.actif}</option>
              <option value="inactif">{t.inactif}</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddDoctor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addDoctor}
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.doctorDetails}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.specialite}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.statut}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Dr. {doctor.prenom} {doctor.nom}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t.numeroOrdre}: {doctor.numeroOrdre}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t.dateInscription}: {new Date(doctor.dateInscription).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {doctor.specialite}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center mb-1">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {doctor.email}
                        </div>
                        <div className="flex items-center mb-1">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {doctor.telephone}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 text-gray-400" />
                          {doctor.adresse}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doctor.statut === 'actif'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {doctor.statut === 'actif' ? t.actif : t.inactif}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t.noDoctors}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {showForm && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingDoctor.id && doctors.find(d => d.id === editingDoctor.id) ? t.editDoctor : t.addNewDoctor}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.nom} *
                </label>
                <input
                  type="text"
                  required
                  value={editingDoctor.nom}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, nom: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.prenom} *
                </label>
                <input
                  type="text"
                  required
                  value={editingDoctor.prenom}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, prenom: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.specialite} *
                </label>
                <select
                  value={editingDoctor.specialite}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, specialite: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  required
                  value={editingDoctor.email}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.telephone} *
                </label>
                <input
                  type="tel"
                  required
                  value={editingDoctor.telephone}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, telephone: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.numeroOrdre} *
                </label>
                <input
                  type="text"
                  required
                  value={editingDoctor.numeroOrdre}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, numeroOrdre: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.dateInscription}
                </label>
                <input
                  type="date"
                  value={editingDoctor.dateInscription}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, dateInscription: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.statut}
                </label>
                <select
                  value={editingDoctor.statut}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, statut: e.target.value as 'actif' | 'inactif' } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="actif">{t.actif}</option>
                  <option value="inactif">{t.inactif}</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.adresse}
              </label>
              <input
                type="text"
                value={editingDoctor.adresse}
                onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, adresse: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.notes}
              </label>
              <textarea
                value={editingDoctor.notes || ''}
                onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, notes: e.target.value } : null)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDoctor(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveDoctor}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 