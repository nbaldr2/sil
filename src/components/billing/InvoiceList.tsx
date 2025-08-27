import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  Printer,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  items: InvoiceItem[];
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  analysisCode?: string;
}

interface InvoiceListProps {
  onInvoiceSelect?: (invoice: Invoice) => void;
  onCreateInvoice?: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onInvoiceSelect, onCreateInvoice }) => {
  const { language } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const translations = {
    fr: {
      title: 'Liste des Factures',
      createInvoice: 'Nouvelle Facture',
      search: 'Rechercher...',
      filterByStatus: 'Filtrer par statut',
      allStatuses: 'Tous les statuts',
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      invoiceNumber: 'N° Facture',
      patient: 'Patient',
      amount: 'Montant',
      status: 'Statut',
      dueDate: 'Date d\'échéance',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      print: 'Imprimer',
      export: 'Exporter',
      noInvoices: 'Aucune facture trouvée',
      total: 'Total',
      currency: 'MAD'
    },
    en: {
      title: 'Invoice List',
      createInvoice: 'New Invoice',
      search: 'Search...',
      filterByStatus: 'Filter by status',
      allStatuses: 'All statuses',
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      invoiceNumber: 'Invoice #',
      patient: 'Patient',
      amount: 'Amount',
      status: 'Status',
      dueDate: 'Due Date',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      print: 'Print',
      export: 'Export',
      noInvoices: 'No invoices found',
      total: 'Total',
      currency: 'MAD'
    }
 } as const;

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, sortBy, sortOrder]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          patientName: 'Ahmed Benali',
          patientId: 'PAT-001',
          amount: 450.00,
          currency: 'MAD',
          status: 'SENT',
          dueDate: '2024-09-15',
          createdAt: '2024-08-15',
          items: [
            {
              id: '1',
              description: 'Analyse sanguine complète',
              quantity: 1,
              unitPrice: 200.00,
              total: 200.00,
              analysisCode: 'CBC'
            },
            {
              id: '2',
              description: 'Test de glycémie',
              quantity: 1,
              unitPrice: 150.00,
              total: 150.00,
              analysisCode: 'GLU'
            }
          ],
          taxAmount: 70.00,
          totalAmount: 420.00
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          patientName: 'Fatima Zahra',
          patientId: 'PAT-002',
          amount: 320.00,
          currency: 'MAD',
          status: 'PAID',
          dueDate: '2024-08-30',
          createdAt: '2024-08-10',
          items: [
            {
              id: '3',
              description: 'Radiographie thoracique',
              quantity: 1,
              unitPrice: 250.00,
              total: 250.00,
              analysisCode: 'XRAY'
            }
          ],
          taxAmount: 50.00,
          totalAmount: 300.00,
          paymentMethod: 'Carte bancaire'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          patientName: 'Mohammed Alami',
          patientId: 'PAT-003',
          amount: 180.00,
          currency: 'MAD',
          status: 'OVERDUE',
          dueDate: '2024-08-01',
          createdAt: '2024-07-15',
          items: [
            {
              id: '4',
              description: 'Test d\'urine',
              quantity: 1,
              unitPrice: 120.00,
              total: 120.00,
              analysisCode: 'URINE'
            }
          ],
          taxAmount: 24.00,
          totalAmount: 144.00
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return t.draft;
      case 'SENT': return t.sent;
      case 'PAID': return t.paid;
      case 'OVERDUE': return t.overdue;
      case 'CANCELLED': return t.cancelled;
      default: return status;
    }
  };

  const handleInvoiceAction = (action: string, invoice: Invoice) => {
    switch (action) {
      case 'view':
        onInvoiceSelect?.(invoice);
        break;
      case 'edit':
        // Handle edit
        console.log('Edit invoice:', invoice.id);
        break;
      case 'delete':
        // Handle delete
        console.log('Delete invoice:', invoice.id);
        break;
      case 'print':
        // Handle print
        console.log('Print invoice:', invoice.id);
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
          onClick={onCreateInvoice}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t.createInvoice}
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
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="ALL">{t.allStatuses}</option>
            <option value="DRAFT">{t.draft}</option>
            <option value="SENT">{t.sent}</option>
            <option value="PAID">{t.paid}</option>
            <option value="OVERDUE">{t.overdue}</option>
            <option value="CANCELLED">{t.cancelled}</option>
          </select>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.invoiceNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.patient}
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
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{invoice.patientName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.totalAmount.toFixed(2)} {t.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(invoice.dueDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleInvoiceAction('view', invoice)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title={t.view}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleInvoiceAction('edit', invoice)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title={t.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleInvoiceAction('print', invoice)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title={t.print}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleInvoiceAction('delete', invoice)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t.noInvoices}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;