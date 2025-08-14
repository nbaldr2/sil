import React from 'react';
import { User, FileText, Stethoscope, Calendar, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

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

interface Step6ReviewSubmitProps {
  data: RequestData;
  language: 'fr' | 'en';
}

export default function Step6ReviewSubmit({ data, language }: Step6ReviewSubmitProps) {
  const t = {
    title: language === 'fr' ? 'Révision et Soumission' : 'Review and Submit',
    subtitle: language === 'fr' ? 'Vérifiez toutes les informations avant de soumettre la demande' : 'Review all information before submitting the request',
    patientInfo: language === 'fr' ? 'Informations du Patient' : 'Patient Information',
    analyses: language === 'fr' ? 'Analyses' : 'Analyses',
    doctorInfo: language === 'fr' ? 'Informations du Médecin' : 'Doctor Information',
    appointment: language === 'fr' ? 'Rendez-vous' : 'Appointment',
    billing: language === 'fr' ? 'Facturation' : 'Billing',
    prescription: language === 'fr' ? 'Ordonnance' : 'Prescription',
    name: language === 'fr' ? 'Nom' : 'Name',
    dateOfBirth: language === 'fr' ? 'Date de naissance' : 'Date of Birth',
    gender: language === 'fr' ? 'Genre' : 'Gender',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    email: language === 'fr' ? 'Email' : 'Email',
    cnssNumber: language === 'fr' ? 'Numéro CNSS' : 'CNSS Number',
    address: language === 'fr' ? 'Adresse' : 'Address',
    specialty: language === 'fr' ? 'Spécialité' : 'Specialty',
    orderNumber: language === 'fr' ? 'Numéro d\'ordre' : 'Order Number',
    date: language === 'fr' ? 'Date' : 'Date',
    time: language === 'fr' ? 'Heure' : 'Time',
    location: language === 'fr' ? 'Lieu' : 'Location',
    urgency: language === 'fr' ? 'Urgence' : 'Urgency',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    payer: language === 'fr' ? 'Payeur' : 'Payer',
    insuranceCompany: language === 'fr' ? 'Compagnie d\'assurance' : 'Insurance Company',
    insuranceNumber: language === 'fr' ? 'Numéro d\'assurance' : 'Insurance Number',
    discount: language === 'fr' ? 'Remise' : 'Discount',
    advancePayment: language === 'fr' ? 'Acompte' : 'Advance Payment',
    subtotal: language === 'fr' ? 'Sous-total' : 'Subtotal',
    tva: language === 'fr' ? 'TVA' : 'VAT',
    total: language === 'fr' ? 'Total' : 'Total',
    amountDue: language === 'fr' ? 'Montant dû' : 'Amount due',
    uploaded: language === 'fr' ? 'Téléchargé' : 'Uploaded',
    notUploaded: language === 'fr' ? 'Non téléchargé' : 'Not uploaded',
    male: language === 'fr' ? 'Masculin' : 'Male',
    female: language === 'fr' ? 'Féminin' : 'Female',
    normal: language === 'fr' ? 'Normal' : 'Normal',
    urgent: language === 'fr' ? 'Urgent' : 'Urgent',
    emergency: language === 'fr' ? 'Urgence' : 'Emergency',
    patient: language === 'fr' ? 'Patient' : 'Patient',
    insurance: language === 'fr' ? 'Assurance' : 'Insurance',
    company: language === 'fr' ? 'Entreprise' : 'Company',
    noData: language === 'fr' ? 'Aucune donnée' : 'No data',
    readyToSubmit: language === 'fr' ? 'Prêt à soumettre' : 'Ready to submit',
    reviewComplete: language === 'fr' ? 'Révision terminée' : 'Review complete'
  };

  // Calculate totals
  const subtotal = data.analyses.reduce((sum, analysis) => sum + analysis.price, 0);
  const tvaTotal = data.analyses.reduce((sum, analysis) => sum + (analysis.price * analysis.tva / 100), 0);
  const totalBeforeDiscount = subtotal + tvaTotal;
  const discountAmount = totalBeforeDiscount * (data.billing.discount / 100);
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;
  const amountDue = totalAfterDiscount - data.billing.advancePayment;

  const formatDate = (dateString: string) => {
    if (!dateString) return t.noData;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'NORMAL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'URGENT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <User size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.patientInfo}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.patient.firstName} {data.patient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.dateOfBirth}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(data.patient.dateOfBirth)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.gender}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.patient.gender === 'M' ? t.male : t.female}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.phone}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.patient.phone}</span>
            </div>
            {data.patient.email && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.email}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.patient.email}</span>
              </div>
            )}
            {data.patient.cnssNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.cnssNumber}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.patient.cnssNumber}</span>
              </div>
            )}
            {data.patient.address && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.address}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.patient.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Stethoscope size={20} className="text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.doctorInfo}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.doctor.firstName} {data.doctor.lastName}
              </span>
            </div>
            {data.doctor.specialty && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.specialty}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.doctor.specialty}</span>
              </div>
            )}
            {data.doctor.email && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.email}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.doctor.email}</span>
              </div>
            )}
            {data.doctor.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.phone}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.doctor.phone}</span>
              </div>
            )}
            {data.doctor.orderNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.orderNumber}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.doctor.orderNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Calendar size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.appointment}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.date}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(data.appointment.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.time}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.appointment.time}</span>
            </div>
            {data.appointment.location && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.location}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.appointment.location}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.urgency}:</span>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(data.appointment.urgency)}`}>
                {data.appointment.urgency === 'NORMAL' && t.normal}
                {data.appointment.urgency === 'URGENT' && t.urgent}
                {data.appointment.urgency === 'EMERGENCY' && t.emergency}
              </span>
            </div>
            {data.appointment.notes && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.notes}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.appointment.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <CreditCard size={20} className="text-orange-600 dark:text-orange-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.billing}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.payer}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.billing.payer === 'PATIENT' && t.patient}
                {data.billing.payer === 'INSURANCE' && t.insurance}
                {data.billing.payer === 'COMPANY' && t.company}
              </span>
            </div>
            {data.billing.payer === 'INSURANCE' && data.billing.insuranceCompany && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.insuranceCompany}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.billing.insuranceCompany}</span>
              </div>
            )}
            {data.billing.payer === 'INSURANCE' && data.billing.insuranceNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.insuranceNumber}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.billing.insuranceNumber}</span>
              </div>
            )}
            {data.billing.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.discount}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.billing.discount}%</span>
              </div>
            )}
            {data.billing.advancePayment > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.advancePayment}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.billing.advancePayment} dh</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.amountDue}:</span>
                <span className={`font-bold ${amountDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {amountDue.toFixed(2)} dh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyses Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <FileText size={20} className="text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.analyses}</h3>
        </div>
        <div className="space-y-3">
          {data.analyses.map((analysis) => (
            <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{analysis.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {analysis.code} • {analysis.category}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{analysis.price} dh</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">TVA: {analysis.tva}%</div>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.subtotal}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{subtotal.toFixed(2)} dh</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.tva}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{tvaTotal.toFixed(2)} dh</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-900 dark:text-white">{t.total}:</span>
              <span className="text-gray-900 dark:text-white">{totalBeforeDiscount.toFixed(2)} dh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <FileText size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.prescription}</h3>
        </div>
        <div className="flex items-center">
          {data.prescription ? (
            <>
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-600 dark:text-green-400 font-medium">{t.uploaded}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">({data.prescription.name})</span>
            </>
          ) : (
            <>
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{t.notUploaded}</span>
            </>
          )}
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircle size={24} className="text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100">{t.readyToSubmit}</h4>
            <p className="text-sm text-green-700 dark:text-green-300">{t.reviewComplete}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 