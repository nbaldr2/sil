import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Download, RefreshCw, DollarSign, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceNumber: string;
  status: 'DRAFT' | 'ISSUED' | 'APPLIED' | 'CANCELLED';
  reason: string;
  customerName: string;
  creditAmount: number;
  remainingCredit: number;
  issueDate: string;
}

interface RefundTransaction {
  id: string;
  refundNumber: string;
  creditNoteId: string;
  paymentMethod: string;
  amount: number;
  refundDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

const CreditNotesManager: React.FC = () => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<'credit-notes' | 'refunds'>('credit-notes');
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const translations = {
    fr: {
      title: 'Gestion des Avoirs et Remboursements',
      creditNotes: 'Notes de Crédit',
      refunds: 'Remboursements',
      search: 'Rechercher...',
      createCreditNote: 'Créer Avoir',
      processRefund: 'Traiter Remboursement',
      totalCreditIssued: 'Total Avoirs Émis',
      totalRefundsProcessed: 'Total Remboursements',
      actions: 'Actions'
    },
    en: {
      title: 'Credit Notes and Refunds Management',
      creditNotes: 'Credit Notes',
      refunds: 'Refunds',
      search: 'Search...',
      createCreditNote: 'Create Credit Note',
      processRefund: 'Process Refund',
      totalCreditIssued: 'Total Credit Issued',
      totalRefundsProcessed: 'Total Refunds Processed',
      actions: 'Actions'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Mock data
    setCreditNotes([
      {
        id: '1',
        creditNoteNumber: 'CN-2024-001',
        originalInvoiceNumber: 'INV-2024-001',
        status: 'ISSUED',
        reason: 'Test annulé',
        customerName: 'Ahmed Benali',
        creditAmount: 150,
        remainingCredit: 150,
        issueDate: '2024-03-15'
      }
    ]);

    setRefunds([
      {
        id: '1',
        refundNumber: 'REF-2024-001',
        creditNoteId: '1',
        paymentMethod: 'Virement',
        amount: 150,
        refundDate: '2024-03-16',
        status: 'COMPLETED'
      }
    ]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ISSUED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      APPLIED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalCredit = creditNotes.reduce((sum, note) => sum + note.creditAmount, 0);
  const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalCreditIssued}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCredit)}</p>
          </div>
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalRefundsProcessed}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRefunds)}</p>
          </div>
          <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
    </div>
  );

  const renderCreditNotesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.creditNotes}</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.createCreditNote}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">N° Avoir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Facture Originale</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Motif</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {creditNotes.map((note) => (
              <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{note.creditNoteNumber}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(note.issueDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                  {note.originalInvoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900 dark:text-white">{note.customerName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {note.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(note.creditAmount)}
                  </div>
                  {note.remainingCredit > 0 && (
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">
                      Restant: {formatCurrency(note.remainingCredit)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(note.status)}`}>
                    {note.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400">
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
  );

  const renderRefundsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.refunds}</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.processRefund}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">N° Remboursement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {refunds.map((refund) => (
              <tr key={refund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {refund.refundNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {refund.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(refund.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(refund.refundDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(refund.status)}`}>
                    {refund.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400">
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
              { id: 'credit-notes', label: t.creditNotes, icon: FileText },
              { id: 'refunds', label: t.refunds, icon: RefreshCw }
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
        {activeTab === 'credit-notes' && renderCreditNotesTab()}
        {activeTab === 'refunds' && renderRefundsTab()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t.createCreditNote}
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
                Formulaire en cours de développement...
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

export default CreditNotesManager;