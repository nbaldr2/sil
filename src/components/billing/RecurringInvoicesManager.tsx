import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RecurringInvoice {
  id: string;
  templateName: string;
  customerId: string;
  customerName: string;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  frequency: number; // Every X periods
  startDate: string;
  endDate?: string;
  nextInvoiceDate: string;
  lastGeneratedDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  generatedCount: number;
  maxGenerations?: number;
  description: string;
  items: RecurringInvoiceItem[];
}

interface RecurringInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface GeneratedInvoice {
  id: string;
  recurringInvoiceId: string;
  invoiceNumber: string;
  generatedDate: string;
  totalAmount: number;
  status: string;
}

const RecurringInvoicesManager: React.FC = () => {
  const { language } = useAuth();
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [generatedInvoices, setGeneratedInvoices] = useState<GeneratedInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'generated'>('templates');

  const translations = {
    fr: {
      title: 'Factures Récurrentes',
      templates: 'Modèles Récurrents',
      generated: 'Factures Générées',
      search: 'Rechercher...',
      createTemplate: 'Créer Modèle',
      templateName: 'Nom du Modèle',
      customer: 'Client',
      recurrence: 'Récurrence',
      nextInvoice: 'Prochaine Facture',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      paused: 'En Pause',
      completed: 'Terminé',
      cancelled: 'Annulé',
      all: 'Tous',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      activeTemplates: 'Modèles Actifs',
      totalGenerated: 'Total Généré',
      nextDue: 'Prochaines Échéances',
      avgAmount: 'Montant Moyen'
    },
    en: {
      title: 'Recurring Invoices',
      templates: 'Recurring Templates',
      generated: 'Generated Invoices',
      search: 'Search...',
      createTemplate: 'Create Template',
      templateName: 'Template Name',
      customer: 'Customer',
      recurrence: 'Recurrence',
      nextInvoice: 'Next Invoice',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      cancelled: 'Cancelled',
      all: 'All',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      activeTemplates: 'Active Templates',
      totalGenerated: 'Total Generated',
      nextDue: 'Next Due',
      avgAmount: 'Avg Amount'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data
    const mockRecurringInvoices: RecurringInvoice[] = [
      {
        id: '1',
        templateName: 'Contrat CNSS Mensuel',
        customerId: 'cust-001',
        customerName: 'CNSS Maroc',
        recurrenceType: 'MONTHLY',
        frequency: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        nextInvoiceDate: '2024-04-01',
        lastGeneratedDate: '2024-03-01',
        status: 'ACTIVE',
        totalAmount: 15000,
        currency: 'MAD',
        generatedCount: 3,
        maxGenerations: 12,
        description: 'Facturation mensuelle des analyses CNSS',
        items: [
          {
            id: '1',
            description: 'Analyses de laboratoire - Package mensuel',
            quantity: 1,
            unitPrice: 15000,
            taxRate: 20
          }
        ]
      },
      {
        id: '2',
        templateName: 'Maintenance Trimestrielle',
        customerId: 'cust-002',
        customerName: 'Laboratoire Partenaire',
        recurrenceType: 'QUARTERLY',
        frequency: 1,
        startDate: '2024-01-01',
        nextInvoiceDate: '2024-04-01',
        lastGeneratedDate: '2024-01-01',
        status: 'ACTIVE',
        totalAmount: 5000,
        currency: 'MAD',
        generatedCount: 1,
        description: 'Maintenance trimestrielle équipements',
        items: []
      }
    ];

    const mockGeneratedInvoices: GeneratedInvoice[] = [
      {
        id: '1',
        recurringInvoiceId: '1',
        invoiceNumber: 'INV-REC-2024-001',
        generatedDate: '2024-03-01',
        totalAmount: 15000,
        status: 'PAID'
      },
      {
        id: '2',
        recurringInvoiceId: '1',
        invoiceNumber: 'INV-REC-2024-002',
        generatedDate: '2024-02-01',
        totalAmount: 15000,
        status: 'PAID'
      }
    ];

    setRecurringInvoices(mockRecurringInvoices);
    setGeneratedInvoices(mockGeneratedInvoices);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRecurrenceLabel = (type: string, frequency: number) => {
    const labels = {
      DAILY: frequency === 1 ? t.daily : `Tous les ${frequency} jours`,
      WEEKLY: frequency === 1 ? t.weekly : `Toutes les ${frequency} semaines`,
      MONTHLY: frequency === 1 ? t.monthly : `Tous les ${frequency} mois`,
      QUARTERLY: frequency === 1 ? t.quarterly : `Tous les ${frequency} trimestres`,
      YEARLY: frequency === 1 ? t.yearly : `Tous les ${frequency} ans`
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDaysUntilNext = (nextDate: string) => {
    const next = new Date(nextDate);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTemplates = recurringInvoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = recurringInvoices.filter(ri => ri.status === 'ACTIVE').length;
  const totalGenerated = generatedInvoices.length;
  const nextDueCount = recurringInvoices.filter(ri => getDaysUntilNext(ri.nextInvoiceDate) <= 7).length;
  const avgAmount = recurringInvoices.length > 0 
    ? recurringInvoices.reduce((sum, ri) => sum + ri.totalAmount, 0) / recurringInvoices.length 
    : 0;

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.activeTemplates}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
          </div>
          <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalGenerated}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGenerated}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.nextDue}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{nextDueCount}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.avgAmount}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgAmount)}</p>
          </div>
          <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.templates}</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.createTemplate}
        </button>
      </div>

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
            <option value="ACTIVE">{t.active}</option>
            <option value="PAUSED">{t.paused}</option>
            <option value="COMPLETED">{t.completed}</option>
            <option value="CANCELLED">{t.cancelled}</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.templateName}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.customer}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.recurrence}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.nextInvoice}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.status}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTemplates.map((template) => {
              const daysUntilNext = getDaysUntilNext(template.nextInvoiceDate);
              
              return (
                <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{template.templateName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {template.generatedCount}/{template.maxGenerations || '∞'} généré(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {template.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getRecurrenceLabel(template.recurrenceType, template.frequency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(template.nextInvoiceDate).toLocaleDateString()}
                    </div>
                    <div className={`text-sm ${
                      daysUntilNext <= 0 ? 'text-red-600 dark:text-red-400' :
                      daysUntilNext <= 7 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {daysUntilNext <= 0 ? 'En retard' :
                       daysUntilNext === 1 ? 'Demain' :
                       `Dans ${daysUntilNext} jours`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(template.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                        <Edit className="h-4 w-4" />
                      </button>
                      {template.status === 'ACTIVE' ? (
                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400">
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : template.status === 'PAUSED' ? (
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                          <Play className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGeneratedTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.generated}</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">N° Facture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Modèle Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date Génération</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.status}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {generatedInvoices.map((invoice) => {
              const template = recurringInvoices.find(ri => ri.id === invoice.recurringInvoiceId);
              
              return (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {template?.templateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invoice.generatedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'templates', label: t.templates, icon: RefreshCw },
              { id: 'generated', label: t.generated, icon: CheckCircle }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStatsCards()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'generated' && renderGeneratedTab()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t.createTemplate}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Formulaire de création de modèle récurrent en cours de développement...
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringInvoicesManager;