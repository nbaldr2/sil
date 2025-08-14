import React, { useState, useEffect } from 'react';
import { Code, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { useAuth } from '../../App';
import { automatesService } from '../../services/integrations';

interface Automate {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  driverCodes: AutomateCodeMapping[];
}

interface AutomateCodeMapping {
  id: string;
  automateId: string;
  codeAutomate: string;
  silTestName: string;
  sampleType: string;
  unit: string | null;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  createdAt: string;
}

interface CodeMappingTabProps {
  automates: Automate[];
  onRefresh: () => void;
}

interface MappingFormData {
  codeAutomate: string;
  silTestName: string;
  sampleType: string;
  unit: string;
  refRangeLow: number | null;
  refRangeHigh: number | null;
}

export default function CodeMappingTab({ automates, onRefresh }: CodeMappingTabProps) {
  const { language } = useAuth();
  const [selectedAutomate, setSelectedAutomate] = useState<Automate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<AutomateCodeMapping | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<MappingFormData>({
    codeAutomate: '',
    silTestName: '',
    sampleType: 'Sang',
    unit: '',
    refRangeLow: null,
    refRangeHigh: null
  });

  const t = {
    fr: {
      title: 'Mapping des Codes',
      subtitle: 'Gérez la correspondance entre les codes des automates et les tests SIL',
      selectAutomate: 'Sélectionner un automate',
      addMapping: 'Ajouter un mapping',
      editMapping: 'Modifier le mapping',
      codeAutomate: 'Code Automate',
      silTestName: 'Nom du test SIL',
      sampleType: 'Type d\'échantillon',
      unit: 'Unité',
      refRangeLow: 'Valeur de référence basse',
      refRangeHigh: 'Valeur de référence haute',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      search: 'Rechercher...',
      noMappings: 'Aucun mapping trouvé',
      success: 'Mapping enregistré avec succès',
      error: 'Erreur lors de l\'enregistrement',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce mapping ?',
      deleteSuccess: 'Mapping supprimé avec succès',
      deleteError: 'Erreur lors de la suppression'
    },
    en: {
      title: 'Code Mapping',
      subtitle: 'Manage the mapping between automate codes and SIL tests',
      selectAutomate: 'Select an automate',
      addMapping: 'Add Mapping',
      editMapping: 'Edit Mapping',
      codeAutomate: 'Automate Code',
      silTestName: 'SIL Test Name',
      sampleType: 'Sample Type',
      unit: 'Unit',
      refRangeLow: 'Reference Range Low',
      refRangeHigh: 'Reference Range High',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      search: 'Search...',
      noMappings: 'No mappings found',
      success: 'Mapping saved successfully',
      error: 'Error saving mapping',
      deleteConfirm: 'Are you sure you want to delete this mapping?',
      deleteSuccess: 'Mapping deleted successfully',
      deleteError: 'Error deleting mapping'
    }
  }[language];

  const sampleTypes = [
    'Sang',
    'Serum',
    'Plasma',
    'Urine',
    'Saliva',
    'Stool',
    'CSF',
    'Other'
  ];

  const units = [
    'g/L',
    'mg/dL',
    'mmol/L',
    'µmol/L',
    'U/L',
    'mIU/L',
    'ng/mL',
    'pg/mL',
    '%',
    '10^9/L',
    '10^12/L',
    'Other'
  ];

  const filteredMappings = selectedAutomate?.driverCodes.filter(mapping =>
    mapping.codeAutomate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.silTestName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddMapping = () => {
    setFormData({
      codeAutomate: '',
      silTestName: '',
      sampleType: 'Sang',
      unit: '',
      refRangeLow: null,
      refRangeHigh: null
    });
    setShowAddModal(true);
  };

  const handleEditMapping = (mapping: AutomateCodeMapping) => {
    setEditingMapping(mapping);
    setFormData({
      codeAutomate: mapping.codeAutomate,
      silTestName: mapping.silTestName,
      sampleType: mapping.sampleType,
      unit: mapping.unit || '',
      refRangeLow: mapping.refRangeLow,
      refRangeHigh: mapping.refRangeHigh
    });
    setShowEditModal(true);
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!selectedAutomate || !confirm(t.deleteConfirm)) return;

    setLoading(true);
    try {
      await automatesService.deleteCodeMapping(selectedAutomate.id, mappingId);
      alert(t.deleteSuccess);
      onRefresh();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert(t.deleteError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAutomate) return;

    setLoading(true);
    try {
      if (showEditModal && editingMapping) {
        await automatesService.updateCodeMapping(selectedAutomate.id, editingMapping.id, formData);
      } else {
        await automatesService.addCodeMapping(selectedAutomate.id, formData);
      }
      alert(t.success);
      setShowAddModal(false);
      setShowEditModal(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving mapping:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Code size={24} className="text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Automate Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.selectAutomate}
          </label>
          <select
            value={selectedAutomate?.id || ''}
            onChange={(e) => {
              const automate = automates.find(a => a.id === e.target.value);
              setSelectedAutomate(automate || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{language === 'fr' ? 'Sélectionner un automate' : 'Select an automate'}</option>
            {automates.map(automate => (
              <option key={automate.id} value={automate.id}>
                {automate.name} ({automate.manufacturer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAutomate && (
        <>
          {/* Search and Add Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddMapping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                {t.addMapping}
              </button>
            </div>
          </div>

          {/* Mappings Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.codeAutomate}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.silTestName}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.sampleType}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.unit}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMappings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {t.noMappings}
                      </td>
                    </tr>
                  ) : (
                    filteredMappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {mapping.codeAutomate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {mapping.silTestName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {mapping.sampleType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {mapping.unit || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {mapping.refRangeLow && mapping.refRangeHigh 
                            ? `${mapping.refRangeLow} - ${mapping.refRangeHigh}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditMapping(mapping)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMapping(mapping.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
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
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showEditModal ? t.editMapping : t.addMapping}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.codeAutomate} *
                </label>
                <input
                  type="text"
                  value={formData.codeAutomate}
                  onChange={(e) => handleInputChange('codeAutomate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.silTestName} *
                </label>
                <input
                  type="text"
                  value={formData.silTestName}
                  onChange={(e) => handleInputChange('silTestName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.sampleType}
                </label>
                <select
                  value={formData.sampleType}
                  onChange={(e) => handleInputChange('sampleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sampleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.unit}
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.refRangeLow}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refRangeLow || ''}
                    onChange={(e) => handleInputChange('refRangeLow', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.refRangeHigh}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refRangeHigh || ''}
                    onChange={(e) => handleInputChange('refRangeHigh', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'fr' ? 'Enregistrement...' : 'Saving...'}
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
      )}
    </div>
  );
} 