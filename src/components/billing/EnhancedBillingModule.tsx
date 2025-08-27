import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  CreditCard,
  Users,
  ClipboardList,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../App';
import { BillingService, type Invoice, type Transaction, type Customer, type InsuranceClaim } from '../../services/billingService';
import CustomerList from './CustomerList';

const EnhancedBillingModule: React.FC = () => {
  const { language, user, theme } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'payment' | 'customer' | 'claim'>('invoice');

  // State for data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 125000,
    pendingInvoices: 15,
    overdueAmount: 25000,
    collectionRate: 85.5,
    monthlyGrowth: 12.5
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);

  // Load data with proper error handling
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, invoicesData] = await Promise.allSettled([
        BillingService.getDashboardMetrics(),
        BillingService.getInvoices({ limit: 5 })
      ]);

      if (metricsData.status === 'fulfilled') {
        setDashboardStats({
          totalRevenue: metricsData.value.metrics.totalRevenue,
          pendingInvoices: metricsData.value.metrics.totalInvoices - metricsData.value.metrics.paidInvoices,
          overdueAmount: metricsData.value.metrics.overdueInvoices * 1000, // Estimate
          collectionRate: parseFloat(metricsData.value.metrics.collectionRate),
          monthlyGrowth: 12.5 // This would come from metrics
        });
      }

      if (invoicesData.status === 'fulfilled') {
        setInvoices(invoicesData.value.invoices);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    fr: {
      billingManager: 'Gestionnaire de Facturation',
      dashboard: 'Tableau de Bord',
      invoices: 'Factures',
      payments: 'Paiements',
      customers: 'Clients',
      reports: 'Rapports',
      claims: 'Réclamations',
      settings: 'Paramètres',
      totalRevenue: 'Revenus Total',
      pendingInvoices: 'Factures en Attente',
      overdueAmount: 'Montant en Retard',
      collectionRate: 'Taux de Recouvrement',
      monthlyGrowth: 'Croissance Mensuelle',
      newInvoice: 'Nouvelle Facture',
      recordPayment: 'Enregistrer Paiement',
      generateReport: 'Générer Rapport',
      paymentReminders: 'Rappels de Paiement',
      search: 'Rechercher...',
      filter: 'Filtrer',
      status: 'Statut',
      all: 'Tous',
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      amount: 'Montant',
      date: 'Date',
      customer: 'Client',
      invoiceNumber: 'N° Facture'
    },
    en: {
      billingManager: 'Billing Manager',
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      payments: 'Payments',
      customers: 'Customers',
      reports: 'Reports',
      claims: 'Claims',
      settings: 'Settings',
      totalRevenue: 'Total Revenue',
      pendingInvoices: 'Pending Invoices',
      overdueAmount: 'Overdue Amount',
      collectionRate: 'Collection Rate',
      monthlyGrowth: 'Monthly Growth',
      newInvoice: 'New Invoice',
      recordPayment: 'Record Payment',
      generateReport: 'Generate Report',
      paymentReminders: 'Payment Reminders',
      search: 'Search...',
      filter: 'Filter',
      status: 'Status',
      all: 'All',
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      amount: 'Amount',
      date: 'Date',
      customer: 'Customer',
      invoiceNumber: 'Invoice Number'
    }
  } as const;

  const t = translations[language as keyof typeof translations];

  // Tab configuration with role-based access
  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: BarChart3, roles: ['ADMIN', 'SECRETARY', 'BIOLOGIST'] },
    { id: 'invoices', label: t.invoices, icon: FileText, roles: ['ADMIN', 'SECRETARY'] },
    { id: 'payments', label: t.payments, icon: CreditCard, roles: ['ADMIN', 'SECRETARY'] },
    { id: 'customers', label: t.customers, icon: Users, roles: ['ADMIN', 'SECRETARY'] },
    { id: 'claims', label: t.claims, icon: ClipboardList, roles: ['ADMIN', 'SECRETARY'] },
    { id: 'reports', label: t.reports, icon: BarChart3, roles: ['ADMIN', 'SECRETARY', 'BIOLOGIST'] },
    { id: 'settings', label: t.settings, icon: Settings, roles: ['ADMIN'] }
  ];

  const availableTabs = tabs.filter(tab => 
    tab.roles.includes(user?.role || 'GUEST')
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  // Dashboard Component
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalRevenue}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardStats.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 ml-1">
                  +{dashboardStats.monthlyGrowth}%
                </span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.pendingInvoices}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.pendingInvoices}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.overdueAmount}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardStats.overdueAmount)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.collectionRate}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.collectionRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => {setModalType('invoice'); setShowModal(true);}}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.newInvoice}</span>
          </button>
          <button 
            onClick={() => {setModalType('payment'); setShowModal(true);}}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.recordPayment}</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.generateReport}</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.paymentReminders}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Invoices Component
  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.invoices}</h2>
        <button 
          onClick={() => {setModalType('invoice'); setShowModal(true);}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.newInvoice}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t.all}</option>
            <option value="DRAFT">{t.draft}</option>
            <option value="SENT">{t.sent}</option>
            <option value="PAID">{t.paid}</option>
            <option value="OVERDUE">{t.overdue}</option>
            <option value="CANCELLED">{t.cancelled}</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.invoiceNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.customer}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.date}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices
                .filter(invoice => 
                  filterStatus === 'all' || invoice.status === filterStatus
                )
                .filter(invoice =>
                  searchTerm === '' || 
                  invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{invoice.customerName}</div>
                    {invoice.patientName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.patientName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.totalAmount)}
                    </div>
                    {invoice.paidAmount > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Payé: {formatCurrency(invoice.paidAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
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

  // Simple modal component
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {modalType === 'invoice' ? t.newInvoice : 
               modalType === 'payment' ? t.recordPayment : 
               'Modal'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {modalType === 'invoice' ? 'Formulaire de création de facture en cours de développement...' :
               modalType === 'payment' ? 'Formulaire d\'enregistrement de paiement en cours de développement...' :
               'Contenu du modal...'}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'invoices':
        return renderInvoices();
      case 'payments':
        return (
          <div className="space-y-6">
            {/* Payments Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.payments}</h2>
              <button 
                onClick={() => {setModalType('payment'); setShowModal(true);}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enregistrer Paiement
              </button>
            </div>

            {/* Payment Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher par client ou référence..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Toutes les méthodes</option>
                  <option value="CASH">Espèces</option>
                  <option value="BANK_TRANSFER">Virement</option>
                  <option value="CHECK">Chèque</option>
                  <option value="CREDIT_CARD">Carte de crédit</option>
                  <option value="INSURANCE_DIRECT">Assurance directe</option>
                </select>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paiements Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(15000)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(8500)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rappels Envoyés</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Recouvrement</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">87.5%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Méthode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      {
                        id: '1',
                        reference: 'PAY-2024-001',
                        customer: 'CNSS Maroc',
                        invoice: 'INV-2024-001',
                        amount: 1230,
                        method: 'BANK_TRANSFER',
                        date: '2024-01-20',
                        status: 'COMPLETED'
                      },
                      {
                        id: '2',
                        reference: 'PAY-2024-002',
                        customer: 'Ahmed Benali',
                        invoice: 'INV-2024-003',
                        amount: 450,
                        method: 'CASH',
                        date: '2024-01-21',
                        status: 'COMPLETED'
                      },
                      {
                        id: '3',
                        reference: 'PAY-2024-003',
                        customer: 'CNOPS',
                        invoice: 'INV-2024-004',
                        amount: 980,
                        method: 'CHECK',
                        date: '2024-01-22',
                        status: 'PENDING'
                      }
                    ].map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.reference}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{payment.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{payment.invoice}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {payment.method === 'BANK_TRANSFER' ? 'Virement' :
                             payment.method === 'CASH' ? 'Espèces' :
                             payment.method === 'CHECK' ? 'Chèque' :
                             payment.method === 'CREDIT_CARD' ? 'Carte' : payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {payment.status === 'COMPLETED' ? 'Terminé' :
                             payment.status === 'PENDING' ? 'En Attente' : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Voir">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400" title="Reçu">
                              <Download className="h-4 w-4" />
                            </button>
                            {payment.status === 'PENDING' && (
                              <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400" title="Rappel">
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Reminders Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rappels de Paiement</h3>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Envoyer Rappels
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { level: 'Premier Rappel', count: 8, days: '5 jours', color: 'yellow' },
                  { level: 'Deuxième Rappel', count: 4, days: '15 jours', color: 'orange' },
                  { level: 'Mise en Demeure', count: 2, days: '30 jours', color: 'red' }
                ].map((reminder, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{reminder.level}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reminder.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        reminder.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {reminder.count} factures
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">En retard de {reminder.days}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="space-y-6">
            <CustomerList />
          </div>
        );
      case 'claims':
        return (
          <div className="space-y-6">
            {/* Claims Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.claims}</h2>
              <button 
                onClick={() => {setModalType('claim'); setShowModal(true);}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Réclamation
              </button>
            </div>

            {/* Claims Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher par n° de réclamation ou client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="SUBMITTED">Soumise</option>
                  <option value="IN_REVIEW">En Cours de Traitement</option>
                  <option value="APPROVED">Approuvée</option>
                  <option value="REJECTED">Rejetée</option>
                  <option value="PAID">Payée</option>
                </select>
              </div>
            </div>

            {/* Claims Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Réclamations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvées</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">128</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(85000)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        N° Réclamation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Assurance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date Soumission
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      {
                        id: '1',
                        claimNumber: 'CLM-2024-001',
                        insurance: 'CNSS',
                        invoiceNumber: 'INV-2024-001',
                        amount: 1230,
                        status: 'APPROVED',
                        submittedDate: '2024-01-15'
                      },
                      {
                        id: '2',
                        claimNumber: 'CLM-2024-002',
                        insurance: 'CNOPS',
                        invoiceNumber: 'INV-2024-002',
                        amount: 980,
                        status: 'IN_REVIEW',
                        submittedDate: '2024-01-18'
                      },
                      {
                        id: '3',
                        claimNumber: 'CLM-2024-003',
                        insurance: 'RMA',
                        invoiceNumber: 'INV-2024-003',
                        amount: 750,
                        status: 'SUBMITTED',
                        submittedDate: '2024-01-20'
                      }
                    ].map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{claim.claimNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{claim.insurance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{claim.invoiceNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(claim.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            claim.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            claim.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            claim.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(claim.submittedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                              <Download className="h-4 w-4" />
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
      case 'reports':
        return (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.reports}</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exporter Rapport
              </button>
            </div>

            {/* Report Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de Rapport
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="revenue">Revenus</option>
                    <option value="expenses">Dépenses</option>
                    <option value="aging">Analyse d'âge</option>
                    <option value="customer">Par Client</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de Début
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de Fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Générer
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenus Mensuels</h3>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Graphique des revenus</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Clients</h3>
                <div className="space-y-3">
                  {[
                    { name: 'CNSS Maroc', amount: 45000, percentage: 65 },
                    { name: 'CNOPS', amount: 28000, percentage: 40 },
                    { name: 'Clients Particuliers', amount: 15000, percentage: 25 }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(client.amount)}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${client.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{client.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Résumé Financier</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Factures</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taux de Recouvrement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      { period: 'Janvier 2024', revenue: 25000, invoices: 45, rate: 92 },
                      { period: 'Février 2024', revenue: 28000, invoices: 52, rate: 88 },
                      { period: 'Mars 2024', revenue: 32000, invoices: 48, rate: 95 }
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.period}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.invoices}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings}</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enregistrer les Modifications
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax Configuration */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration des Taxes</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taux TVA (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timbre Fiscal (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="0.1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Retenue à la Source (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoApplyTax"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoApplyTax" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Appliquer automatiquement les taxes
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conditions de Paiement</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Délai de Paiement par Défaut (jours)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pénalités de Retard (% par jour)
                    </label>
                    <input
                      type="number"
                      defaultValue="0.05"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rappels de Paiement
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="auto">Automatiques</option>
                      <option value="manual">Manuels</option>
                      <option value="disabled">Désactivés</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Discount Rules */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Règles de Remise</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remise Maximum Autorisée (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remise Fidélité (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireApproval"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Approbation requise pour remises &gt; 10%
                    </label>
                  </div>
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres de Facturation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Préfixe Numéro de Facture
                    </label>
                    <input
                      type="text"
                      defaultValue="INV"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise par Défaut
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="MAD">Dirham Marocain (MAD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar Américain (USD)</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoSend"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoSend" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Envoi automatique des factures par email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeLogo"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeLogo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Inclure le logo sur les factures
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Notifications Email</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'newInvoice', label: 'Nouvelle facture créée' },
                      { id: 'paymentReceived', label: 'Paiement reçu' },
                      { id: 'overdueReminder', label: 'Rappel facture en retard' },
                      { id: 'claimApproved', label: 'Réclamation approuvée' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item.id}
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={item.id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Notifications SMS</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'smsPayment', label: 'Confirmation de paiement' },
                      { id: 'smsOverdue', label: 'Facture en retard' },
                      { id: 'smsReminder', label: 'Rappel de paiement' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item.id}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={item.id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentification requise</h3>
          <p className="text-gray-600 dark:text-gray-400">Veuillez vous connecter pour accéder au module de facturation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.billingManager}</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {availableTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default EnhancedBillingModule;