import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';
import { qualityControlService } from '../services/qualityControl';

interface AddQCResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  automateId?: string;
}

interface Automate {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
}

export default function AddQCResultModal({ isOpen, onClose, onSuccess, automateId }: AddQCResultModalProps) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [automates, setAutomates] = useState<Automate[]>([]);
  const [formData, setFormData] = useState({
    automateId: automateId || '',
    testName: '',
    level: 'Normal',
    value: '',
    expected: '',
    deviation: '',
    status: 'pass'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = {
    fr: {
      title: 'Ajouter un Résultat de Contrôle Qualité',
      automate: 'Automate',
      testName: 'Nom du Test',
      level: 'Niveau',
      value: 'Valeur Mesurée',
      expected: 'Valeur Attendue',
      deviation: 'Déviation (%)',
      status: 'Statut',
      save: 'Enregistrer',
      cancel: 'Annuler',
      loading: 'Enregistrement...',
      required: 'Ce champ est requis',
      invalidNumber: 'Veuillez entrer un nombre valide',
      levels: {
        Low: 'Bas',
        Normal: 'Normal',
        High: 'Élevé'
      },
      statuses: {
        pass: 'Réussi',
        fail: 'Échec',
        warning: 'Avertissement'
      },
      selectAutomate: 'Sélectionner un automate'
    },
    en: {
      title: 'Add Quality Control Result',
      automate: 'Automate',
      testName: 'Test Name',
      level: 'Level',
      value: 'Measured Value',
      expected: 'Expected Value',
      deviation: 'Deviation (%)',
      status: 'Status',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Saving...',
      required: 'This field is required',
      invalidNumber: 'Please enter a valid number',
      levels: {
        Low: 'Low',
        Normal: 'Normal',
        High: 'High'
      },
      statuses: {
        pass: 'Pass',
        fail: 'Fail',
        warning: 'Warning'
      },
      selectAutomate: 'Select an automate'
    }
  }[language];

  useEffect(() => {
    if (isOpen) {
      loadAutomates();
      if (automateId) {
        setFormData(prev => ({ ...prev, automateId }));
      }
    }
  }, [isOpen, automateId]);

  useEffect(() => {
    // Calculate deviation when value and expected change
    if (formData.value && formData.expected) {
      const value = parseFloat(formData.value);
      const expected = parseFloat(formData.expected);
      if (!isNaN(value) && !isNaN(expected) && expected !== 0) {
        const deviation = ((value - expected) / expected) * 100;
        setFormData(prev => ({ ...prev, deviation: deviation.toFixed(2) }));
        
        // Auto-determine status based on deviation
        const absDeviation = Math.abs(deviation);
        let status = 'pass';
        if (absDeviation > 15) {
          status = 'fail';
        } else if (absDeviation > 5) {
          status = 'warning';
        }
        setFormData(prev => ({ ...prev, status }));
      }
    }
  }, [formData.value, formData.expected]);

  const loadAutomates = async () => {
    try {
      const data = await qualityControlService.getAutomates();
      setAutomates(data.automates);
    } catch (error) {
      console.error('Error loading automates:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.automateId) {
      newErrors.automateId = t.required;
    }
    if (!formData.testName.trim()) {
      newErrors.testName = t.required;
    }
    if (!formData.value) {
      newErrors.value = t.required;
    } else if (isNaN(parseFloat(formData.value))) {
      newErrors.value = t.invalidNumber;
    }
    if (!formData.expected) {
      newErrors.expected = t.required;
    } else if (isNaN(parseFloat(formData.expected))) {
      newErrors.expected = t.invalidNumber;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      await qualityControlService.createQCResult(formData.automateId, {
        testName: formData.testName,
        level: formData.level,
        value: parseFloat(formData.value),
        expected: parseFloat(formData.expected),
        deviation: parseFloat(formData.deviation),
        status: formData.status
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        automateId: automateId || '',
        testName: '',
        level: 'Normal',
        value: '',
        expected: '',
        deviation: '',
        status: 'pass'
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating QC result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Automate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.automate} *
            </label>
            <select
              value={formData.automateId}
              onChange={(e) => handleInputChange('automateId', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.automateId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={!!automateId}
            >
              <option value="">{t.selectAutomate}</option>
              {automates.map((automate) => (
                <option key={automate.id} value={automate.id}>
                  {automate.name} - {automate.manufacturer}
                </option>
              ))}
            </select>
            {errors.automateId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.automateId}
              </p>
            )}
          </div>

          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.testName} *
            </label>
            <input
              type="text"
              value={formData.testName}
              onChange={(e) => handleInputChange('testName', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.testName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ex: Glucose, Cholesterol, etc."
            />
            {errors.testName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.testName}
              </p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.level}
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Low">{t.levels.Low}</option>
              <option value="Normal">{t.levels.Normal}</option>
              <option value="High">{t.levels.High}</option>
            </select>
          </div>

          {/* Value and Expected in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.value} *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.value ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.value && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.value}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.expected} *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.expected}
                onChange={(e) => handleInputChange('expected', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.expected ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.expected && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.expected}
                </p>
              )}
            </div>
          </div>

          {/* Deviation (auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.deviation}
            </label>
            <input
              type="text"
              value={formData.deviation}
              readOnly
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
              placeholder="Auto-calculé"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.status}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="pass">{t.statuses.pass}</option>
              <option value="warning">{t.statuses.warning}</option>
              <option value="fail">{t.statuses.fail}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t.loading}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}