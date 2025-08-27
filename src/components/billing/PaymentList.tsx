import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHECK' | 'INSURANCE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  reference?: string;
  notes?: string;
  paymentDate: string;
  processedBy: string;
  createdAt: string;
}

interface PaymentListProps {
  onPaymentSelect?: (payment: Payment) => void;
  onCreatePayment?: () => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ onPaymentSelect, onCreatePayment }) => {
  const { language } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');

   const translations = {
    fr: {
      title: 'Liste des Paiements',
      recordPayment: 'Enregistrer Paiement',
      search: 'Rechercher...',
      filterByStatus: 'Filtrer par statut',
      filterByMethod: 'Filtrer par méthode',
      filterByDate: 'Filtrer par date',
      allStatuses: 'Tous les statuts',
      allMethods: 'Toutes les méthodes',
      allDates: 'Toutes les dates',
      today: 'Aujourd\'hui',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      pending: 'En attente',
      completed: 'Terminé',
      failed: 'Échoué',
      refunded: 'Remboursé',
      cash: 'Espèces',
      card: 'Carte',
      bankTransfer: 'Virement',
      check: 'Chèque',
      insurance: 'Assurance',
      paymentNumber: 'N° Paiement',
      invoice: 'Facture',
      patient: 'Patient',
      amount: 'Montant',
      method: 'Méthode',
      status: 'Statut',
      date: 'Date',
      processedBy: 'Traité par',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      noPayments: 'Aucun paiement trouvé',
      currency: 'MAD',
      reference: 'Référence',
      transactionId: 'ID Transaction'
    },
    en: {
      title: 'Payment List',
      recordPayment: 'Record Payment',
      search: 'Search...',
      filterByStatus: 'Filter by status',
      filterByMethod: 'Filter by method',
      filterByDate: 'Filter by date',
      allStatuses: 'All statuses',
      allMethods: 'All methods',
      allDates: 'All dates',
      today: 'Today',
      thisWeek: 'This week',
      thisMonth: 'This month',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
      cash: 'Cash',
      card: 'Card',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      insurance: 'Insurance',
      paymentNumber: 'Payment #',
      invoice: 'Invoice',
      patient: 'Patient',
      amount: 'Amount',
      method: 'Method',
      status: 'Status',
      date: 'Date',
      processedBy: 'Processed By',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      noPayments: 'No payments found',
      currency: 'MAD',
      reference: 'Reference',
      transactionId: 'Transaction ID'
    }
 } as const;

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadPayments();
  }, [statusFilter, methodFilter, dateRange]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: '1',
          paymentNumber: 'PAY-2024-001',
          invoiceId: '2',
          invoiceNumber: 'INV-2024-002',
          patientName: 'Fatima Zahra',
          amount: 300.00,
          currency: 'MAD',
          paymentMethod: 'CARD',
          status: 'COMPLETED',
          transactionId: 'TXN-ABC123456',
          reference: 'CARD-****1234',
          paymentDate: '2024-08-10',
          processedBy: 'Secretary User',
          createdAt: '2024-08-10'
        },
        {
          id: '2',
          paymentNumber: 'PAY-2024-002',
          invoiceId: '1',
          invoiceNumber: 'INV-2024-001',
          patientName: 'Ahmed Benali',
          amount: 200.00,
          currency: 'MAD',
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          paymentDate: '2024-08-15',
          processedBy: 'Admin User',
          createdAt: '2024-08-15'
        },
        {
          id: '3',
          paymentNumber: 'PAY-2024-003',
          invoiceId: '3',
          invoiceNumber: 'INV-2024-003',
          patientName: 'Mohammed Alami',
          amount: 144.00,
          currency: 'MAD',
          paymentMethod: 'INSURANCE',
          status: 'PENDING',
          reference: 'CNSS-CLAIM-789',
          paymentDate: '2024-08-20',
          processedBy: 'Secretary User',
          createdAt: '2024-08-20'
        },
        {
          id: '4',
          paymentNumber: 'PAY-2024-004',
          invoiceId: '4',
          invoiceNumber: 'INV-2024-004',
          patientName: 'Aicha Bennani',
          amount: 180.00,
          currency: 'MAD',
          paymentMethod: 'BANK_TRANSFER',
          status: 'COMPLETED',
          transactionId: 'WIRE-XYZ789012',
          reference: 'BMCE-REF-456',
          paymentDate: '2024-08-18',
          processedBy: 'Admin User',
          createdAt: '2024-08-18'
        },
        {
          id: '5',
          paymentNumber: 'PAY-2024-005',
          invoiceId: '5',
          invoiceNumber: 'INV-2024-005',
          patientName: 'Youssef Tazi',
          amount: 75.00,
          currency: 'MAD',
          paymentMethod: 'CHECK',
          status: 'FAILED',
          reference: 'CHECK-001234',
          notes: 'Chèque sans provision',
          paymentDate: '2024-08-22',
          processedBy: 'Secretary User',
          createdAt: '2024-08-22'
        }
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || payment.paymentMethod === methodFilter;
    
    // Date filtering logic would go here
    const matchesDate = dateRange === 'ALL'; // Simplified for now
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      case 'REFUNDED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return t.pending;
      case 'COMPLETED': return t.completed;
      case 'FAILED': return t.failed;
      case 'REFUNDED': return t.refunded;
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'CASH': return t.cash;
      case 'CARD': return t.card;
      case 'BANK_TRANSFER': return t.bankTransfer;
      case 'CHECK': return t.check;
      case 'INSURANCE': return t.insurance;
      default: return method;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Banknote className="h-4 w-4" />;
      case 'CARD': return <CreditCard className="h-4 w-4" />;
      case 'BANK_TRANSFER': return <Banknote className="h-4 w-4" />;
      case 'CHECK': return <Banknote className="h-4 w-4" />;
      case 'INSURANCE': return <Banknote className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const handlePaymentAction = (action: string, payment: Payment) => {
    switch (action) {
      case 'view':
        onPaymentSelect?.(payment);
        break;
      case 'edit':
        // Handle edit
        console.log('Edit payment:', payment.id);
        break;
      case 'delete':
        // Handle delete
        console.log('Delete payment:', payment.id);
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
          onClick={onCreatePayment}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t.recordPayment}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="ALL">{t.allStatuses}</option>
          <option value="PENDING">{t.pending}</option>
          <option value="COMPLETED">{t.completed}</option>
          <option value="FAILED">{t.failed}</option>
          <option value="REFUNDED">{t.refunded}</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="ALL">{t.allMethods}</option>
          <option value="CASH">{t.cash}</option>
          <option value="CARD">{t.card}</option>
          <option value="BANK_TRANSFER">{t.bankTransfer}</option>
          <option value="CHECK">{t.check}</option>
          <option value="INSURANCE">{t.insurance}</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="ALL">{t.allDates}</option>
          <option value="TODAY">{t.today}</option>
          <option value="WEEK">{t.thisWeek}</option>
          <option value="MONTH">{t.thisMonth}</option>
        </select>
      </div>

      {/* Payment Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.paymentNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.invoice}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.patient}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.method}
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Banknote className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.paymentNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{payment.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{payment.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.amount.toFixed(2)} {t.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(payment.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {getMethodText(payment.paymentMethod)}
                      </span>
                    </div>
                    {payment.reference && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{payment.reference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{getStatusText(payment.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(payment.paymentDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handlePaymentAction('view', payment)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title={t.view}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePaymentAction('edit', payment)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title={t.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePaymentAction('delete', payment)}
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

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <Banknote className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t.noPayments}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;