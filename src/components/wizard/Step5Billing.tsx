import React from 'react';
import { CreditCard, Building, Percent, DollarSign, FileText } from 'lucide-react';

interface Analysis {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  tva: number;
}

interface BillingInfo {
  payer: 'PATIENT' | 'INSURANCE' | 'COMPANY';
  insuranceCompany: string;
  insuranceNumber: string;
  discount: number;
  advancePayment: number;
  notes: string;
}

interface Step5BillingProps {
  data: BillingInfo;
  analyses: Analysis[];
  updateData: (field: keyof BillingInfo, value: string | number) => void;
  language: 'fr' | 'en';
}

export default function Step5Billing({ data, analyses, updateData, language }: Step5BillingProps) {
  const t = {
    title: language === 'fr' ? 'Facturation' : 'Billing',
    subtitle: language === 'fr' ? 'Informations de paiement et d\'assurance' : 'Payment and insurance information',
    payer: language === 'fr' ? 'Payeur' : 'Payer',
    patient: language === 'fr' ? 'Patient' : 'Patient',
    insurance: language === 'fr' ? 'Assurance' : 'Insurance',
    company: language === 'fr' ? 'Entreprise' : 'Company',
    insuranceCompany: language === 'fr' ? 'Compagnie d\'assurance' : 'Insurance Company',
    insuranceNumber: language === 'fr' ? 'Numéro d\'assurance' : 'Insurance Number',
    discount: language === 'fr' ? 'Remise (%)' : 'Discount (%)',
    advancePayment: language === 'fr' ? 'Acompte' : 'Advance Payment',
    notes: language === 'fr' ? 'Notes' : 'Notes',
    summary: language === 'fr' ? 'Résumé de facturation' : 'Billing Summary',
    subtotal: language === 'fr' ? 'Sous-total' : 'Subtotal',
    tva: language === 'fr' ? 'TVA' : 'VAT',
    totalBeforeDiscount: language === 'fr' ? 'Total avant remise' : 'Total before discount',
    discountAmount: language === 'fr' ? 'Montant de la remise' : 'Discount amount',
    totalAfterDiscount: language === 'fr' ? 'Total après remise' : 'Total after discount',
    amountDue: language === 'fr' ? 'Montant dû' : 'Amount due',
    required: language === 'fr' ? 'Ce champ est requis' : 'This field is required',
    invalidDiscount: language === 'fr' ? 'La remise doit être entre 0 et 100' : 'Discount must be between 0 and 100',
    invalidAdvance: language === 'fr' ? 'L\'acompte ne peut pas dépasser le total' : 'Advance payment cannot exceed total'
  };

  const handleInputChange = (field: keyof BillingInfo, value: string | number) => {
    updateData(field, value);
  };

  // Calculate totals
  const subtotal = analyses.reduce((sum, analysis) => sum + analysis.price, 0);
  const tvaTotal = analyses.reduce((sum, analysis) => sum + (analysis.price * analysis.tva / 100), 0);
  const totalBeforeDiscount = subtotal + tvaTotal;
  const discountAmount = totalBeforeDiscount * (data.discount / 100);
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;
  const amountDue = totalAfterDiscount - data.advancePayment;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Form */}
        <div className="space-y-6">
          {/* Payer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.payer}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payer"
                  value="PATIENT"
                  checked={data.payer === 'PATIENT'}
                  onChange={(e) => handleInputChange('payer', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <CreditCard size={16} className="mr-2 text-gray-400" />
                {t.patient}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payer"
                  value="INSURANCE"
                  checked={data.payer === 'INSURANCE'}
                  onChange={(e) => handleInputChange('payer', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <Building size={16} className="mr-2 text-gray-400" />
                {t.insurance}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payer"
                  value="COMPANY"
                  checked={data.payer === 'COMPANY'}
                  onChange={(e) => handleInputChange('payer', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <Building size={16} className="mr-2 text-gray-400" />
                {t.company}
              </label>
            </div>
          </div>

          {/* Insurance Information (only show if insurance is selected) */}
          {data.payer === 'INSURANCE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.insuranceCompany}
                </label>
                <input
                  type="text"
                  value={data.insuranceCompany}
                  onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de la compagnie d'assurance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.insuranceNumber}
                </label>
                <input
                  type="text"
                  value={data.insuranceNumber}
                  onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Numéro de police"
                />
              </div>
            </div>
          )}

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.discount}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Advance Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.advancePayment}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.advancePayment}
                onChange={(e) => handleInputChange('advancePayment', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
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
                placeholder="Notes de facturation..."
              />
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.summary}</h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.subtotal}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{subtotal.toFixed(2)} dh</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.tva}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{tvaTotal.toFixed(2)} dh</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t.totalBeforeDiscount}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalBeforeDiscount.toFixed(2)} dh</span>
              </div>
            </div>
            
            {data.discount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t.discountAmount}:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{discountAmount.toFixed(2)} dh</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.totalAfterDiscount}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{totalAfterDiscount.toFixed(2)} dh</span>
                  </div>
                </div>
              </>
            )}
            
            {data.advancePayment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t.advancePayment}:</span>
                <span className="font-medium text-green-600 dark:text-green-400">-{data.advancePayment.toFixed(2)} dh</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 dark:border-gray-500 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">{t.amountDue}:</span>
                <span className={`${amountDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {amountDue.toFixed(2)} dh
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard size={20} className="text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {data.payer === 'PATIENT' && t.patient}
                  {data.payer === 'INSURANCE' && t.insurance}
                  {data.payer === 'COMPANY' && t.company}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {data.payer === 'PATIENT' && (language === 'fr' ? 
                    'Le patient paiera directement' :
                    'Patient will pay directly'
                  )}
                  {data.payer === 'INSURANCE' && (language === 'fr' ? 
                    'Paiement par assurance' :
                    'Payment by insurance'
                  )}
                  {data.payer === 'COMPANY' && (language === 'fr' ? 
                    'Paiement par entreprise' :
                    'Payment by company'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 