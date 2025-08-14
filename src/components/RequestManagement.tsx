import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, X, Filter, Download, Printer, RefreshCw, Clock, AlertTriangle, CheckCircle, FileText, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../App';
import { requestsService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';

interface Request {
  id: string;
  patientId: string;
  doctorId?: string;
  status: string;
  priority: string;
  sampleType: string;
  tubeType?: string;
  collectionDate?: string;
  collectionTime?: string;
  notes?: string;
  totalAmount: number;
  discount: number;
  advancePayment: number;
  amountDue: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    cnssNumber?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  requestAnalyses?: Array<{
    id: string;
    analysisId: string;
    price: number;
    analysis: {
      id: string;
      code: string;
      name: string;
      category: string;
    };
  }>;
}

export default function RequestManagement() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  const t = {
    fr: {
      title: 'Gestion des Demandes',
      newRequest: 'Nouvelle Demande',
      search: 'Rechercher...',
      id: 'ID',
      patient: 'Patient',
      tests: 'Analyses',
      status: 'Statut',
      priority: 'Priorité',
      sampleType: 'Type d\'échantillon',
      date: 'Date',
      actions: 'Actions',
      close: 'Fermer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      refresh: 'Actualiser',
      export: 'Exporter',
      print: 'Imprimer',
      filter: 'Filtrer',
      allStatuses: 'Tous les statuts',
      allPriorities: 'Toutes priorités',
      itemsPerPage: 'Éléments par page',
      page: 'Page',
      of: 'sur',
      previous: 'Précédent',
      next: 'Suivant',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette demande?',
      viewResults: 'Voir résultats',
      enterResults: 'Saisir résultats',
      validateResults: 'Valider résultats',
      printReport: 'Imprimer rapport',
      created: 'Créé',
      pending: 'En attente',
      processing: 'En traitement',
      completed: 'Terminé',
      cancelled: 'Annulé',
      normal: 'Normal',
      urgent: 'Urgent',
      emergency: 'Urgence',
      paymentStatus: 'Statut paiement',
      paid: 'Payé',
      partiallyPaid: 'Partiellement payé',
      unpaid: 'Non payé',
      totalAmount: 'Montant total',
      amountDue: 'Montant dû',
      doctor: 'Médecin',
      collectionDate: 'Date de prélèvement',
      collectionTime: 'Heure de prélèvement',
      notes: 'Notes',
      createdAt: 'Créé le',
      updatedAt: 'Mis à jour le'
    },
    en: {
      title: 'Request Management',
      newRequest: 'New Request',
      search: 'Search...',
      id: 'ID',
      patient: 'Patient',
      tests: 'Tests',
      status: 'Status',
      priority: 'Priority',
      sampleType: 'Sample Type',
      date: 'Date',
      actions: 'Actions',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      refresh: 'Refresh',
      export: 'Export',
      print: 'Print',
      filter: 'Filter',
      allStatuses: 'All statuses',
      allPriorities: 'All priorities',
      itemsPerPage: 'Items per page',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      deleteConfirm: 'Are you sure you want to delete this request?',
      viewResults: 'View results',
      enterResults: 'Enter results',
      validateResults: 'Validate results',
      printReport: 'Print report',
      created: 'Created',
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      normal: 'Normal',
      urgent: 'Urgent',
      emergency: 'Emergency',
      paymentStatus: 'Payment status',
      paid: 'Paid',
      partiallyPaid: 'Partially paid',
      unpaid: 'Unpaid',
      totalAmount: 'Total amount',
      amountDue: 'Amount due',
      doctor: 'Doctor',
      collectionDate: 'Collection date',
      collectionTime: 'Collection time',
      notes: 'Notes',
      createdAt: 'Created at',
      updatedAt: 'Updated at'
    }
  }[language];

  // Load requests from API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const result = await requestsService.getRequests({ _t: Date.now() });
        if (result.requests) {
          setRequests(result.requests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [refreshKey]);

  // Filter and sort requests
  const filteredRequests = requests.filter(request => {
    const patientName = `${request.patient?.firstName || ''} ${request.patient?.lastName || ''}`.toLowerCase();
    const analysisNames = request.requestAnalyses?.map(ra => ra.analysis.name.toLowerCase()) || [];
    const doctorName = `${request.doctor?.firstName || ''} ${request.doctor?.lastName || ''}`.toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) ||
           request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           analysisNames.some(name => name.includes(searchTerm.toLowerCase())) ||
           doctorName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || request.priority === priorityFilter;
    const matchesDate = !dateFilter || (request.collectionDate && request.collectionDate.includes(dateFilter));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'NORMAL': 0, 'URGENT': 1, 'EMERGENCY': 2 };
      return sortOrder === 'asc'
        ? (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
        : (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    } else if (sortBy === 'status') {
      const statusOrder = { 'CREATED': 0, 'PENDING': 1, 'PROCESSING': 2, 'COMPLETED': 3, 'CANCELLED': 4 };
      return sortOrder === 'asc'
        ? (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0)
        : (statusOrder[b.status as keyof typeof statusOrder] || 0) - (statusOrder[a.status as keyof typeof statusOrder] || 0);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    const colors = {
      CREATED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      NORMAL: 'bg-gray-100 text-gray-800',
      URGENT: 'bg-orange-100 text-orange-800',
      EMERGENCY: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (request: Request) => {
    if (request.amountDue <= 0) {
      return 'bg-green-100 text-green-800';
    } else if (request.advancePayment > 0) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getPaymentStatusText = (request: Request) => {
    if (request.amountDue <= 0) {
      return language === 'fr' ? 'Payé' : 'Paid';
    } else if (request.advancePayment > 0) {
      return language === 'fr' ? 'Partiellement payé' : 'Partially paid';
    }
    return language === 'fr' ? 'Non payé' : 'Unpaid';
  };

  const handleView = (request: Request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleEdit = (request: Request) => {
    setSelectedRequest(request);
    setShowNewModal(true);
  };

  const handleDelete = async (request: Request) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await requestsService.deleteRequest(request.id);
        setRefreshKey(prev => prev + 1); // Trigger refresh
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Error deleting request');
      }
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async () => {
    try {
      // This would typically call an API endpoint to generate a CSV/Excel file
      alert('Export functionality would be implemented here');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewResults = (request: Request) => {
    navigate(`/results?requestId=${request.id}`);
  };

  const handleEnterResults = (request: Request) => {
    navigate(`/results/entry?requestId=${request.id}`);
  };

  const handleValidateResults = (request: Request) => {
    navigate(`/validation?requestId=${request.id}`);
  };

  const handlePrintReport = (request: Request) => {
    navigate(`/results/print?requestId=${request.id}`);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const NewRequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedRequest ? 'Modifier Demande' : t.newRequest}
          </h3>
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
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Sélectionner tests</option>
            <option>Hémogramme</option>
            <option>Glycémie</option>
          </select>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Priorité normale</option>
            <option>Urgent</option>
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

  const ViewRequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Détails de la demande' : 'Request Details'}
          </h3>
          <button onClick={() => setShowViewModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Informations patient' : 'Patient Information'}
                </h4>
                <div className="space-y-2">
                  <div><strong>{t.patient}:</strong> {selectedRequest.patient ? `${selectedRequest.patient.firstName} ${selectedRequest.patient.lastName}` : 'N/A'}</div>
                  {selectedRequest.patient?.cnssNumber && <div><strong>CNSS:</strong> {selectedRequest.patient.cnssNumber}</div>}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Statut de la demande' : 'Request Status'}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <strong className="mr-2">{t.status}:</strong> 
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <strong className="mr-2">{t.priority}:</strong> 
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <strong className="mr-2">{t.paymentStatus}:</strong> 
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedRequest)}`}>
                      {getPaymentStatusText(selectedRequest)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {language === 'fr' ? 'Analyses demandées' : 'Requested Tests'}
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedRequest.requestAnalyses?.map(ra => (
                  <li key={ra.id}>{ra.analysis.name} <span className="text-gray-500">({ra.analysis.code})</span></li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Informations de prélèvement' : 'Collection Information'}
                </h4>
                <div className="space-y-2">
                  <div><strong>{t.sampleType}:</strong> {selectedRequest.sampleType}</div>
                  {selectedRequest.tubeType && <div><strong>{language === 'fr' ? 'Type de tube' : 'Tube Type'}:</strong> {selectedRequest.tubeType}</div>}
                  <div><strong>{t.collectionDate}:</strong> {selectedRequest.collectionDate ? new Date(selectedRequest.collectionDate).toLocaleString() : 'N/A'}</div>
                  <div><strong>{t.collectionTime}:</strong> {selectedRequest.collectionTime || 'N/A'}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Informations financières' : 'Financial Information'}
                </h4>
                <div className="space-y-2">
                  <div><strong>{t.totalAmount}:</strong> {selectedRequest.totalAmount.toFixed(2)} MAD</div>
                  {selectedRequest.discount > 0 && <div><strong>{language === 'fr' ? 'Remise' : 'Discount'}:</strong> {selectedRequest.discount}%</div>}
                  {selectedRequest.advancePayment > 0 && <div><strong>{language === 'fr' ? 'Avance' : 'Advance Payment'}:</strong> {selectedRequest.advancePayment.toFixed(2)} MAD</div>}
                  <div><strong>{t.amountDue}:</strong> {selectedRequest.amountDue.toFixed(2)} MAD</div>
                </div>
              </div>
            </div>
            
            {selectedRequest.doctor && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Médecin référent' : 'Referring Doctor'}
                </h4>
                <div className="space-y-2">
                  <div><strong>{t.doctor}:</strong> {`${selectedRequest.doctor.firstName} ${selectedRequest.doctor.lastName}`}</div>
                  <div><strong>{language === 'fr' ? 'Spécialité' : 'Specialty'}:</strong> {selectedRequest.doctor.specialty}</div>
                </div>
              </div>
            )}
            
            {selectedRequest.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t.notes}
                </h4>
                <p className="whitespace-pre-line">{selectedRequest.notes}</p>
              </div>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {language === 'fr' ? 'Informations système' : 'System Information'}
              </h4>
              <div className="space-y-2">
                <div><strong>ID:</strong> {selectedRequest.id}</div>
                <div><strong>{t.createdAt}:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</div>
                <div><strong>{t.updatedAt}:</strong> {new Date(selectedRequest.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <button
            onClick={() => handleViewResults(selectedRequest!)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Eye size={16} className="mr-2" />
            {t.viewResults}
          </button>
          <button
            onClick={() => handleEnterResults(selectedRequest!)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <FileText size={16} className="mr-2" />
            {t.enterResults}
          </button>
          <button
            onClick={() => handlePrintReport(selectedRequest!)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Printer size={16} className="mr-2" />
            {t.printReport}
          </button>
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <X size={16} className="mr-2" />
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleRefresh}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t.refresh}
          </button>
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            {t.export}
          </button>
          <button 
            onClick={handlePrint}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Printer size={16} className="mr-2" />
            {t.print}
          </button>
          <button 
            onClick={() => navigate('/new-request')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            {t.newRequest}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`px-4 py-2 rounded-lg flex items-center ${showFilter ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          <Filter size={16} className="mr-2" />
          {t.filter}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.status}</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="CREATED">{t.created}</option>
                <option value="PENDING">{t.pending}</option>
                <option value="PROCESSING">{t.processing}</option>
                <option value="COMPLETED">{t.completed}</option>
                <option value="CANCELLED">{t.cancelled}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.priority}</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">{t.allPriorities}</option>
                <option value="NORMAL">{t.normal}</option>
                <option value="URGENT">{t.urgent}</option>
                <option value="EMERGENCY">{t.emergency}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.date}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.itemsPerPage}</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    {t.id}
                    {sortBy === 'id' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.patient}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.tests}</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    {t.status}
                    {sortBy === 'status' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    {t.priority}
                    {sortBy === 'priority' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.paymentStatus}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.sampleType}</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    {t.date}
                    {sortBy === 'createdAt' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFilter 
                        ? (language === 'fr' ? 'Aucune demande trouvée pour cette recherche.' : 'No requests found for this search.') 
                        : (language === 'fr' ? 'Aucune demande enregistrée.' : 'No requests recorded.')}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.patient ? `${request.patient.firstName} ${request.patient.lastName}` : 'N/A'}
                    {request.patient?.cnssNumber && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        CNSS: {request.patient.cnssNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="max-w-xs truncate">
                      {request.requestAnalyses?.map(ra => ra.analysis.name).join(', ') || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {request.requestAnalyses?.length || 0} {language === 'fr' ? 'test(s)' : 'test(s)'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(request)}`}>
                      {getPaymentStatusText(request)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.sampleType}
                    {request.tubeType && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({request.tubeType})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(request)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title={language === 'fr' ? 'Voir détails' : 'View details'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(request)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        title={language === 'fr' ? 'Modifier' : 'Edit'}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewResults(request)}
                        className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                        title={language === 'fr' ? 'Voir résultats' : 'View results'}
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        onClick={() => handlePrintReport(request)}
                        className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                        title={language === 'fr' ? 'Imprimer rapport' : 'Print report'}
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(request)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title={language === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginatedRequests.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {t.page} {currentPage} {t.of} {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
            >
              {t.previous}
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
            >
              {t.next}
            </button>
          </div>
        </div>
      )}

      {showNewModal && <NewRequestModal />}
      {showViewModal && <ViewRequestModal />}
    </div>
  );
}
 