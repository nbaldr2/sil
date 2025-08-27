import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Eye, 
  Send, 
  X, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../App';

// Types
interface Customer {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'INSURANCE' | 'COMPANY';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  insuranceCode?: string;
  creditLimit: number;
  paymentTerms: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'STANDARD' | 'PROFORMA' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'RECEIPT';
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL_PAID' | 'OVERDUE' | 'CANCELLED';
  customerName: string;
  patientName?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  currency: string;
}

interface Transaction {
  id: string;
  transactionNumber: string;
  type: 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD';
  paymentDate: string;
  invoiceNumber?: string;
  customerName: string;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  invoiceCount: number;
  collectionRate: number;
}

export default function BillingModule() {
  const { language, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'customer' | 'payment' | 'view'>('invoice');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalRevenue: 125000,
    totalPaid: 98000,
    totalOutstanding: 27000,
    totalOverdue: 8500,
    invoiceCount: 156,
    collectionRate: 78.4
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-000001',
      type: 'STANDARD',
      status: 'PAID',
      customerName: 'CNSS Maroc',
      patientName: 'Ahmed Benali',
      subtotal: 850.00,
      taxAmount: 170.00,
      totalAmount: 1020.00,
      paidAmount: 1020.00,
      balanceAmount: 0.00,
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      paidDate: '2024-01-20',
      currency: 'MAD'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-000002',
      type: 'STANDARD',
      status: 'OVERDUE',
      customerName: 'CNOPS',
      patientName: 'Fatima Zahra',
      subtotal: 1200.00,
      taxAmount: 240.00,
      totalAmount: 1440.00,
      paidAmount: 0.00,
      balanceAmount: 1440.00,
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      currency: 'MAD'
    }
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'CNSS Maroc',
      type: 'INSURANCE',
      email: 'facturation@cnss.ma',
      phone: '+212 5 37 71 96 96',
      address: 'Angle Bd Abdelmoumen et rue Soumaya, Casablanca',
      taxId: 'ICE001234567890123',
      insuranceCode: 'CNSS',
      creditLimit: 50000,
      paymentTerms: 30
    },
    {
      id: '2',
      name: 'CNOPS',
      type: 'INSURANCE',
      email: 'remboursement@cnops.ma',
      phone: '+212 5 37 71 30 30',
      address: 'Hay Riad, Rabat',
      taxId: 'ICE001234567890124',
      insuranceCode: 'CNOPS',
      creditLimit: 75000,
      paymentTerms: 45
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      transactionNumber: 'TXN-2024-000001',
      type: 'PAYMENT',
      status: 'COMPLETED',
      amount: 1020.00,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2024-01-20',
      invoiceNumber: 'INV-2024-000001',
      customerName: 'CNSS Maroc'
    }
  ]);

  const t = {
    fr: {
      // Navigation
      dashboard: 'Tableau de Bord',
      invoices: 'Factures',
      customers: 'Clients',
      payments: 'Paiements',
      reports: 'Rapports',
      settings: 'Paramètres',
      
      // Dashboard
      totalRevenue: 'Chiffre d\'Affaires Total',
      totalPaid: 'Total Encaissé',
      totalOutstanding: 'En Attente',
      totalOverdue: 'En Retard',
      invoiceCount: 'Nombre de Factures',
      collectionRate: 'Taux de Recouvrement',
      
      // Actions
      newInvoice: 'Nouvelle Facture',
      newCustomer: 'Nouveau Client',
      newPayment: 'Nouveau Paiement',
      export: 'Exporter',
      search: 'Rechercher',
      filter: 'Filtrer',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      send: 'Envoyer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      
      // Invoice fields
      invoiceNumber: 'N° Facture',
      customer: 'Client',
      patient: 'Patient',
      amount: 'Montant',
      status: 'Statut',
      issueDate: 'Date d\'Émission',
      dueDate: 'Date d\'Échéance',
      paidDate: 'Date de Paiement',
      
      // Status
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      partialPaid: 'Partiellement Payée',
      overdue: 'En Retard',
      cancelled: 'Annulée',
      
      // Customer fields
      name: 'Nom',
      type: 'Type',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      taxId: 'N° ICE',
      creditLimit: 'Limite de Crédit',
      paymentTerms: 'Délai de Paiement',
      
      // Payment fields
      paymentMethod: 'Mode de Paiement',
      paymentDate: 'Date de Paiement',
      reference: 'Référence',
      
      // Types
      individual: 'Particulier',
      insurance: 'Assurance',
      company: 'Entreprise',
      cash: 'Espèces',
      bankTransfer: 'Virement',
      check: 'Chèque',
      creditCard: 'Carte de Crédit'
    },
    en: {
      // Navigation
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      customers: 'Customers',
      payments: 'Payments',
      reports: 'Reports',
      settings: 'Settings',
      
      // Dashboard
      totalRevenue: 'Total Revenue',
      totalPaid: 'Total Paid',
      totalOutstanding: 'Outstanding',
      totalOverdue: 'Overdue',
      invoiceCount: 'Invoice Count',
      collectionRate: 'Collection Rate',
      
      // Actions
      newInvoice: 'New Invoice',
      newCustomer: 'New Customer',
      newPayment: 'New Payment',
      export: 'Export',
      search: 'Search',
      filter: 'Filter',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      
      // Invoice fields
      invoiceNumber: 'Invoice #',
      customer: 'Customer',
      patient: 'Patient',
      amount: 'Amount',
      status: 'Status',
      issueDate: 'Issue Date',
      dueDate: 'Due Date',
      paidDate: 'Paid Date',
      
      // Status
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      partialPaid: 'Partial Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      
      // Customer fields
      name: 'Name',
      type: 'Type',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      taxId: 'Tax ID',
      creditLimit: 'Credit Limit',
      paymentTerms: 'Payment Terms',
      
      // Payment fields
      paymentMethod: 'Payment Method',
      paymentDate: 'Payment Date',
      reference: 'Reference',
      
      // Types
      individual: 'Individual',
      insurance: 'Insurance',
      company: 'Company',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      creditCard: 'Credit Card'
    }
  }[language];

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      PARTIAL_PAID: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency = 'MAD') => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Modal handlers
  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalRevenue}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalPaid}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalOutstanding}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalOutstanding)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalOverdue}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalOverdue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.invoiceCount}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {dashboardMetrics.invoiceCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.collectionRate}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {dashboardMetrics.collectionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.invoiceNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.customer}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dueDate}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {t[invoice.status.toLowerCase() as keyof typeof t] || invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(invoice.dueDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Invoices Component
  const Invoices = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal('invoice')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            {t.newInvoice}
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download size={20} className="mr-2" />
            {t.export}
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.invoiceNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.customer}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.patient}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dueDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices
                .filter(invoice => 
                  (filterStatus === 'all' || invoice.status === filterStatus) &&
                  (searchTerm === '' || 
                   invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (invoice.patientName && invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                )
                .map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.patientName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {t[invoice.status.toLowerCase() as keyof typeof t] || invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title={t.view}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal('invoice', invoice)}
                        className="text-green-600 hover:text-green-900"
                        title={t.edit}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        title={t.send}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Customers Component
  const Customers = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => openModal('customer')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          {t.newCustomer}
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers
          .filter(customer => 
            searchTerm === '' || 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((customer) => (
          <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t[customer.type.toLowerCase() as keyof typeof t] || customer.type}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal('customer', customer)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
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
                  {customer.address}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.creditLimit}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(customer.creditLimit)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">{t.paymentTerms}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {customer.paymentTerms} days
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Payments Component
  const Payments = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => openModal('payment')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          {t.newPayment}
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.customer}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.paymentMethod}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.paymentDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.transactionNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {t[transaction.paymentMethod.toLowerCase() as keyof typeof t] || transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(transaction.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Modal Component
  const Modal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'invoice':
          return <InvoiceForm />;
        case 'customer':
          return <CustomerForm />;
        case 'payment':
          return <PaymentForm />;
        case 'view':
          return <InvoiceView />;
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {renderModalContent()}
        </div>
      </div>
    );
  };

  // Form Components
  const InvoiceForm = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedItem ? 'Edit Invoice' : t.newInvoice}
        </h3>
        <button onClick={closeModal}>
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.customer}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.dueDate}
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Invoice Items</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Description"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Quantity"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Unit Price"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Total"
              readOnly
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          {t.cancel}
        </button>
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.save}
        </button>
      </div>
    </div>
  );

  const CustomerForm = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedItem ? 'Edit Customer' : t.newCustomer}
        </h3>
        <button onClick={closeModal}>
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.name}
          </label>
          <input
            type="text"
            defaultValue={selectedItem?.name}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.type}
          </label>
          <select 
            defaultValue={selectedItem?.type}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="INDIVIDUAL">{t.individual}</option>
            <option value="INSURANCE">{t.insurance}</option>
            <option value="COMPANY">{t.company}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.email}
          </label>
          <input
            type="email"
            defaultValue={selectedItem?.email}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.phone}
          </label>
          <input
            type="tel"
            defaultValue={selectedItem?.phone}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.address}
          </label>
          <textarea
            defaultValue={selectedItem?.address}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.taxId}
          </label>
          <input
            type="text"
            defaultValue={selectedItem?.taxId}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.creditLimit}
          </label>
          <input
            type="number"
            defaultValue={selectedItem?.creditLimit}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          {t.cancel}
        </button>
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.save}
        </button>
      </div>
    </div>
  );

  const PaymentForm = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.newPayment}
        </h3>
        <button onClick={closeModal}>
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Invoice
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Select Invoice</option>
            {invoices.filter(inv => inv.balanceAmount > 0).map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {formatCurrency(invoice.balanceAmount)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.amount}
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.paymentMethod}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option value="CASH">{t.cash}</option>
            <option value="BANK_TRANSFER">{t.bankTransfer}</option>
            <option value="CHECK">{t.check}</option>
            <option value="CREDIT_CARD">{t.creditCard}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.reference}
          </label>
          <input
            type="text"
            placeholder="Check number, transfer reference, etc."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          {t.cancel}
        </button>
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.save}
        </button>
      </div>
    </div>
  );

  const InvoiceView = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Invoice Details - {selectedItem?.invoiceNumber}
        </h3>
        <button onClick={closeModal}>
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      {selectedItem && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer Information</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {selectedItem.customerName}</div>
                <div><strong>Type:</strong> {selectedItem.type}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Invoice Information</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Issue Date:</strong> {formatDate(selectedItem.issueDate)}</div>
                <div><strong>Due Date:</strong> {formatDate(selectedItem.dueDate)}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Financial Summary</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Subtotal</div>
                  <div className="font-medium">{formatCurrency(selectedItem.subtotal)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Tax</div>
                  <div className="font-medium">{formatCurrency(selectedItem.taxAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Total</div>
                  <div className="font-medium">{formatCurrency(selectedItem.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Balance</div>
                  <div className="font-medium text-red-600">{formatCurrency(selectedItem.balanceAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          {t.close}
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Download PDF
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Billing Manager
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
            { id: 'invoices', label: t.invoices, icon: FileText },
            { id: 'customers', label: t.customers, icon: Users },
            { id: 'payments', label: t.payments, icon: CreditCard },
            { id: 'reports', label: t.reports, icon: BarChart3 },
            { id: 'settings', label: t.settings, icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'invoices' && <Invoices />}
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'payments' && <Payments />}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reports Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">Advanced reporting features will be available soon.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">Billing configuration settings will be available soon.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal />
    </div>
  );
}