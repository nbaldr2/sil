import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  CreditCard,
  Users,
  ClipboardList,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../App';

interface BillingModuleProps {
  userRole?: string;
  userId?: string;
}

interface QuickStats {
  totalRevenue: number;
  pendingInvoices: number;
  overdueAmount: number;
  collectionRate: number;
  recentTransactions: number;
}

const WorkingBillingModule: React.FC<BillingModuleProps> = ({ userRole: propUserRole, userId: propUserId }) => {
  console.log('WorkingBillingModule rendering, props:', { userRole: propUserRole, userId: propUserId });
  const { user } = useAuth();
  console.log('WorkingBillingModule user from auth:', user);
  
  // Use props if provided, otherwise get from auth context
  const userRole = propUserRole || user?.role || 'GUEST';
  const userId = propUserId || user?.id || 'unknown';
  
  console.log('WorkingBillingModule final userRole:', userRole, 'userId:', userId);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  // If no user is logged in, show login required message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentification requise</h3>
          <p className="text-gray-600">Veuillez vous connecter pour accéder au module de facturation.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('WorkingBillingModule useEffect called');
    
    // Set fallback data immediately
    setQuickStats({
      totalRevenue: 125000,
      pendingInvoices: 15,
      overdueAmount: 25000,
      collectionRate: 85.5,
      recentTransactions: 8
    });
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const canAccessTab = (tab: string): boolean => {
    const rolePermissions = {
      'ADMIN': ['dashboard', 'invoices', 'payments', 'customers', 'reports', 'settings'],
      'BIOLOGIST': ['dashboard', 'invoices', 'payments', 'reports'],
      'TECHNICIAN': ['dashboard', 'invoices'],
      'SECRETARY': ['dashboard', 'invoices', 'payments', 'customers']
    };
    
    return rolePermissions[userRole as keyof typeof rolePermissions]?.includes(tab) || false;
  };

  const getTabIcon = (tab: string) => {
    const icons = {
      dashboard: BarChart3,
      invoices: FileText,
      payments: CreditCard,
      customers: Users,
      reports: ClipboardList,
      settings: Settings
    };
    return icons[tab as keyof typeof icons] || BarChart3;
  };

  const getTabLabel = (tab: string) => {
    const labels = {
      dashboard: 'Tableau de Bord',
      invoices: 'Factures',
      payments: 'Paiements',
      customers: 'Clients',
      reports: 'Rapports',
      settings: 'Paramètres'
    };
    return labels[tab as keyof typeof labels] || tab;
  };

  const availableTabs = ['dashboard', 'invoices', 'payments', 'customers', 'reports', 'settings']
    .filter(tab => canAccessTab(tab));

  const renderTabContent = () => {
    console.log('WorkingBillingModule renderTabContent called, activeTab:', activeTab);
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(quickStats?.totalRevenue || 125000)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Factures en Attente</p>
                    <p className="text-2xl font-bold text-gray-900">{quickStats?.pendingInvoices || 15}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Montant en Retard</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(quickStats?.overdueAmount || 25000)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de Recouvrement</p>
                    <p className="text-2xl font-bold text-gray-900">{quickStats?.collectionRate || 85.5}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Nouvelle Facture</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Enregistrer Paiement</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Générer Rapport</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Rappels de Paiement</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'invoices':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Factures</h2><p>Module des factures en cours de développement...</p></div>;
      case 'payments':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Paiements</h2><p>Module des paiements en cours de développement...</p></div>;
      case 'customers':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Clients</h2><p>Module des clients en cours de développement...</p></div>;
      case 'reports':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Rapports</h2><p>Module des rapports en cours de développement...</p></div>;
      case 'settings':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Paramètres</h2><p>Module des paramètres en cours de développement...</p></div>;
      default:
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold">Tableau de Bord</h2><p>Contenu par défaut...</p></div>;
    }
  };

  if (loading) {
    console.log('WorkingBillingModule showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du module de facturation...</span>
      </div>
    );
  }

  console.log('WorkingBillingModule rendering main content, activeTab:', activeTab);

  return (
    <div className="w-full bg-gray-50">
      {/* Debug indicator */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'blue', color: 'white', padding: '5px', zIndex: 9999 }}>
        WORKING BILLING MODULE LOADED
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Gestion de Facturation</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {userRole}
              </span>
            </div>
            
            {/* Quick Stats in Header */}
            {quickStats && (
              <div className="hidden lg:flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(quickStats.totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-500">Revenus du mois</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {quickStats.pendingInvoices}
                  </div>
                  <div className="text-xs text-gray-500">Factures en attente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(quickStats.overdueAmount)}
                  </div>
                  <div className="text-xs text-gray-500">Montant en retard</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex space-x-8 -mb-px">
            {availableTabs.map((tab) => {
              const Icon = getTabIcon(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="ml-2">{getTabLabel(tab)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Wrapper component for module registration (no props required)
export const WorkingBillingModuleWrapper: React.FC = () => {
  console.log('WorkingBillingModuleWrapper rendering');
  return <WorkingBillingModule />;
};

export default WorkingBillingModule;