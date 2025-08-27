import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Settings,
  CheckCircle
} from 'lucide-react';

interface ReminderRule {
  id: string;
  name: string;
  daysBefore: number;
  method: 'EMAIL' | 'SMS' | 'BOTH';
  isActive: boolean;
  template: string;
}

interface ReminderHistory {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: string;
  sentDate: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED';
  reminderLevel: number;
}

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  lastReminderSent?: string;
}

const PaymentReminderSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'history' | 'templates'>('dashboard');
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [reminderHistory, setReminderHistory] = useState<ReminderHistory[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock reminder rules
    setReminderRules([
      {
        id: '1',
        name: 'Rappel 1 semaine avant',
        daysBefore: 7,
        method: 'EMAIL',
        isActive: true,
        template: 'Votre facture {{invoice_number}} arrive à échéance dans {{days}} jours.'
      },
      {
        id: '2',
        name: 'Rappel jour J',
        daysBefore: 0,
        method: 'BOTH',
        isActive: true,
        template: 'Votre facture {{invoice_number}} est due aujourd\'hui.'
      },
      {
        id: '3',
        name: 'Rappel retard 1 semaine',
        daysBefore: -7,
        method: 'SMS',
        isActive: true,
        template: 'Votre facture {{invoice_number}} est en retard de {{days}} jours.'
      }
    ]);

    // Mock overdue invoices
    setOverdueInvoices([
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerName: 'Ahmed Benali',
        customerEmail: 'ahmed@email.com',
        customerPhone: '+212661234567',
        amount: 450,
        dueDate: '2024-03-01',
        daysOverdue: 15,
        lastReminderSent: '2024-03-10'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-025',
        customerName: 'Société ABC',
        customerEmail: 'contact@abc.ma',
        amount: 1250,
        dueDate: '2024-03-05',
        daysOverdue: 11
      }
    ]);

    // Mock reminder history
    setReminderHistory([
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerName: 'Ahmed Benali',
        amount: 450,
        method: 'EMAIL',
        sentDate: '2024-03-10',
        status: 'DELIVERED',
        reminderLevel: 1
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-025',
        customerName: 'Société ABC',
        amount: 1250,
        method: 'SMS',
        sentDate: '2024-03-12',
        status: 'SENT',
        reminderLevel: 1
      }
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      OPENED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[status as keyof typeof colors] || colors.SENT;
  };

  const sendReminder = async (invoiceIds: string[], method: 'EMAIL' | 'SMS' | 'BOTH') => {
    console.log('Sending reminders for invoices:', invoiceIds, 'via', method);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Rappels envoyés pour ${invoiceIds.length} facture(s) via ${method}`);
  };

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const avgDaysOverdue = overdueInvoices.length > 0 
    ? overdueInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / overdueInvoices.length 
    : 0;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Factures en Retard</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueInvoices.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant en Retard</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalOverdue)}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rappels Envoyés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reminderHistory.length}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Retard Moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgDaysOverdue)} jours</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Overdue Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Factures en Retard - Action Requise
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => sendReminder(selectedInvoices, 'EMAIL')}
                disabled={selectedInvoices.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email ({selectedInvoices.length})
              </button>
              <button
                onClick={() => sendReminder(selectedInvoices, 'SMS')}
                disabled={selectedInvoices.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS ({selectedInvoices.length})
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoices(overdueInvoices.map(inv => inv.id));
                      } else {
                        setSelectedInvoices([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Retard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dernier Rappel</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {overdueInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(prev => [...prev, invoice.id]);
                        } else {
                          setSelectedInvoices(prev => prev.filter(id => id !== invoice.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{invoice.customerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {invoice.customerEmail && (
                        <span className="inline-flex items-center mr-3">
                          <Mail className="h-3 w-3 mr-1" />
                          {invoice.customerEmail}
                        </span>
                      )}
                      {invoice.customerPhone && (
                        <span className="inline-flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {invoice.customerPhone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.daysOverdue > 30 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      invoice.daysOverdue > 14 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    }`}>
                      {invoice.daysOverdue} jours
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.lastReminderSent 
                      ? new Date(invoice.lastReminderSent).toLocaleDateString()
                      : 'Aucun'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Règles de Rappel</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Nouvelle Règle
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reminderRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {rule.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {rule.daysBefore > 0 ? `${rule.daysBefore} jours avant` :
                   rule.daysBefore === 0 ? 'Le jour J' :
                   `${Math.abs(rule.daysBefore)} jours après`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {rule.method === 'EMAIL' && <Mail className="h-4 w-4 text-blue-600 mr-2" />}
                    {rule.method === 'SMS' && <MessageSquare className="h-4 w-4 text-green-600 mr-2" />}
                    {rule.method === 'BOTH' && (
                      <>
                        <Mail className="h-4 w-4 text-blue-600 mr-1" />
                        <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                      </>
                    )}
                    <span className="text-sm text-gray-900 dark:text-white">{rule.method}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {rule.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                    Modifier
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historique des Rappels</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Facture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date Envoi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reminderHistory.map((reminder) => (
              <tr key={reminder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                  {reminder.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {reminder.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(reminder.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {reminder.method === 'EMAIL' && <Mail className="h-4 w-4 text-blue-600 mr-2" />}
                    {reminder.method === 'SMS' && <MessageSquare className="h-4 w-4 text-green-600 mr-2" />}
                    <span className="text-sm text-gray-900 dark:text-white">{reminder.method}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(reminder.sentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reminder.status)}`}>
                    {reminder.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Système de Rappels de Paiement</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de Bord', icon: Bell },
              { id: 'rules', label: 'Règles', icon: Settings },
              { id: 'history', label: 'Historique', icon: Clock }
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default PaymentReminderSystem;