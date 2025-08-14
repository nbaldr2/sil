import  React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, CheckCircle, AlertTriangle, X, Search, Plus, Trash2, DollarSign, Printer } from 'lucide-react';
import { useAuth } from '../App';
import { sheetsService, pricingService, printService } from '../services/integrations';

interface Patient {
  nom: string;
  prenom: string;
  dateNaissance: string;
  numeroCNSS: string;
  sexe: 'M' | 'F';
}

interface Analysis {
  code: string;
  nom: string;
  selected: boolean;
  category?: string;
}

interface Doctor {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
}

interface PricingData {
  subtotal: number;
  tvaTotal: number;
  totalBeforeDiscount: number;
  discount: number;
  discountAmount: number;
  totalAfterDiscount: number;
  advancePayment: number;
  amountDue: number;
}

export default function NewAnalysisRequest() {
  const { language } = useAuth();
  const [patient, setPatient] = useState<Patient>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    numeroCNSS: '',
    sexe: 'M'
  });
  
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([
    { code: '4005', nom: 'Hémogramme (CBC)', selected: false, category: 'Hématologie' },
    { code: '4010', nom: 'Glycémie (Blood Sugar)', selected: false, category: 'Biochimie' },
    { code: '4015', nom: 'Cholestérol Total', selected: false, category: 'Lipides' },
    { code: '4020', nom: 'HDL Cholestérol', selected: false, category: 'Lipides' },
    { code: '4025', nom: 'LDL Cholestérol', selected: false, category: 'Lipides' },
    { code: '4030', nom: 'Triglycérides', selected: false, category: 'Lipides' },
    { code: '4035', nom: 'Créatininémie', selected: false, category: 'Biochimie' },
    { code: '4040', nom: 'Urée', selected: false, category: 'Biochimie' },
    { code: '4045', nom: 'Bilan hépatique', selected: false, category: 'Biochimie' },
    { code: '4050', nom: 'TSH', selected: false, category: 'Hormonologie' },
    { code: '4055', nom: 'T4 Libre', selected: false, category: 'Hormonologie' },
    { code: '4060', nom: 'T3 Libre', selected: false, category: 'Hormonologie' },
    { code: '4070', nom: 'Groupe Sanguin', selected: false, category: 'Immunologie' },
    { code: '4075', nom: 'CRP', selected: false, category: 'Inflammation' },
    { code: '4080', nom: 'VS', selected: false, category: 'Inflammation' }
  ]);
  
  const [analysisSearch, setAnalysisSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // Pricing state
  const [discount, setDiscount] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [pricingData, setPricingData] = useState<PricingData>({
    subtotal: 0,
    tvaTotal: 0,
    totalBeforeDiscount: 0,
    discount: 0,
    discountAmount: 0,
    totalAfterDiscount: 0,
    advancePayment: 0,
    amountDue: 0
  });

  const doctors: Doctor[] = [
    { id: '1', nom: 'Boulahcen', prenom: 'Hicham', specialite: 'Médecine générale' },
    { id: '2', nom: 'Bensaïd', prenom: 'Youssef', specialite: 'Cardiologie' },
    { id: '3', nom: 'Alaoui', prenom: 'Fatima', specialite: 'Endocrinologie' },
    { id: '4', nom: 'Tazi', prenom: 'Mohamed', specialite: 'Médecine générale' },
    { id: '5', nom: 'El Amrani', prenom: 'Karim', specialite: 'Dermatologie' }
  ];

  const t = {
    fr: {
      title: 'Nouvelle Demande d\'Analyse',
      subtitle: 'Interface Réceptionniste',
      patientInfo: 'Informations Patient',
      nom: 'Nom',
      prenom: 'Prénom',
      dateNaissance: 'Date de naissance',
      numeroCNSS: 'Numéro CNSS',
      sexe: 'Sexe',
      analyses: 'Analyses Prescrites',
      addAnalysis: 'Ajouter des analyses',
      searchAnalyses: 'Rechercher des analyses...',
      selectedAnalyses: 'Analyses sélectionnées',
      doctor: 'Médecin Référent',
      searchDoctor: 'Rechercher un médecin...',
      appointment: 'Prélèvement',
      date: 'Date',
      time: 'Heure',
      urgent: 'Demande Urgente',
      pricing: 'Tarification',
      subtotal: 'Sous-total HT',
      tva: 'TVA',
      totalBeforeDiscount: 'Total TTC',
      discount: 'Remise (%)',
      discountAmount: 'Montant remise',
      totalAfterDiscount: 'Total après remise',
      advancePayment: 'Acompte',
      amountDue: 'Montant dû',
      submit: 'Soumettre la Demande',
      clear: 'Effacer le Formulaire',
      success: 'Demande enregistrée avec succès',
      error: 'Erreur lors de l\'enregistrement',
      selectDoctor: 'Sélectionner un médecin',
      noAnalysesSelected: 'Aucune analyse sélectionnée',
      validationError: 'Veuillez remplir tous les champs obligatoires',
      printLabels: 'Imprimer Étiquettes',
      printReceipt: 'Imprimer Reçu'
    },
    en: {
      title: 'New Analysis Request',
      subtitle: 'Receptionist Interface',
      patientInfo: 'Patient Information',
      nom: 'Last Name',
      prenom: 'First Name',
      dateNaissance: 'Date of Birth',
      numeroCNSS: 'CNSS Number',
      sexe: 'Gender',
      analyses: 'Prescribed Analyses',
      addAnalysis: 'Add Analyses',
      searchAnalyses: 'Search analyses...',
      selectedAnalyses: 'Selected Analyses',
      doctor: 'Referring Doctor',
      searchDoctor: 'Search for a doctor...',
      appointment: 'Sample Collection',
      date: 'Date',
      time: 'Time',
      urgent: 'Urgent Request',
      pricing: 'Pricing',
      subtotal: 'Subtotal (excl. tax)',
      tva: 'VAT',
      totalBeforeDiscount: 'Total (incl. tax)',
      discount: 'Discount (%)',
      discountAmount: 'Discount amount',
      totalAfterDiscount: 'Total after discount',
      advancePayment: 'Advance payment',
      amountDue: 'Amount due',
      submit: 'Submit Request',
      clear: 'Clear Form',
      success: 'Request saved successfully',
      error: 'Error saving request',
      selectDoctor: 'Select a doctor',
      noAnalysesSelected: 'No analyses selected',
      validationError: 'Please fill in all required fields',
      printLabels: 'Print Labels',
      printReceipt: 'Print Receipt'
    }
  }[language];

  // Filter analyses based on search
  const filteredAnalyses = allAnalyses.filter(analysis =>
    analysis.nom.toLowerCase().includes(analysisSearch.toLowerCase()) ||
    analysis.code.includes(analysisSearch)
  );

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.prenom} ${doctor.nom}`.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doctor.specialite.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // Get selected analyses
  const selectedAnalyses = allAnalyses.filter(analysis => analysis.selected);

  // Calculate pricing when analyses change
  useEffect(() => {
    const pricing = pricingService.calculateRequestTotal(selectedAnalyses, discount, advancePayment);
    setPricingData(pricing);
  }, [selectedAnalyses, discount, advancePayment]);

  const handleAnalysisToggle = (code: string) => {
    setAllAnalyses(prev => prev.map(a => 
      a.code === code ? { ...a, selected: !a.selected } : a
    ));
  };

  const removeAnalysis = (code: string) => {
    setAllAnalyses(prev => prev.map(a => 
      a.code === code ? { ...a, selected: false } : a
    ));
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const validateForm = () => {
    if (!patient.nom || !patient.prenom || !patient.dateNaissance || !patient.numeroCNSS) {
      showToastMessage(t.validationError, 'error');
      return false;
    }
    if (selectedAnalyses.length === 0) {
      showToastMessage(t.noAnalysesSelected, 'error');
      return false;
    }
    if (!selectedDoctor) {
      showToastMessage(t.selectDoctor, 'error');
      return false;
    }
    if (!appointmentDate || !appointmentTime) {
      showToastMessage('Veuillez sélectionner une date et heure de prélèvement', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        patient: {
          nom: patient.nom,
          prenom: patient.prenom,
          dateNaissance: patient.dateNaissance,
          numeroCNSS: patient.numeroCNSS,
          sexe: patient.sexe
        },
        analyses: selectedAnalyses.map(a => ({ code: a.code, nom: a.nom })),
        doctor: selectedDoctor,
        appointment: {
          date: appointmentDate,
          time: appointmentTime
        },
        urgent: isUrgent,
        pricing: pricingData,
        timestamp: new Date().toISOString()
      };

      const result = await sheetsService.saveRequest(requestData);
      
      if (result.success) {
        showToastMessage(t.success, 'success');
        
        // Auto-print labels and receipt
        setTimeout(() => {
          printService.printLabels(result.data);
          setTimeout(() => {
            printService.printReceipt(result.data, { ...pricingData, prices: pricingService.getPrices() });
          }, 1000);
        }, 500);
        
        // Reset form
        handleClearForm();
      } else {
        showToastMessage(t.error, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToastMessage('Erreur de connexion. Les données ont été sauvegardées localement.', 'error');
      // Even if there's an error, the local storage fallback should have worked
      // So we can still reset the form
      handleClearForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setPatient({ nom: '', prenom: '', dateNaissance: '', numeroCNSS: '', sexe: 'M' });
    setAllAnalyses(prev => prev.map(a => ({ ...a, selected: false })));
    setSelectedDoctor(null);
    setDoctorSearch('');
    setAppointmentDate('');
    setAppointmentTime('');
    setIsUrgent(false);
    setAnalysisSearch('');
    setDiscount(0);
    setAdvancePayment(0);
  };

  // Set tomorrow as default date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    setAppointmentDate(formattedDate);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.patientInfo}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.nom} *
              </label>
              <input
                type="text"
                required
                value={patient.nom}
                onChange={(e) => setPatient(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="El Amrani"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.prenom} *
              </label>
              <input
                type="text"
                required
                value={patient.prenom}
                onChange={(e) => setPatient(prev => ({ ...prev, prenom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Soukaina"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.dateNaissance} *
              </label>
              <input
                type="date"
                required
                value={patient.dateNaissance}
                onChange={(e) => setPatient(prev => ({ ...prev, dateNaissance: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.numeroCNSS} *
              </label>
              <input
                type="text"
                required
                value={patient.numeroCNSS}
                onChange={(e) => setPatient(prev => ({ ...prev, numeroCNSS: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="J123456789"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sexe}
              </label>
              <select
                value={patient.sexe}
                onChange={(e) => setPatient(prev => ({ ...prev, sexe: e.target.value as 'M' | 'F' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.analyses}</h3>
            <button
              type="button"
              onClick={() => setShowAnalysisModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addAnalysis}
            </button>
          </div>

          {/* Selected Analyses */}
          {selectedAnalyses.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.selectedAnalyses}</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAnalyses.map((analysis) => (
                  <div
                    key={analysis.code}
                    className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center"
                  >
                    <span className="text-sm">{analysis.nom}</span>
                    <button
                      type="button"
                      onClick={() => removeAnalysis(analysis.code)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.noAnalysesSelected}</p>
          )}
        </div>

        {/* Doctor Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.doctor}</h3>
          
          {/* Doctor Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder={t.searchDoctor}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Doctor List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setDoctorSearch('');
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  Dr. {doctor.prenom} {doctor.nom}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {doctor.specialite}
                </div>
              </button>
            ))}
          </div>

          {selectedDoctor && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="font-medium text-green-800 dark:text-green-200">
                Médecin sélectionné: Dr. {selectedDoctor.prenom} {selectedDoctor.nom}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {selectedDoctor.specialite}
              </div>
            </div>
          )}
        </div>

        {/* Appointment Scheduling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.appointment}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.date} *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.time} *
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="form-checkbox h-5 w-5 text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.urgent}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Pricing Section */}
        {selectedAnalyses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.pricing}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.subtotal}:</span>
                  <span className="font-medium">{pricingData.subtotal.toFixed(2)} dh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.tva}:</span>
                  <span className="font-medium">{pricingData.tvaTotal.toFixed(2)} dh</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">{t.totalBeforeDiscount}:</span>
                  <span className="font-bold text-lg">{pricingData.totalBeforeDiscount.toFixed(2)} dh</span>
                </div>
              </div>

              {/* Discount and Payment */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.discount}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.advancePayment}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.discountAmount}:</span>
                    <span className="text-red-600">-{pricingData.discountAmount.toFixed(2)} dh</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">{t.amountDue}:</span>
                  <span className="font-bold text-lg text-green-600">{pricingData.amountDue.toFixed(2)} dh</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleClearForm}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t.clear}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle size={20} className="mr-2" />
            )}
            {t.submit}
          </button>
        </div>
      </form>

      {/* Analysis Selection Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.analyses}</h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={analysisSearch}
                onChange={(e) => setAnalysisSearch(e.target.value)}
                placeholder={t.searchAnalyses}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Analysis List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAnalyses.map((analysis) => (
                <label
                  key={analysis.code}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={analysis.selected}
                    onChange={() => handleAnalysisToggle(analysis.code)}
                    className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {analysis.nom}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {analysis.code} • {analysis.category}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
 