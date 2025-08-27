import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BillingService } from '../../services/billingService';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  cnssNumber?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  customerName: string;
}

interface BillingHistory {
  patient: Patient;
  invoices: Invoice[];
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  lastVisit: string;
}

const PatientBillingHistory: React.FC = () => {
  const { language, theme } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const translations = {
    fr: {
      title: 'Historique de Facturation des Patients',
      searchPatient: 'Rechercher un patient...',
      selectPatient: 'Sélectionner un patient',
      patientInfo: 'Informations du Patient',
      billingOverview: 'Aperçu de la Facturation',
      invoiceHistory: 'Historique des Factures',
      totalBilled: 'Total Facturé',
      totalPaid: 'Total Payé',
      totalOutstanding: 'Total en Attente',
      lastVisit: 'Dernière Visite',
      invoiceNumber: 'N° Facture',
      issueDate: 'Date d\'Émission',
      amount: 'Montant',
      status: 'Statut',
      actions: 'Actions',
      noPatientSelected: 'Aucun patient sélectionné',
      noInvoicesFound: 'Aucune facture trouvée',
      dateRange: 'Plage de Dates',
      exportHistory: 'Exporter l\'Historique',
      paymentHistory: 'Historique des Paiements',
      viewInvoice: 'Voir Facture',
      downloadPdf: 'Télécharger PDF'
    },
    en: {
      title: 'Patient Billing History',
      searchPatient: 'Search patient...',
      selectPatient: 'Select a patient',
      patientInfo: 'Patient Information',
      billingOverview: 'Billing Overview',
      invoiceHistory: 'Invoice History',
      totalBilled: 'Total Billed',
      totalPaid: 'Total Paid',
      totalOutstanding: 'Total Outstanding',
      lastVisit: 'Last Visit',
      invoiceNumber: 'Invoice Number',
      issueDate: 'Issue Date',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      noPatientSelected: 'No patient selected',
      noInvoicesFound: 'No invoices found',
      dateRange: 'Date Range',
      exportHistory: 'Export History',
      paymentHistory: 'Payment History',
      viewInvoice: 'View Invoice',
      downloadPdf: 'Download PDF'
    }
  } as const;

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cnssNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would call a patient service
      const mockPatients: Patient[] = [
        {
          id: '1',
          firstName: 'Ahmed',
          lastName: 'Benali',
          dateOfBirth: '1985-05-15',
          gender: 'M',
          phone: '+212661234567',
          email: 'ahmed.benali@email.com',
          cnssNumber: 'CNSS12345'
        },
        {
          id: '2',
          firstName: 'Fatima',
          lastName: 'El Mansouri',
          dateOfBirth: '1990-08-22',
          gender: 'F',
          phone: '+212662345678',
          email: 'fatima.mansouri@email.com',
          cnssNumber: 'CNSS23456'
        },
        {
          id: '3',
          firstName: 'Mohamed',
          lastName: 'Alami',
          dateOfBirth: '1978-12-10',
          gender: 'M',
          phone: '+212663456789',
          cnssNumber: 'CNSS34567'
        }
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientBillingHistory = async (patient: Patient) => {
    try {
      setLoading(true);
      setSelectedPatient(patient);
      
      // Simulate API call - in real implementation, this would call BillingService
      const mockHistory: BillingHistory = {
        patient,
        invoices: [
          {
            id: '1',
            invoiceNumber: 'INV-2024-001',
            issueDate: '2024-01-15',
            dueDate: '2024-02-14',
            totalAmount: 450,
            paidAmount: 450,
            balanceAmount: 0,
            status: 'PAID',
            customerName: 'CNSS Maroc'
          },
          {
            id: '2',
            invoiceNumber: 'INV-2024-055',
            issueDate: '2024-02-20',
            dueDate: '2024-03-21',
            totalAmount: 680,
            paidAmount: 340,
            balanceAmount: 340,
            status: 'PARTIAL_PAID',
            customerName: 'Patient Particulier'
          },
          {
            id: '3',
            invoiceNumber: 'INV-2024-089',
            issueDate: '2024-03-10',
            dueDate: '2024-04-09',
            totalAmount: 320,
            paidAmount: 0,
            balanceAmount: 320,
            status: 'SENT',
            customerName: 'CNOPS'
          }
        ],
        totalBilled: 1450,
        totalPaid: 790,
        totalOutstanding: 660,
        lastVisit: '2024-03-10'
      };
      
      setBillingHistory(mockHistory);
    } catch (error) {
      console.error('Error loading patient billing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PARTIAL_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PARTIAL_PAID':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.selectPatient}
              </h2>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={t.searchPatient}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchTerm && filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => loadPatientBillingHistory(patient)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.cnssNumber || patient.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {searchTerm && filteredPatients.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">Aucun patient trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billing History Panel */}
          <div className="lg:col-span-3">
            {!selectedPatient ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-8 text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t.noPatientSelected}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Utilisez la recherche pour sélectionner un patient et voir son historique de facturation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {t.patientInfo}
                    </h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t.exportHistory}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom Complet</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de Naissance</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CNSS</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.cnssNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Billing Overview */}
                {billingHistory && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t.billingOverview}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {t.totalBilled}
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(billingHistory.totalBilled)}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              {t.totalPaid}
                            </p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {formatCurrency(billingHistory.totalPaid)}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                              {t.totalOutstanding}
                            </p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                              {formatCurrency(billingHistory.totalOutstanding)}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              {t.lastVisit}
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                              {new Date(billingHistory.lastVisit).toLocaleDateString()}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice History */}
                {billingHistory && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t.invoiceHistory}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          />
                          <span className="text-gray-500">à</span>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.invoiceNumber}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.issueDate}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Payeur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.amount}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.status}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.actions}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {billingHistory.invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {invoice.invoiceNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(invoice.issueDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {invoice.customerName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(invoice.totalAmount)}
                                </div>
                                {invoice.paidAmount > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Payé: {formatCurrency(invoice.paidAmount)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(invoice.status)}
                                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title={t.viewInvoice}>
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900 dark:text-green-400" title={t.downloadPdf}>
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {billingHistory.invoices.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{t.noInvoicesFound}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBillingHistory;