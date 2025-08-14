import  React, { useState } from 'react';
import { Plus, Download, Eye, Send, X } from 'lucide-react';
import { useAuth } from '../App';

interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  payer: string;
  date: string;
}

export default function BillingModule() {
  const { language } = useAuth();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const t = {
    fr: {
      title: 'Module de Facturation',
      newInvoice: 'Nouvelle Facture',
      invoice: 'Facture',
      patient: 'Patient',
      amount: 'Montant',
      status: 'Statut',
      payer: 'Payeur',
      date: 'Date',
      actions: 'Actions',
      export: 'Exporter',
      close: 'Fermer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      send: 'Envoyer'
    },
    en: {
      title: 'Billing Module',
      newInvoice: 'New Invoice',
      invoice: 'Invoice',
      patient: 'Patient',
      amount: 'Amount',
      status: 'Status',
      payer: 'Payer',
      date: 'Date',
      actions: 'Actions',
      export: 'Export',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      send: 'Send'
    }
  }[language];

  const [invoices] = useState<Invoice[]>([
    {
      id: 'FAC001',
      patientName: 'Dupont, Marie',
      amount: 125.50,
      status: 'paid',
      payer: 'CPAM',
      date: '2024-01-15'
    },
    {
      id: 'FAC002',
      patientName: 'Martin, Pierre',
      amount: 89.20,
      status: 'sent',
      payer: 'MGEN',
      date: '2024-01-14'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleSend = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id);
  };

  const handleExport = () => {
    console.log('Exporting invoices...');
  };

  const NewInvoiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.newInvoice}</h3>
          <button onClick={() => setShowNewModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du patient"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Montant"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Sélectionner payeur</option>
            <option>CPAM</option>
            <option>MGEN</option>
            <option>Harmonie</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );

  const ViewInvoiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de la facture</h3>
          <button onClick={() => setShowViewModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedInvoice && (
          <div className="space-y-3">
            <div><strong>ID:</strong> {selectedInvoice.id}</div>
            <div><strong>Patient:</strong> {selectedInvoice.patientName}</div>
            <div><strong>Montant:</strong> dh{selectedInvoice.amount}</div>
            <div><strong>Statut:</strong> {selectedInvoice.status}</div>
            <div><strong>Payeur:</strong> {selectedInvoice.payer}</div>
            <div><strong>Date:</strong> {selectedInvoice.date}</div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={20} className="mr-2" />
            {t.export}
          </button>
          <button 
            onClick={() => setShowNewModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            {t.newInvoice}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.invoice}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.patient}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.amount}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.payer}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.date}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{invoice.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">dh{invoice.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{invoice.payer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleView(invoice)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleSend(invoice)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Send size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && <NewInvoiceModal />}
      {showViewModal && <ViewInvoiceModal />}
    </div>
  );
}
 