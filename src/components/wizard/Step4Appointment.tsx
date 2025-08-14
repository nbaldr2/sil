import React from 'react';
import { Calendar, Clock, MapPin, AlertTriangle, FileText } from 'lucide-react';

interface AppointmentInfo {
  date: string;
  time: string;
  location: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  sampleType: 'BLOOD' | 'URINE' | 'SALIVA' | 'STOOL' | 'SPUTUM' | 'CEREBROSPINAL_FLUID' | 'SYNOVIAL_FLUID' | 'PLEURAL_FLUID' | 'PERITONEAL_FLUID' | 'OTHER';
  tubeType?: 'EDTA' | 'CITRATE' | 'HEPARIN' | 'SERUM' | 'PLAIN' | 'FLUORIDE' | 'OTHER';
  notes: string;
}

interface Step4AppointmentProps {
  data: AppointmentInfo;
  updateData: (field: keyof AppointmentInfo, value: string) => void;
  language: 'fr' | 'en';
}

export default function Step4Appointment({ data, updateData, language }: Step4AppointmentProps) {
  const t = {
    title: language === 'fr' ? 'Rendez-vous' : 'Appointment',
    subtitle: language === 'fr' ? 'Planifiez le rendez-vous pour la collecte d\'échantillons' : 'Schedule the appointment for sample collection',
    date: language === 'fr' ? 'Date' : 'Date',
    time: language === 'fr' ? 'Heure' : 'Time',
    location: language === 'fr' ? 'Lieu' : 'Location',
    urgency: language === 'fr' ? 'Urgence' : 'Urgency',
    sampleType: language === 'fr' ? 'Type d\'échantillon' : 'Sample Type',
    tubeType: language === 'fr' ? 'Type de tube' : 'Tube Type',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    normal: language === 'fr' ? 'Normal' : 'Normal',
    urgent: language === 'fr' ? 'Urgent' : 'Urgent',
    emergency: language === 'fr' ? 'Urgence' : 'Emergency',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    selectDate: language === 'fr' ? 'Sélectionner une date' : 'Select a date',
    selectTime: language === 'fr' ? 'Sélectionner une heure' : 'Select a time',
    enterLocation: language === 'fr' ? 'Entrer le lieu' : 'Enter location',
    addNotes: language === 'fr' ? 'Ajouter des notes' : 'Add notes',
    urgencyLevels: {
      normal: language === 'fr' ? 'Résultats dans 24-48h' : 'Results in 24-48h',
      urgent: language === 'fr' ? 'Résultats dans 2-4h' : 'Results in 2-4h',
      emergency: language === 'fr' ? 'Résultats immédiats' : 'Immediate results'
    }
  };

  const handleInputChange = (field: keyof AppointmentInfo, value: string) => {
    updateData(field, value);
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'NORMAL':
        return <Calendar size={16} />;
      case 'URGENT':
        return <Clock size={16} />;
      case 'EMERGENCY':
        return <AlertTriangle size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.date} *
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.time} *
          </label>
          <div className="relative">
            <input
              type="time"
              value={data.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.location}
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Laboratoire principal"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.urgency}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="urgency"
                value="NORMAL"
                checked={data.urgency === 'NORMAL'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center">
                <span className="mr-2">{t.normal}</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor('NORMAL')}`}>
                  {getUrgencyIcon('NORMAL')}
                </span>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="urgency"
                value="URGENT"
                checked={data.urgency === 'URGENT'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center">
                <span className="mr-2">{t.urgent}</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor('URGENT')}`}>
                  {getUrgencyIcon('URGENT')}
                </span>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="urgency"
                value="EMERGENCY"
                checked={data.urgency === 'EMERGENCY'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center">
                <span className="mr-2">{t.emergency}</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor('EMERGENCY')}`}>
                  {getUrgencyIcon('EMERGENCY')}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Sample Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.sampleType} *
        </label>
        <select
          value={data.sampleType}
          onChange={(e) => handleInputChange('sampleType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="BLOOD">{language === 'fr' ? 'Sang' : 'Blood'}</option>
          <option value="URINE">{language === 'fr' ? 'Urine' : 'Urine'}</option>
          <option value="SALIVA">{language === 'fr' ? 'Salive' : 'Saliva'}</option>
          <option value="STOOL">{language === 'fr' ? 'Selles' : 'Stool'}</option>
          <option value="SPUTUM">{language === 'fr' ? 'Expectoration' : 'Sputum'}</option>
          <option value="CEREBROSPINAL_FLUID">{language === 'fr' ? 'Liquide céphalo-rachidien' : 'Cerebrospinal Fluid'}</option>
          <option value="SYNOVIAL_FLUID">{language === 'fr' ? 'Liquide synovial' : 'Synovial Fluid'}</option>
          <option value="PLEURAL_FLUID">{language === 'fr' ? 'Liquide pleural' : 'Pleural Fluid'}</option>
          <option value="PERITONEAL_FLUID">{language === 'fr' ? 'Liquide péritonéal' : 'Peritoneal Fluid'}</option>
          <option value="OTHER">{language === 'fr' ? 'Autre' : 'Other'}</option>
        </select>
      </div>

      {/* Tube Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.tubeType}
        </label>
        <select
          value={data.tubeType || ''}
          onChange={(e) => handleInputChange('tubeType', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{language === 'fr' ? 'Sélectionner un type de tube' : 'Select tube type'}</option>
          <option value="EDTA">EDTA</option>
          <option value="CITRATE">Citrate</option>
          <option value="HEPARIN">Héparine</option>
          <option value="SERUM">Sérum</option>
          <option value="PLAIN">Tube sec</option>
          <option value="FLUORIDE">Fluorure</option>
          <option value="OTHER">{language === 'fr' ? 'Autre' : 'Other'}</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.notes}
        </label>
        <div className="relative">
          <textarea
            value={data.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Instructions spéciales, allergies, etc."
          />
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Urgency Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {t.urgency} - {t.urgencyLevels[data.urgency.toLowerCase() as keyof typeof t.urgencyLevels]}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {data.urgency === 'NORMAL' && (language === 'fr' ? 
                'Les résultats seront disponibles dans les 24-48 heures suivant la collecte.' :
                'Results will be available within 24-48 hours after collection.'
              )}
              {data.urgency === 'URGENT' && (language === 'fr' ? 
                'Les résultats seront disponibles dans les 2-4 heures suivant la collecte.' :
                'Results will be available within 2-4 hours after collection.'
              )}
              {data.urgency === 'EMERGENCY' && (language === 'fr' ? 
                'Les résultats seront disponibles immédiatement après la collecte.' :
                'Results will be available immediately after collection.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 