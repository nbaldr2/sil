import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  UserPlus,
  ClipboardList,
  BarChart3,
  Package,
  Plus,
  Minus,
  ArrowLeftRight,
  Settings as SettingsIcon,
  Truck,
  ShoppingCart,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  X as CloseIcon,
  DollarSign,
  Settings,
  Database,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../App';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  subItems?: NavItem[];
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, language } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const t = {
    fr: {
      dashboard: 'Tableau de bord',
      patients: 'Patients',
      doctors: 'Médecins',
      analyses: 'Analyses',
      requests: 'Demandes',
      newRequest: 'Nouvelle Demande',
      results: 'Résultats',
      validation: 'Validation',
      billing: 'Facturation',
      config: 'Configuration',
      logout: 'Déconnexion',
      stockManagement: 'Gestion des Stocks',
      stockDashboard: 'Tableau de bord',
      addStock: 'Ajouter Stock',
      useStock: 'Utiliser Stock',
      transferStock: 'Transférer Stock',
      adjustInventory: 'Ajuster Inventaire',
      suppliers: 'Fournisseurs',
      orders: 'Commandes',
      reports: 'Rapports',
      priceManagement: 'Gestion des Prix',
      userManagement: 'Gestion des Utilisateurs',
      systemSettings: 'Paramètres Système',
      moduleStore: 'Store de Modules',
      auditTrail: 'Journal d\'Audit',
      backupRestore: 'Sauvegarde & Restauration',
      automates: 'Intégration Automates'
    },
    en: {
      dashboard: 'Dashboard',
      patients: 'Patients',
      doctors: 'Doctors',
      analyses: 'Analyses',
      requests: 'Requests',
      newRequest: 'New Request',
      results: 'Results',
      validation: 'Validation',
      billing: 'Billing',
      config: 'Configuration',
      logout: 'Logout',
      stockManagement: 'Stock Management',
      stockDashboard: 'Stock Dashboard',
      addStock: 'Add Stock',
      useStock: 'Use Stock',
      transferStock: 'Transfer Stock',
      adjustInventory: 'Adjust Inventory',
      suppliers: 'Suppliers',
      orders: 'Orders',
      reports: 'Reports',
      priceManagement: 'Price Management',
      userManagement: 'User Management',
      systemSettings: 'System Settings',
      moduleStore: 'Module Store',
      auditTrail: 'Audit Trail',
      backupRestore: 'Backup & Restore',
      automates: 'Automate Integration'
    }
  }[language];

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <Home size={20} />,
      path: '/dashboard',
      roles: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN', 'SECRETARY']
    },
    {
      id: 'patients',
      label: t.patients,
      icon: <Users size={20} />,
      path: '/patients',
      roles: ['ADMIN', 'SECRETARY']
    },
    {
      id: 'doctors',
      label: t.doctors,
      icon: <UserPlus size={20} />,
      path: '/doctors',
      roles: ['ADMIN', 'SECRETARY']
    },
    {
      id: 'analyses',
      label: t.analyses,
      icon: <FileText size={20} />,
      path: '/analyses',
      roles: ['ADMIN', 'BIOLOGIST']
    },
    {
      id: 'requests',
      label: t.requests,
      icon: <ClipboardList size={20} />,
      path: '/requests',
      roles: ['ADMIN', 'SECRETARY', 'BIOLOGIST'],
      subItems: [
        {
          id: 'requests-list',
          label: t.requests,
          icon: <ClipboardList size={16} />,
          path: '/requests',
          roles: ['ADMIN', 'SECRETARY', 'BIOLOGIST']
        },
        {
          id: 'new-request',
          label: t.newRequest,
          icon: <Plus size={16} />,
          path: '/new-request',
          roles: ['ADMIN', 'SECRETARY', 'BIOLOGIST']
        }
      ]
    },
    {
      id: 'results',
      label: t.results,
      icon: <BarChart3 size={20} />,
      path: '/results',
      roles: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    },
    {
      id: 'validation',
      label: t.validation,
      icon: <CheckCircle size={20} />,
      path: '/validation',
      roles: ['ADMIN', 'BIOLOGIST']
    },
    {
      id: 'stock',
      label: t.stockManagement,
      icon: <Package size={20} />,
      path: '/stock',
      roles: ['ADMIN', 'TECHNICIAN'],
      subItems: [
        {
          id: 'stock-dashboard',
          label: t.stockDashboard,
          icon: <BarChart3 size={16} />,
          path: '/stock/dashboard',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'add-stock',
          label: t.addStock,
          icon: <Plus size={16} />,
          path: '/stock/add',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'use-stock',
          label: t.useStock,
          icon: <Minus size={16} />,
          path: '/stock/use',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'transfer-stock',
          label: t.transferStock,
          icon: <ArrowLeftRight size={16} />,
          path: '/stock/transfer',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'adjust-inventory',
          label: t.adjustInventory,
          icon: <SettingsIcon size={16} />,
          path: '/stock/adjust',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'suppliers',
          label: t.suppliers,
          icon: <Truck size={16} />,
          path: '/stock/suppliers',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'orders',
          label: t.orders,
          icon: <ShoppingCart size={16} />,
          path: '/stock/orders',
          roles: ['ADMIN', 'TECHNICIAN']
        },
        {
          id: 'reports',
          label: t.reports,
          icon: <FileSpreadsheet size={16} />,
          path: '/stock/reports',
          roles: ['ADMIN', 'TECHNICIAN']
        }
      ]
    },
    {
      id: 'billing',
      label: t.billing,
      icon: <DollarSign size={20} />,
      path: '/billing',
      roles: ['ADMIN', 'SECRETARY']
    },
    {
      id: 'automates',
      label: t.automates,
      icon: <Database size={20} />,
      path: '/automates',
      roles: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    },
    {
      id: 'config',
      label: t.config,
      icon: <Settings size={20} />,
      path: '/config',
      roles: ['ADMIN'],
      subItems: [
        {
          id: 'price-management',
          label: t.priceManagement,
          icon: <DollarSign size={16} />,
          path: '/config/prices',
          roles: ['ADMIN']
        },
        {
          id: 'user-management',
          label: t.userManagement,
          icon: <Users size={16} />,
          path: '/config/users',
          roles: ['ADMIN']
        },
        {
          id: 'system-settings',
          label: t.systemSettings,
          icon: <Settings size={16} />,
          path: '/config/system',
          roles: ['ADMIN']
        },
        {
          id: 'moduleStore',
          label: t.moduleStore,
          icon: <Package size={20} />,
          path: '/config/modules',
          roles: ['ADMIN']
        },
        {
          id: 'auditTrail',
          label: t.auditTrail,
          icon: <FileText size={20} />,
          path: '/config/audit',
          roles: ['ADMIN']
        },
        {
          id: 'backupRestore',
          label: t.backupRestore,
          icon: <BarChart3 size={20} />,
          path: '/config/backup',
          roles: ['ADMIN']
        }
      ]
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <nav className="fixed lg:static top-0 left-0 h-full w-64 max-w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-30 transition-transform lg:translate-x-0 overflow-y-auto shadow-lg lg:shadow-none">
      {/* Mobile close button */}
      <div className="flex lg:hidden items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <CloseIcon size={24} />
        </button>
      </div>
      
      {/* Desktop header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 hidden lg:block">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">SIL Lab System</h2>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNav.map(item => (
          <div key={item.id}>
            {item.subItems ? (
              <>
                <button
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <span className="flex items-center min-w-0">
                    {item.icon}
                    <span className="ml-2 sm:ml-3 text-sm font-medium truncate">{item.label}</span>
                  </span>
                  {expanded === item.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {expanded === item.id && (
                  <div className="ml-4 sm:ml-6 mt-1 space-y-1">
                    {item.subItems.filter(sub => sub.roles.includes(user?.role || '')).map(subItem => (
                      <NavLink
                        key={subItem.id}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`
                        }
                        onClick={handleNavigation}
                      >
                        {subItem.icon}
                        <span className="ml-2 truncate">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
                onClick={handleNavigation}
              >
                {item.icon}
                <span className="ml-2 sm:ml-3 font-medium truncate">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          v1.0.0
        </div>
      </div>
    </nav>
  );
}
 