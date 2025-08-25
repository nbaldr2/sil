import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  FileText,
  User,
  Stethoscope,
  Calendar,
  CreditCard,
  Eye,
  Save
} from 'lucide-react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { patientsService, doctorsService, requestsService } from '../services/integrations';
import Step1PatientInfo from './wizard/Step1PatientInfo';
import Step2Analyses from './wizard/Step2Analyses';
import Step3DoctorRef from './wizard/Step3DoctorRef';
import Step4Appointment from './wizard/Step4Appointment';
import Step5Billing from './wizard/Step5Billing';
import Step6ReviewSubmit from './wizard/Step6ReviewSubmit';

interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  cnssNumber: string;
  address: string;
}

interface Analysis {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  tva: number;
  description?: string;
  isActive: boolean;
}

interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  orderNumber: string;
}

interface AppointmentInfo {
  date: string;
  time: string;
  location: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  sampleType: 'BLOOD' | 'URINE' | 'SALIVA' | 'STOOL' | 'SPUTUM' | 'CEREBROSPINAL_FLUID' | 'SYNOVIAL_FLUID' | 'PLEURAL_FLUID' | 'PERITONEAL_FLUID' | 'OTHER';
  tubeType?: 'EDTA' | 'CITRATE' | 'HEPARIN' | 'SERUM' | 'PLAIN' | 'FLUORIDE' | 'OTHER';
  notes: string;
}

interface BillingInfo {
  payer: 'PATIENT' | 'INSURANCE' | 'COMPANY';
  insuranceCompany: string;
  insuranceNumber: string;
  discount: number;
  advancePayment: number;
  notes: string;
}

interface RequestData {
  patient: PatientInfo;
  analyses: Analysis[];
  doctor: DoctorInfo;
  appointment: AppointmentInfo;
  billing: BillingInfo;
  prescription?: File;
}

const steps = [
  { id: 1, title: 'Patient Info', icon: User },
  { id: 2, title: 'Analyses', icon: FileText },
  { id: 3, title: 'Doctor Ref', icon: Stethoscope },
  { id: 4, title: 'Appointment', icon: Calendar },
  { id: 5, title: 'Billing', icon: CreditCard },
  { id: 6, title: 'Review', icon: Eye }
];

export default function NewRequestWizard() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<RequestData>({
    patient: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      phone: '',
      email: '',
      cnssNumber: '',
      address: ''
    },
    analyses: [],
    doctor: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      orderNumber: ''
    },
    appointment: {
      date: '',
      time: '',
      location: '',
      urgency: 'NORMAL',
      sampleType: 'BLOOD',
      tubeType: undefined,
      notes: ''
    },
    billing: {
      payer: 'PATIENT',
      insuranceCompany: '',
      insuranceNumber: '',
      discount: 0,
      advancePayment: 0,
      notes: ''
    }
  });

  const t = {
    title: language === 'fr' ? 'Nouvelle Demande d\'Analyse' : 'New Analysis Request',
    subtitle: language === 'fr' ? 'Créer une nouvelle demande d\'analyse de laboratoire' : 'Create a new laboratory analysis request',
    back: language === 'fr' ? 'Retour' : 'Back',
    next: language === 'fr' ? 'Suivant' : 'Next',
    submit: language === 'fr' ? 'Soumettre' : 'Submit',
    loading: language === 'fr' ? 'Envoi en cours...' : 'Submitting...',
    success: language === 'fr' ? 'Demande créée avec succès' : 'Request created successfully',
    error: language === 'fr' ? 'Erreur lors de la création' : 'Error creating request',
    step: language === 'fr' ? 'Étape' : 'Step',
    of: language === 'fr' ? 'sur' : 'of'
  };

  const updateRequestData = (field: keyof RequestData, value: any) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (section: keyof RequestData, field: string, value: string | number) => {
    setRequestData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Calculate totals
      const subtotal = requestData.analyses.reduce((sum, analysis) => sum + analysis.price, 0);
      const tvaTotal = requestData.analyses.reduce((sum, analysis) => sum + (analysis.price * analysis.tva / 100), 0);
      const totalBeforeDiscount = subtotal + tvaTotal;
      const discountAmount = totalBeforeDiscount * (requestData.billing.discount / 100);
      const totalAfterDiscount = totalBeforeDiscount - discountAmount;
      const amountDue = totalAfterDiscount - requestData.billing.advancePayment;

      // Create or find patient
      let patientId: string;
      if (requestData.patient.cnssNumber) {
        // Try to find existing patient by CNSS number
        try {
          const existingPatientsResponse = await patientsService.getPatients({ cnssNumber: requestData.patient.cnssNumber });
          const existingPatients = existingPatientsResponse.patients || existingPatientsResponse || [];
          if (existingPatients.length > 0) {
            const existing = existingPatients[0];
            patientId = existing.id;
            // If details differ, update patient to match entered data
            const needsUpdate = (
              existing.firstName !== requestData.patient.firstName ||
              existing.lastName !== requestData.patient.lastName ||
              (existing.gender || '') !== requestData.patient.gender ||
              (existing.phone || '') !== requestData.patient.phone ||
              (existing.email || '') !== requestData.patient.email ||
              (existing.address || '') !== requestData.patient.address ||
              (existing.dateOfBirth ? existing.dateOfBirth.slice(0,10) : '') !== requestData.patient.dateOfBirth
            );
            if (needsUpdate) {
              try {
                // Format phone number - remove any non-digit characters except +
                const formattedPhone = requestData.patient.phone.replace(/[^\d+]/g, '');
                
                await patientsService.updatePatient(existing.id, {
                  firstName: requestData.patient.firstName,
                  lastName: requestData.patient.lastName,
                  dateOfBirth: new Date(requestData.patient.dateOfBirth).toISOString(),
                  gender: requestData.patient.gender,
                  phone: formattedPhone,
                  email: requestData.patient.email || null,
                  cnssNumber: requestData.patient.cnssNumber,
                  address: requestData.patient.address
                });
              } catch (e) {
                console.warn('Patient update failed, proceeding with existing data');
              }
            }
          } else {
            // Format phone number - remove any non-digit characters except +
            const formattedPhone = requestData.patient.phone.replace(/[^\d+]/g, '');
            
            // Create new patient
            const newPatient = await patientsService.createPatient({
              firstName: requestData.patient.firstName,
              lastName: requestData.patient.lastName,
              dateOfBirth: new Date(requestData.patient.dateOfBirth).toISOString(),
              gender: requestData.patient.gender,
              phone: formattedPhone,
              email: requestData.patient.email || null,
              cnssNumber: requestData.patient.cnssNumber,
              address: requestData.patient.address
            });
            patientId = newPatient.id;
          }
        } catch (error) {
          // Format phone number - remove any non-digit characters except +
          const formattedPhone = requestData.patient.phone.replace(/[^\d+]/g, '');
          
          // Create new patient if search fails
          const newPatient = await patientsService.createPatient({
            firstName: requestData.patient.firstName,
            lastName: requestData.patient.lastName,
            dateOfBirth: new Date(requestData.patient.dateOfBirth).toISOString(),
            gender: requestData.patient.gender,
            phone: formattedPhone,
            email: requestData.patient.email || null,
            cnssNumber: requestData.patient.cnssNumber,
            address: requestData.patient.address
          });
          patientId = newPatient.id;
        }
      } else {
        // Format phone number - remove any non-digit characters except +
        const formattedPhone = requestData.patient.phone.replace(/[^\d+]/g, '');
        
        // Create new patient without CNSS
        const newPatient = await patientsService.createPatient({
          firstName: requestData.patient.firstName,
          lastName: requestData.patient.lastName,
          dateOfBirth: new Date(requestData.patient.dateOfBirth).toISOString(),
          gender: requestData.patient.gender,
          phone: formattedPhone,
          email: requestData.patient.email || null,
          address: requestData.patient.address
        });
        patientId = newPatient.id;
      }

      // Prepare analyses data
      const analyses = requestData.analyses.map(analysis => {
        // Calculate price including TVA
        const priceWithTVA = analysis.price + (analysis.price * analysis.tva / 100);
        
        return {
          analysisId: analysis.id,
          price: priceWithTVA
        };
      });

      // Create request
      // Format the date properly - ensure it's a valid ISO string
      let appointmentDate;
      try {
        // Make sure we have a valid date
        if (requestData.appointment.date) {
          appointmentDate = new Date(requestData.appointment.date);
          // Check if it's a valid date
          if (isNaN(appointmentDate.getTime())) {
            throw new Error('Invalid date');
          }
          appointmentDate = appointmentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        } else {
          appointmentDate = new Date().toISOString().split('T')[0]; // Default to today
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        appointmentDate = new Date().toISOString().split('T')[0]; // Default to today
      }
      
      const requestPayload = {
        patientId,
        doctorId: requestData.doctor.id || undefined,
        appointmentDate: appointmentDate,
        appointmentTime: requestData.appointment.time || '09:00',
        sampleType: requestData.appointment.sampleType,
        tubeType: requestData.appointment.tubeType,
        urgent: requestData.appointment.urgency === 'URGENT' || requestData.appointment.urgency === 'EMERGENCY',
        discount: requestData.billing.discount || 0,
        advancePayment: requestData.billing.advancePayment || 0,
        notes: (requestData.appointment.notes || '') + (requestData.billing.notes ? `\nBilling: ${requestData.billing.notes}` : ''),
        analyses
      };

      const newRequest = await requestsService.createRequest(requestPayload);

      alert(language === 'fr' ? 'Demande créée avec succès!' : 'Request created successfully!');

      // Trigger printing options
      try {
        const shouldPrintReceipt = window.confirm(language === 'fr' ? 'Imprimer le reçu patient ?' : 'Print patient receipt?');
        if (shouldPrintReceipt) {
          const { printReceipt } = await import('../utils/printing');
          printReceipt(newRequest, { amountPaid: requestData.billing.advancePayment, paymentMethod: requestData.billing.payer });
        }
        const shouldPrintWorklist = window.confirm(language === 'fr' ? 'Imprimer la fiche de prélèvement ?' : 'Print collection sheet?');
        if (shouldPrintWorklist) {
          const { printCollectionSheet } = await import('../utils/printing');
          printCollectionSheet(newRequest);
        }
        const shouldPrintLabels = window.confirm(language === 'fr' ? 'Imprimer les étiquettes des tubes ?' : 'Print tube labels?');
        if (shouldPrintLabels) {
          const { printTubeLabels } = await import('../utils/printing');
          printTubeLabels(newRequest);
        }
        const shouldPrintRouting = window.confirm(language === 'fr' ? 'Imprimer le bordereau de routage interne ?' : 'Print internal routing slip?');
        if (shouldPrintRouting) {
          const { printRoutingSlip } = await import('../utils/printing');
          printRoutingSlip(newRequest);
        }
      } catch (e) {
        console.warn('Printing flow error', e);
      }

      navigate('/requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      
      // Show more detailed error message
      let errorMessage = language === 'fr' ? 'Erreur lors de la création de la demande' : 'Error creating request';
      
      if (error instanceof Error) {
        if (error.message.includes('Validation')) {
          errorMessage += language === 'fr' 
            ? ': Validation échouée. Veuillez vérifier les informations du patient (téléphone, email, etc.)' 
            : ': Validation failed. Please check patient information (phone, email, etc.)';
        } else if (error.message.includes('Internal server error')) {
          // Extract the detailed error message if available
          const detailStart = error.message.indexOf(':');
          if (detailStart > -1) {
            const detailMessage = error.message.substring(detailStart + 1).trim();
            errorMessage += language === 'fr'
              ? `: Erreur serveur - ${detailMessage}`
              : `: Server error - ${detailMessage}`;
          } else {
            errorMessage += `: ${error.message}`;
          }
        } else {
          errorMessage += `: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PatientInfo
            data={requestData.patient}
                         updateData={(field: keyof PatientInfo, value: string) => updateNestedData('patient', field, value)}
            language={language}
          />
        );
      case 2:
        return (
          <Step2Analyses
            data={requestData.analyses}
            prescription={requestData.prescription}
                         updateData={(analyses: Analysis[]) => updateRequestData('analyses', analyses)}
             updatePrescription={(file: File | undefined) => updateRequestData('prescription', file)}
            language={language}
          />
        );
      case 3:
        return (
          <Step3DoctorRef
            data={requestData.doctor}
                         updateData={(field: keyof DoctorInfo, value: string) => updateNestedData('doctor', field, value)}
            language={language}
          />
        );
      case 4:
        return (
          <Step4Appointment
            data={requestData.appointment}
                         updateData={(field: keyof AppointmentInfo, value: string) => updateNestedData('appointment', field, value)}
            language={language}
          />
        );
      case 5:
        return (
          <Step5Billing
            data={requestData.billing}
            analyses={requestData.analyses}
            updateData={(field: keyof BillingInfo, value: string | number) => updateNestedData('billing', field, value)}
            language={language}
          />
        );
      case 6:
        return (
          <Step6ReviewSubmit
            data={requestData}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return requestData.patient.firstName && 
               requestData.patient.lastName && 
               requestData.patient.dateOfBirth && 
               requestData.patient.phone;
      case 2:
        return requestData.analyses.length > 0;
      case 3:
        return requestData.doctor.id || 
               (requestData.doctor.firstName && requestData.doctor.lastName);
      case 4:
        return requestData.appointment.date && 
               requestData.appointment.time;
      case 5:
        return true; // Billing is optional
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/requests')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                {t.back}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t.step} {currentStep} {t.of} {steps.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with steps */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {language === 'fr' ? 'Progression' : 'Progress'}
              </h3>
              <nav className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full mr-3">
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        isActive
                          ? 'text-blue-900 dark:text-blue-100'
                          : isCompleted
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Step content */}
              <div className="p-6">
                {renderStep()}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  {t.back}
                </button>

                <div className="flex items-center space-x-3">
                  {currentStep < steps.length ? (
                    <button
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.next}
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!isStepValid() || loading}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.loading}
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          {t.submit}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 