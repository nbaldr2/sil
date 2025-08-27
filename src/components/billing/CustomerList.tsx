import React, { useState, useEffect } from 'react';
import {
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../App';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  patientId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  totalInvoices: number;
  totalAmount: number;
  outstandingAmount: number;
  lastInvoiceDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
}

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  onCreateCustomer?: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onCustomerSelect, onCreateCustomer }) => {
  const { language } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const translations = {
    fr: {
      title: 'Liste des Clients',
      createCustomer: 'Nouveau Client',
      search: 'Rechercher...',
      filterByStatus: 'Filtrer par statut',
      allStatuses: 'Tous les statuts',
      active: 'Actif',
      inactive: 'Inactif',
      blocked: 'Bloqué',
      name: 'Nom',
      contact: 'Contact',
      totalInvoices: 'Factures',
      totalAmount: 'Montant Total',
      outstanding: 'En Attente',
      lastInvoice: 'Dernière Facture',
      status: 'Statut',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      noCustomers: 'Aucun client trouvé',
      currency: 'MAD',
      invoices: 'factures',
      insurance: 'Assurance'
    },
    en: {
      title: 'Customer List',
      createCustomer: 'New Customer',
      search: 'Search...',
      filterByStatus: 'Filter by status',
      allStatuses: 'All statuses',
      active: 'Active',
      inactive: 'Inactive',
      blocked: 'Blocked',
      name: 'Name',
      contact: 'Contact',
      totalInvoices: 'Invoices',
      totalAmount: 'Total Amount',
      outstanding: 'Outstanding',
      lastInvoice: 'Last Invoice',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      noCustomers: 'No customers found',
      currency: 'MAD',
      invoices: 'invoices',
      insurance: 'Insurance'
    }
   } as const;

  const t = translations[language as keyof typeof translations];


  useEffect(() => {
    loadCustomers();
  }, [statusFilter, sortBy, sortOrder]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Ahmed Benali',
          email: 'ahmed.benali@email.com',
          phone: '+212 6 12 34 56 78',
          address: '123 Rue Mohammed V',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Maroc',
          patientId: 'PAT-001',
          insuranceProvider: 'CNSS',
          insuranceNumber: 'CNS123456789',
          totalInvoices: 5,
          totalAmount: 2250.00,
          outstandingAmount: 450.00,
          lastInvoiceDate: '2024-08-15',
          status: 'ACTIVE',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Fatima Zahra',
          email: 'fatima.zahra@email.com',
          phone: '+212 6 87 65 43 21',
          address: '456 Avenue Hassan II',
          city: 'Rabat',
          postalCode: '10000',
          country: 'Maroc',
          patientId: 'PAT-002',
          insuranceProvider: 'CNOPS',
          insuranceNumber: 'CNO987654321',
          totalInvoices: 3,
          totalAmount: 960.00,
          outstandingAmount: 0.00,
          lastInvoiceDate: '2024-08-10',
          status: 'ACTIVE',
          createdAt: '2024-02-20'
        },
        {
          id: '3',
          name: 'Mohammed Alami',
          email: 'mohammed.alami@email.com',
          phone: '+212 6 55 44 33 22',
          address: '789 Boulevard Zerktouni',
          city: 'Marrakech',
          postalCode: '40000',
          country: 'Maroc',
          patientId: 'PAT-003',
          totalInvoices: 2,
          totalAmount: 324.00,
          outstandingAmount: 144.00,
          lastInvoiceDate: '2024-07-15',
          status: 'ACTIVE',
          createdAt: '2024-03-10'
        },
        {
          id: '4',
          name: 'Aicha Bennani',
          email: 'aicha.bennani@email.com',
          phone: '+212 6 11 22 33 44',
          address: '321 Rue Allal Ben Abdellah',
          city: 'Fès',
          postalCode: '30000',
          country: 'Maroc',
          patientId: 'PAT-004',
          insuranceProvider: 'Mutuelle',
          insuranceNumber: 'MUT456789123',
          totalInvoices: 1,
          totalAmount: 180.00,
          outstandingAmount: 0.00,
          lastInvoiceDate: '2024-08-20',
          status: 'INACTIVE',
          createdAt: '2024-04-05'
        }
      ];

      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t.active;
      case 'INACTIVE': return t.inactive;
      case 'BLOCKED': return t.blocked;
      default: return status;
    }
  };

  const handleCustomerAction = (action: string, customer: Customer) => {
    switch (action) {
      case 'view':
        onCustomerSelect?.(customer);
        break;
      case 'edit':
        // Handle edit
        console.log('Edit customer:', customer.id);
        break;
      case 'delete':
        // Handle delete
        console.log('Delete customer:', customer.id);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <button
          onClick={onCreateCustomer}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t.createCustomer}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="ALL">{t.allStatuses}</option>
            <option value="ACTIVE">{t.active}</option>
            <option value="INACTIVE">{t.inactive}</option>
            <option value="BLOCKED">{t.blocked}</option>
          </select>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                  {customer.patientId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.patientId}</p>
                  )}
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                {getStatusText(customer.status)}
              </span>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-4">
              {customer.email && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {customer.city}, {customer.country}
                </div>
              )}
            </div>

            {/* Insurance Information */}
            {customer.insuranceProvider && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.insurance}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{customer.insuranceProvider}</p>
                {customer.insuranceNumber && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">{customer.insuranceNumber}</p>
                )}
              </div>
            )}

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalInvoices}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {customer.totalInvoices} {t.invoices}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalAmount}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {customer.totalAmount.toFixed(2)} {t.currency}
                </p>
              </div>
            </div>

            {customer.outstandingAmount > 0 && (
              <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{t.outstanding}</p>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  {customer.outstandingAmount.toFixed(2)} {t.currency}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleCustomerAction('view', customer)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title={t.view}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCustomerAction('edit', customer)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                title={t.edit}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCustomerAction('delete', customer)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title={t.delete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t.noCustomers}</h3>
        </div>
      )}
    </div>
  );
};

export default CustomerList;