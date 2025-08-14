import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Search, Plus, DollarSign } from 'lucide-react';
import { analysesService } from '../../services/integrations';

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

interface Step2AnalysesProps {
  data: Analysis[];
  prescription?: File;
  updateData: (analyses: Analysis[]) => void;
  updatePrescription: (file: File | undefined) => void;
  language: 'fr' | 'en';
}

export default function Step2Analyses({ data, prescription, updateData, updatePrescription, language }: Step2AnalysesProps) {
  const [availableAnalyses, setAvailableAnalyses] = useState<Analysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAnalyses, setSelectedAnalyses] = useState<Analysis[]>([]);

  const t = {
    title: language === 'fr' ? 'Sélection des Analyses' : 'Analysis Selection',
    subtitle: language === 'fr' ? 'Sélectionnez les analyses à effectuer et téléchargez l\'ordonnance' : 'Select the analyses to perform and upload the prescription',
    searchAnalyses: language === 'fr' ? 'Rechercher des analyses...' : 'Search analyses...',
    category: language === 'fr' ? 'Catégorie' : 'Category',
    allCategories: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    selectedAnalyses: language === 'fr' ? 'Analyses sélectionnées' : 'Selected Analyses',
    noAnalysesSelected: language === 'fr' ? 'Aucune analyse sélectionnée' : 'No analyses selected',
    prescription: language === 'fr' ? 'Ordonnance' : 'Prescription',
    uploadPrescription: language === 'fr' ? 'Télécharger l\'ordonnance' : 'Upload Prescription',
    dragDropText: language === 'fr' ? 'Glissez-déposez un fichier ici ou cliquez pour sélectionner' : 'Drag and drop a file here or click to select',
    supportedFormats: language === 'fr' ? 'Formats supportés: PDF, JPG, PNG' : 'Supported formats: PDF, JPG, PNG',
    remove: language === 'fr' ? 'Supprimer' : 'Remove',
    addAnalysis: language === 'fr' ? 'Ajouter des analyses' : 'Add Analyses',
    selectAll: language === 'fr' ? 'Tout sélectionner' : 'Select All',
    deselectAll: language === 'fr' ? 'Tout désélectionner' : 'Deselect All',
    addSelected: language === 'fr' ? 'Ajouter sélectionnés' : 'Add Selected',
    selectedCount: language === 'fr' ? 'sélectionnés' : 'selected',
    code: language === 'fr' ? 'Code' : 'Code',
    name: language === 'fr' ? 'Nom' : 'Name',
    price: language === 'fr' ? 'Prix' : 'Price',
    tva: language === 'fr' ? 'TVA' : 'VAT',
    total: language === 'fr' ? 'Total' : 'Total',
    noAnalysesFound: language === 'fr' ? 'Aucune analyse trouvée' : 'No analyses found',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...'
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const response = await analysesService.getAnalyses();
      // The API returns { analyses: [...], pagination: {...} }
      const analyses = response.analyses || response || [];
      setAvailableAnalyses(analyses);
    } catch (error) {
      console.error('Error loading analyses:', error);
      setAvailableAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnalysis = (analysis: Analysis) => {
    if (!data.find(a => a.id === analysis.id)) {
      updateData([...data, analysis]);
    }
  };

  const handleAddMultipleAnalyses = (analyses: Analysis[]) => {
    const newAnalyses = analyses.filter(analysis => !data.find(a => a.id === analysis.id));
    if (newAnalyses.length > 0) {
      updateData([...data, ...newAnalyses]);
    }
  };

  const handleRemoveAnalysis = (analysisId: string) => {
    updateData(data.filter(a => a.id !== analysisId));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updatePrescription(file);
    }
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      updatePrescription(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const filteredAnalyses = availableAnalyses.filter(analysis => {
    const matchesSearch = analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || analysis.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(availableAnalyses.map(a => a.category))];
  const subtotal = data.reduce((sum, analysis) => sum + analysis.price, 0);
  const tvaTotal = data.reduce((sum, analysis) => sum + (analysis.price * analysis.tva / 100), 0);
  const total = subtotal + tvaTotal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analysis Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.selectedAnalyses}</h3>
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} className="mr-1" />
              {t.addAnalysis}
            </button>
          </div>

          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t.noAnalysesSelected}
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {analysis.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {analysis.code} • {analysis.category}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {analysis.price} dh
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        TVA: {analysis.tva}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAnalysis(analysis.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {data.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t.total}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{total.toFixed(2)} dh</span>
              </div>
            </div>
          )}
        </div>

        {/* Prescription Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.prescription}</h3>
          
          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
          >
            {prescription ? (
              <div className="space-y-2">
                <FileText size={32} className="mx-auto text-green-600 dark:text-green-400" />
                <div className="font-medium text-gray-900 dark:text-white">
                  {prescription.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {(prescription.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <button
                  onClick={() => updatePrescription(undefined)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  {t.remove}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={32} className="mx-auto text-gray-400" />
                <div className="text-gray-600 dark:text-gray-400">
                  {t.dragDropText}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t.supportedFormats}
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {t.uploadPrescription}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Selection Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.addAnalysis}</h3>
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedAnalyses([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder={t.searchAnalyses}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t.allCategories}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Selection Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const availableAnalyses = filteredAnalyses.filter(analysis => !data.find(a => a.id === analysis.id));
                        setSelectedAnalyses(availableAnalyses);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      {t.selectAll}
                    </button>
                    <button
                      onClick={() => setSelectedAnalyses([])}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      {t.deselectAll}
                    </button>
                  </div>
                  {selectedAnalyses.length > 0 && (
                    <button
                      onClick={() => {
                        handleAddMultipleAnalyses(selectedAnalyses);
                        setSelectedAnalyses([]);
                        setShowAnalysisModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      {t.addSelected} ({selectedAnalyses.length})
                    </button>
                  )}
                </div>
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
                  {filteredAnalyses.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noAnalysesFound}</p>
                  ) : (
                    filteredAnalyses.map((analysis) => {
                      const isAlreadySelected = data.find(a => a.id === analysis.id);
                      const isModalSelected = selectedAnalyses.find(a => a.id === analysis.id);
                      
                      return (
                        <div
                          key={analysis.id}
                          className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-colors ${
                            isAlreadySelected 
                              ? 'border-gray-300 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                              : isModalSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            if (!isAlreadySelected) {
                              if (isModalSelected) {
                                setSelectedAnalyses(selectedAnalyses.filter(a => a.id !== analysis.id));
                              } else {
                                setSelectedAnalyses([...selectedAnalyses, analysis]);
                              }
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {!isAlreadySelected && (
                                <input
                                  type="checkbox"
                                  checked={!!isModalSelected}
                                  onChange={() => {}}
                                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{analysis.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {analysis.code} • {analysis.category}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {analysis.price} dh
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                TVA: {analysis.tva}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
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