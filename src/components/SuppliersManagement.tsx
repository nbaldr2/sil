import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Building,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';

interface Supplier {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SuppliersManagement() {
  const { language } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const t = {
    fr: {
      title: 'Gestion des Fournisseurs',
      subtitle: 'Gérez vos fournisseurs et partenaires',
      addSupplier: 'Ajouter Fournisseur',
      editSupplier: 'Modifier Fournisseur',
      viewSupplier: 'Détails Fournisseur',
      search: 'Rechercher...',
      filter: 'Filtrer par statut',
      all: 'Tous',
      active: 'Actif',
      inactive: 'Inactif',
      code: 'Code',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      contactPerson: 'Personne de contact',
      status: 'Statut',
      actions: 'Actions',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?',
      success: 'Fournisseur enregistré avec succès',
      error: 'Erreur lors de l\'enregistrement',
      noSuppliers: 'Aucun fournisseur trouvé',
      totalSuppliers: 'Total Fournisseurs',
      activeSuppliers: 'Fournisseurs Actifs',
      recentSuppliers: 'Fournisseurs Récents'
    },
    en: {
      title: 'Suppliers Management',
      subtitle: 'Manage your suppliers and partners',
      addSupplier: 'Add Supplier',
      editSupplier: 'Edit Supplier',
      viewSupplier: 'View Supplier',
      search: 'Search...',
      filter: 'Filter by status',
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
      code: 'Code',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      contactPerson: 'Contact Person',
      status: 'Status',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this supplier?',
      success: 'Supplier saved successfully',
      error: 'Error saving supplier',
      noSuppliers: 'No suppliers found',
      totalSuppliers: 'Total Suppliers',
      activeSuppliers: 'Active Suppliers',
      recentSuppliers: 'Recent Suppliers'
    }
  }[language];

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await stockService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier =>
        statusFilter === 'active' ? supplier.isActive : !supplier.isActive
      );
    }

    setFilteredSuppliers(filtered);
  };

  const handleSave = async (supplierData: Partial<Supplier>) => {
    try {
      if (editingSupplier) {
        await stockService.updateSupplier(editingSupplier.id, supplierData);
      } else {
        await stockService.createSupplier(supplierData);
      }
      
      await loadSuppliers();
      setShowAddModal(false);
      setEditingSupplier(null);
      alert(t.success);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert(t.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await stockService.deleteSupplier(id);
        await loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert(t.error);
      }
    }
  };

  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const recentSuppliers = suppliers.filter(s => {
    const createdAt = new Date(s.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt > thirtyDaysAgo;
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalSuppliers}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.activeSuppliers}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.recentSuppliers}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentSuppliers}</p>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addSupplier}
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.code}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.contactPerson}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.email}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.phone}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {supplier.contactPerson || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {supplier.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {supplier.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {supplier.isActive ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setShowAddModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t.noSuppliers}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <SupplierModal
          supplier={editingSupplier}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setEditingSupplier(null);
          }}
          t={t}
        />
      )}

      {/* View Modal */}
      {selectedSupplier && (
        <SupplierViewModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          t={t}
        />
      )}
    </div>
  );
}

// Supplier Modal Component
function SupplierModal({ supplier, onSave, onCancel, t }: {
  supplier: Supplier | null;
  onSave: (data: Partial<Supplier>) => void;
  onCancel: () => void;
  t: any;
}) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    code: supplier?.code || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    contactPerson: supplier?.contactPerson || '',
    isActive: supplier?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {supplier ? t.editSupplier : t.addSupplier}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.code}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.contactPerson}
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.phone}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.address}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t.active}
            </label>
          </div>
        </form>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => onSave(formData)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// Supplier View Modal Component
function SupplierViewModal({ supplier, onClose, t }: {
  supplier: Supplier;
  onClose: () => void;
  t: any;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.viewSupplier}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.code}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.code}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.name}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.contactPerson}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.contactPerson || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.email}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.email || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.phone}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.phone || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.address}
            </label>
            <p className="text-gray-900 dark:text-white">{supplier.address || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.status}
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              supplier.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {supplier.isActive ? t.active : t.inactive}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
} 