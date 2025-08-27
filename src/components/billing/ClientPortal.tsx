import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  FileText,
  CreditCard,
  Bell,
  Settings,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface ClientPortalProps {
  customerId?: string;
  onClose?: () => void;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  invoices: ClientInvoice[];
  payments: ClientPayment[];
  notifications: ClientNotification[];
  preferences: ClientPreferences;
}

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

interface ClientPayment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  invoiceNumber: string;
}

interface ClientNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  date: string;
  read: boolean;
}

interface ClientPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: 'fr' | 'en';
  currency: string;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ customerId, onClose }) => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    fr: {
      title: 'Portail Client',
      overview: 'Aperçu',
      invoices: 'Factures',
      payments: 'Paiements',
      notifications: 'Notifications',
      settings: 'Paramètres',
      welcome: 'Bienvenue',
      accountSummary: 'Résumé du Compte',
      totalInvoices: 'Total Factures',
      totalPaid: 'Total Payé',
      outstanding: 'En Attente',
      recentActivity: 'Activité Récente',
      viewAll: 'Voir Tout',
      
      // Invoice statuses
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      
      // Payment methods
      cash: 'Espèces',
      card: 'Carte',
      bankTransfer: 'Virement',
      check: 'Chèque',
      insurance: 'Assurance',
      
      // Actions
      view: 'Voir',
      download: 'Télécharger',
      pay: 'Payer',
      
      // Settings
      personalInfo: 'Informations Personnelles',
      preferences: 'Préférences',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      language: 'Langue',
      currency: 'Devise',
      save: 'Enregistrer',
      
      // Notifications
      markAsRead: 'Marquer comme lu',
      markAllAsRead: 'Tout marquer comme lu',
      noNotifications: 'Aucune notification',
      
      // Common
      amount: 'Montant',
      date: 'Date',
      status: 'Statut',
      method: 'Méthode',
      invoice: 'Facture',
      dueDate: 'Date d\'échéance',
      close: 'Fermer'
    },
    en: {
      title: 'Client Portal',
      overview: 'Overview',
      invoices: 'Invoices',
      payments: 'Payments',
      notifications: 'Notifications',
      settings: 'Settings',
      welcome: 'Welcome',
      accountSummary: 'Account Summary',
      totalInvoices: 'Total Invoices',
      totalPaid: 'Total Paid',
      outstanding: 'Outstanding',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      
      // Invoice statuses
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      
      // Payment methods
      cash: 'Cash',
      card: 'Card',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      insurance: 'Insurance',
      
      // Actions
      view: 'View',
      download: 'Download',
      pay: 'Pay',
      
      // Settings
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      language: 'Language',
      currency: 'Currency',
      save: 'Save',
      
      // Notifications
      markAsRead: 'Mark as read',
      markAllAsRead: 'Mark all as read',
      noNotifications: 'No notifications',
      
      // Common
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      method: 'Method',
      invoice: 'Invoice',
      dueDate: 'Due Date',
      close: 'Close'
    }
  } as const;

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadClientData();
  }, [customerId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockClientData: ClientData = {
        id: customerId || '1',
        name: 'Ahmed Benali',
        email: 'ahmed.benali@email.com',
        phone: '+212 6 12 34 56 78',
        address: '123 Rue Mohammed V, Casablanca',
        invoices: [
          {
            id: '1',
            invoiceNumber: 'INV-2024-001',
            amount: 450.00,
            status: 'SENT',
            dueDate: '2024-09-15',
            createdAt: '2024-08-15',
            items: [
              { description: 'Analyse sanguine complète', amount: 200.00 },
              { description: 'Test de glycémie', amount: 150.00 },
              { description: 'TVA (20%)', amount: 70.00 },
              { description: 'Timbre fiscal', amount: 30.00 }
            ]
          },
          {
            id: '2',
            invoiceNumber: 'INV-2024-002',
            amount: 320.00,
            status: 'PAID',
            dueDate: '2024-08-30',
            createdAt: '2024-08-10',
            items: [
              { description: 'Radiographie thoracique', amount: 250.00 },
              { description: 'TVA (20%)', amount: 50.00 },
              { description: 'Timbre fiscal', amount: 20.00 }
            ]
          }
        ],
        payments: [
          {
            id: '1',
            amount: 320.00,
            method: 'CARD',
            date: '2024-08-10',
            status: 'COMPLETED',
            invoiceNumber: 'INV-2024-002'
          }
        ],
        notifications: [
          {
            id: '1',
            type: 'warning',
            message: 'Votre facture INV-2024-001 arrive à échéance le 15 septembre 2024',
            date: '2024-08-25',
            read: false
          },
          {
            id: '2',
            type: 'success',
            message: 'Votre paiement pour la facture INV-2024-002 a été confirmé',
            date: '2024-08-10',
            read: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          language: 'fr',
          currency: 'MAD'
        }
      };

      setClientData(mockClientData);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-600';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: t.overview, icon: UserCircle },
    { id: 'invoices', label: t.invoices, icon: FileText },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Client data not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCircle className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.welcome}, {clientData.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{clientData.email}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
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

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.accountSummary}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {clientData.invoices.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalInvoices}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {clientData.payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)} MAD
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalPaid}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {clientData.invoices
                        .filter(inv => inv.status !== 'PAID')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toFixed(2)} MAD
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.outstanding}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentActivity}</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    {t.viewAll}
                  </button>
                </div>
                <div className="space-y-3">
                  {clientData.invoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.invoices}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.invoice}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.amount}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t.dueDate}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientData.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.amount.toFixed(2)} MAD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title={t.view}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400" title={t.download}>
                            <Download className="h-4 w-4" />
                          </button>
                          {invoice.status !== 'PAID' && (
                            <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400" title={t.pay}>
                              <CreditCard className="h-4 w-4" />
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
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.payments}</h2>
            <p className="text-gray-500 dark:text-gray-400">Payment history will be displayed here.</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.notifications}</h2>
            <p className="text-gray-500 dark:text-gray-400">Notifications will be displayed here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.settings}</h2>
            <p className="text-gray-500 dark:text-gray-400">Settings panel will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;