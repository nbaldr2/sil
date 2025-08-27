// Module Registry
import { BackupModule } from './BackupModule';
import { QualityControlModule } from './QualityControlModule';
import AnalyticsProPage, { AnalyticsProWidget } from './AnalyticsPro';
import EnhancedBillingModule from '../components/billing/EnhancedBillingModule';
import { BarChart3, CreditCard, Receipt, Users, FileText, Settings } from 'lucide-react';

export interface ModuleDefinition {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  version: string;
  category: string;
  icon: any;
  color: string;
  features: {
    fr: string[];
    en: string[];
  };
  permissions: string[];
  routes: Array<{
    path: string;
    component: React.ComponentType<any>;
    name: {
      fr: string;
      en: string;
    };
  }>;
  menuItems: Array<{
    name: {
      fr: string;
      en: string;
    };
    path: string;
    icon: any;
    permissions: string[];
  }>;
  dashboardWidgets?: Array<{
    id: string;
    name: {
      fr: string;
      en: string;
    };
    component: React.ComponentType<any>;
    size: 'small' | 'medium' | 'large';
    permissions: string[];
  }>;
  quickActions?: Array<{
    name: {
      fr: string;
      en: string;
    };
    icon: any;
    action: string;
    color: string;
    permissions: string[];
  }>;
  notifications?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    condition: string;
    message: {
      fr: string;
      en: string;
    };
    actions: Array<{
      label: {
        fr: string;
        en: string;
      };
      action: string;
    }>;
  }>;
  settings?: Array<{
    key: string;
    name: {
      fr: string;
      en: string;
    };
    type: 'boolean' | 'string' | 'number' | 'select';
    options?: Array<{
      value: string;
      label: {
        fr: string;
        en: string;
      };
    }>;
    min?: number;
    max?: number;
    default: any;
    description?: {
      fr: string;
      en: string;
    };
  }>;
  dependencies: string[];
  author: string;
  license: string;
  documentation: {
    fr: string;
    en: string;
  };
}

// Registry of all available modules
export const moduleRegistry: Record<string, ModuleDefinition> = {
  'backup-manager': BackupModule,
  'quality-control': QualityControlModule,
  'analytics-pro': {
    id: 'analytics-pro',
    name: { fr: 'Analytics Pro', en: 'Analytics Pro' },
    description: {
      fr: "Analytique avancée et intelligence d'affaires avec tableaux de bord personnalisés, suivi des KPI et insights prédictifs.",
      en: 'Advanced analytics and business intelligence with custom dashboards, KPI tracking, and predictive insights.'
    },
    version: '0.1.0',
    category: 'analytics',
    icon: BarChart3,
    color: '#4F46E5',
    features: {
      fr: ['Tableaux de bord personnalisés', 'Suivi des KPI', 'Analyses prédictives'],
      en: ['Custom dashboards', 'KPI tracking', 'Predictive analytics']
    },
    permissions: ['ADMIN', 'BIOLOGIST'],
    routes: [
      {
        path: '/modules/analytics-pro',
        component: AnalyticsProPage,
        name: { fr: 'Analytics Pro', en: 'Analytics Pro' }
      }
    ],
    menuItems: [
      {
        name: { fr: 'Analytics', en: 'Analytics' },
        path: '/modules/analytics-pro',
        icon: BarChart3,
        permissions: ['ADMIN', 'BIOLOGIST']
      }
    ],
    dashboardWidgets: [
      {
        id: 'analytics-pro-kpi',
        name: { fr: 'KPI Analytics', en: 'KPI Analytics' },
        component: AnalyticsProWidget,
        size: 'large',
        permissions: ['ADMIN', 'BIOLOGIST']
      }
    ],
    quickActions: [],
    notifications: [],
    settings: [
      {
        key: 'analytics.enablePredictive',
        name: { fr: 'Activer prédictif', en: 'Enable Predictive' },
        type: 'boolean',
        default: true,
        description: { fr: 'Activer les analyses prédictives', en: 'Enable predictive analytics' }
      }
    ],
    dependencies: [],
    author: 'SIL Labs',
    license: 'proprietary',
    documentation: { fr: '', en: '' }
  },
  'billing-manager': {
    id: 'billing-manager',
    name: { fr: 'Gestionnaire de Facturation', en: 'Billing Manager' },
    description: {
      fr: "Système de facturation avancé avec gestion des assurances, suivi des paiements, rapports financiers et conformité fiscale marocaine.",
      en: 'Advanced billing system with insurance management, payment tracking, financial reporting and Moroccan tax compliance.'
    },
    version: '1.0.0',
    category: 'finance',
    icon: CreditCard,
    color: '#059669',
    features: {
      fr: [
        'Génération de factures automatique',
        'Gestion des réclamations d\'assurance',
        'Suivi des paiements',
        'Rapports financiers avancés',
        'Gestion fiscale (TVA, Timbre)',
        'Support multi-devises',
        'Portail client',
        'Intégrations comptables'
      ],
      en: [
        'Automatic invoice generation',
        'Insurance claims management',
        'Payment tracking',
        'Advanced financial reporting',
        'Tax management (VAT, Stamp)',
        'Multi-currency support',
        'Client portal',
        'Accounting integrations'
      ]
    },
    permissions: ['ADMIN', 'SECRETARY'],
    routes: [
      {
        path: '/modules/billing-manager',
        component: EnhancedBillingModule,
        name: { fr: 'Gestionnaire de Facturation', en: 'Billing Manager' }
      }
    ],
    menuItems: [
      {
        name: { fr: 'Facturation', en: 'Billing' },
        path: '/modules/billing-manager',
        icon: CreditCard,
        permissions: ['ADMIN', 'SECRETARY']
      }
    ],
    dashboardWidgets: [
      {
        id: 'billing-revenue-widget',
        name: { fr: 'Revenus du Mois', en: 'Monthly Revenue' },
        component: () => null, // Will be implemented later
        size: 'medium',
        permissions: ['ADMIN', 'SECRETARY']
      },
      {
        id: 'billing-outstanding-widget',
        name: { fr: 'Factures en Attente', en: 'Outstanding Invoices' },
        component: () => null, // Will be implemented later
        size: 'medium',
        permissions: ['ADMIN', 'SECRETARY']
      }
    ],
    quickActions: [
      {
        name: { fr: 'Nouvelle Facture', en: 'New Invoice' },
        icon: FileText,
        action: 'billing.create-invoice',
        color: '#059669',
        permissions: ['ADMIN', 'SECRETARY']
      },
      {
        name: { fr: 'Enregistrer Paiement', en: 'Record Payment' },
        icon: Receipt,
        action: 'billing.record-payment',
        color: '#0891b2',
        permissions: ['ADMIN', 'SECRETARY']
      }
    ],
    notifications: [
      {
        id: 'billing-overdue-invoices',
        type: 'warning',
        condition: 'hasOverdueInvoices',
        message: {
          fr: 'Vous avez des factures en retard qui nécessitent votre attention',
          en: 'You have overdue invoices that require attention'
        },
        actions: [
          {
            label: { fr: 'Voir les factures', en: 'View invoices' },
            action: 'billing.view-overdue'
          }
        ]
      }
    ],
    settings: [
      {
        key: 'billing.defaultCurrency',
        name: { fr: 'Devise par défaut', en: 'Default Currency' },
        type: 'select',
        options: [
          { value: 'MAD', label: { fr: 'MAD - Dirham Marocain', en: 'MAD - Moroccan Dirham' } },
          { value: 'USD', label: { fr: 'USD - Dollar Américain', en: 'USD - US Dollar' } },
          { value: 'EUR', label: { fr: 'EUR - Euro', en: 'EUR - Euro' } }
        ],
        default: 'MAD',
        description: { fr: 'Devise utilisée par défaut pour les factures', en: 'Default currency for invoices' }
      },
      {
        key: 'billing.taxRate',
        name: { fr: 'Taux de TVA (%)', en: 'VAT Rate (%)' },
        type: 'number',
        min: 0,
        max: 100,
        default: 20,
        description: { fr: 'Taux de TVA appliqué aux factures', en: 'VAT rate applied to invoices' }
      },
      {
        key: 'billing.autoReminders',
        name: { fr: 'Rappels automatiques', en: 'Automatic reminders' },
        type: 'boolean',
        default: true,
        description: { fr: 'Envoyer des rappels de paiement automatiquement', en: 'Send payment reminders automatically' }
      }
    ],
    dependencies: [],
    author: 'SIL Lab Systems',
    license: 'proprietary',
    documentation: { fr: '', en: '' }
  },
};

// Get module by ID
export const getModule = (id: string): ModuleDefinition | undefined => {
  return moduleRegistry[id];
};

// Get all modules
export const getAllModules = (): ModuleDefinition[] => {
  return Object.values(moduleRegistry);
};

// Get modules by category
export const getModulesByCategory = (category: string): ModuleDefinition[] => {
  return getAllModules().filter(module => module.category === category);
};

// Get modules by permission
export const getModulesByPermission = (userRole: string): ModuleDefinition[] => {
  return getAllModules().filter(module => 
    module.permissions.includes(userRole) || module.permissions.includes('ALL')
  );
};

// Check if user has access to module
export const hasModuleAccess = (moduleId: string, userRole: string): boolean => {
  const module = getModule(moduleId);
  if (!module) return false;
  
  return module.permissions.includes(userRole) || module.permissions.includes('ALL');
};

// Get module routes for React Router
export const getModuleRoutes = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.routes);
};

// Get module menu items for navigation
export const getModuleMenuItems = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.menuItems)
    .filter(item => item.permissions.includes(userRole) || item.permissions.includes('ALL'));
};

// Get dashboard widgets
export const getModuleDashboardWidgets = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.dashboardWidgets || [])
    .filter(widget => widget.permissions.includes(userRole) || widget.permissions.includes('ALL'));
};

// Get quick actions
export const getModuleQuickActions = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.quickActions || [])
    .filter(action => action.permissions.includes(userRole) || action.permissions.includes('ALL'));
};

export default moduleRegistry;