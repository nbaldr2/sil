import React from 'react';
import { User, Phone, Mail, MapPin, Calendar, Hash } from 'lucide-react';

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

interface Step1PatientInfoProps {
  data: PatientInfo;
  updateData: (field: keyof PatientInfo, value: string) => void;
  language: 'fr' | 'en';
}

export default function Step1PatientInfo({ data, updateData, language }: Step1PatientInfoProps) {
  const t = {
    title: language === 'fr' ? 'Informations du Patient' : 'Patient Information',
    subtitle: language === 'fr' ? 'Saisissez les informations personnelles du patient' : 'Enter the patient\'s personal information',
    firstName: language === 'fr' ? 'Prénom' : 'First Name',
    lastName: language === 'fr' ? 'Nom' : 'Last Name',
    dateOfBirth: language === 'fr' ? 'Date de naissance' : 'Date of Birth',
    gender: language === 'fr' ? 'Genre' : 'Gender',
    male: language === 'fr' ? 'Masculin' : 'Male',
    female: language === 'fr' ? 'Féminin' : 'Female',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    email: language === 'fr' ? 'Email' : 'Email',
    cnssNumber: language === 'fr' ? 'Numéro CNSS' : 'CNSS Number',
    address: language === 'fr' ? 'Adresse' : 'Address',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidEmail: language === 'fr' ? 'Email invalide' : 'Invalid email',
    invalidPhone: language === 'fr' ? 'Numéro de téléphone invalide' : 'Invalid phone number'
  };

  const handleInputChange = (field: keyof PatientInfo, value: string) => {
    updateData(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
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
              required
            />
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Last Name */}
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
              required
            />
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.dateOfBirth} *
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.gender}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="M"
                checked={data.gender === 'M'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              {t.male}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="F"
                checked={data.gender === 'F'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              {t.female}
            </label>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.phone} *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+212612345678"
              pattern="[0-9+\-\s]+"
              title={t.invalidPhone}
              required
            />
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Email */}
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
              placeholder="patient@email.com"
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* CNSS Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.cnssNumber}
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.cnssNumber}
              onChange={(e) => handleInputChange('cnssNumber', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CNSS-123456"
            />
            <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.address}
        </label>
        <div className="relative">
          <textarea
            value={data.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123 Rue Example, Ville, Code Postal"
          />
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
} 