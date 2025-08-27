import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Search,
  Edit,
  Eye,
  Percent,
  DollarSign,
  Building,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  insuranceCompany: string;
  insuranceCode: string;
  policyHolder: string;
  coveragePercentage: number;
  maxCoverage: number;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  beneficiariesCount: number;
}

interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contractManager: string;
  processingTime: number;
  isActive: boolean;
}

const InsuranceCoverageManager: React.FC = () => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<'policies' | 'companies'>('policies');
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const translations = {
    fr: {
      title: 'Gestion de la Couverture d\'Assurance',
      policies: 'Polices d\'Assurance',
      companies: 'Compagnies d\'Assurance',
      search: 'Rechercher...',
      addPolicy: 'Ajouter Police',
      addCompany: 'Ajouter Compagnie',
      policyNumber: 'N° Police',
      insuranceCompany: 'Compagnie',
      policyHolder: 'Titulaire',
      coverage: 'Couverture',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      expired: 'Expiré',
      suspended: 'Suspendu',
      all: 'Tous',
      contactManager: 'Gestionnaire',
      processingTime: 'Délai'
    },
    en: {
      title: 'Insurance Coverage Management',
      policies: 'Insurance Policies',
      companies: 'Insurance Companies',
      search: 'Search...',
      addPolicy: 'Add Policy',
      addCompany: 'Add Company',
      policyNumber: 'Policy Number',
      insuranceCompany: 'Company',
      policyHolder: 'Policy Holder',
      coverage: 'Coverage',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      expired: 'Expired',
      suspended: 'Suspended',
      all: 'All',
      contactManager: 'Manager',
      processingTime: 'Processing'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data
    setPolicies([
      {
        id: '1',
        policyNumber: 'POL-CNSS-001',
        insuranceCompany: 'CNSS Maroc',
        insuranceCode: 'CNSS',
        policyHolder: 'SIL Laboratory',
        coveragePercentage: 80,
        maxCoverage: 50000,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        status: 'ACTIVE',
        beneficiariesCount: 15
      },
      {
        id: '2',
        policyNumber: 'POL-CNOPS-002',
        insuranceCompany: 'CNOPS',
        insuranceCode: 'CNOPS',
        policyHolder: 'Government Employees',
        coveragePercentage: 90,
        maxCoverage: 30000,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        status: 'ACTIVE',
        beneficiariesCount: 8
      }
    ]);

    setCompanies([
      {
        id: '1',
        name: 'CNSS Maroc',
        code: 'CNSS',
        contactEmail: 'relations@cnss.ma',
        contractManager: 'Hassan Alami',
        processingTime: 5,
        isActive: true
      },
      {
        id: '2',
        name: 'CNOPS',
        code: 'CNOPS',
        contactEmail: 'contact@cnops.ma',
        contractManager: 'Fatima Benali',
        processingTime: 3,
        isActive: true
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
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      SUSPENDED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = searchTerm === '' || 
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insuranceCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderPoliciesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.policies}</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t.addPolicy}
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
            <option value="EXPIRED">{t.expired}</option>
            <option value="SUSPENDED">{t.suspended}</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.policyNumber}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.insuranceCompany}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.coverage}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.status}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPolicies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{policy.policyNumber}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{policy.policyHolder}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{policy.insuranceCompany}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Code: {policy.insuranceCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{policy.coveragePercentage}%</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max: {formatCurrency(policy.maxCoverage)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                    {policy.status}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompaniesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.companies}</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t.addCompany}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {company.code}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4 mr-2" />
                {t.contactManager}: {company.contractManager}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t.processingTime}: {company.processingTime} jours
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                company.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {company.isActive ? t.active : 'Inactif'}
              </span>
            </div>
          </div>
        ))}
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
              { id: 'policies', label: t.policies, icon: Shield },
              { id: 'companies', label: t.companies, icon: Building }
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
        {activeTab === 'policies' && renderPoliciesTab()}
        {activeTab === 'companies' && renderCompaniesTab()}
      </div>
    </div>
  );
};

export default InsuranceCoverageManager;