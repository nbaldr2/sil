// Module manifest that mirrors the frontend module registry metadata.
// Icons are returned as string names; the frontend maps them to local icon components.
module.exports = [
  {
    id: 'analytics-pro',
    name: 'analytics-pro',
    displayName: { fr: 'Analytics Pro', en: 'Analytics Pro' },
    description: { fr: "Analytique avancée et intelligence d'affaires", en: 'Advanced analytics and business intelligence' },
    version: '0.1.0',
    category: 'analytics',
    icon: 'BarChart3',
    color: '#4F46E5',
    features: { fr: ['Tableaux de bord personnalisés','Suivi des KPI'], en: ['Custom dashboards','KPI tracking'] },
    permissions: ['ADMIN','BIOLOGIST'],
    routes: [
      { path: '/modules/analytics-pro', name: { fr: 'Analytics Pro', en: 'Analytics Pro' } }
    ],
    menuItems: [
      { name: { fr: 'Analytics', en: 'Analytics' }, path: '/modules/analytics-pro', icon: 'BarChart3', permissions: ['ADMIN','BIOLOGIST'] }
    ],
    dashboardWidgets: [
      { id: 'analytics-pro-kpi', name: { fr: 'KPI Analytics', en: 'KPI Analytics' }, size: 'large', permissions: ['ADMIN','BIOLOGIST'] }
    ],
    quickActions: [],
    notifications: [],
    settings: [],
    dependencies: [],
    author: 'SIL Labs',
    license: 'proprietary',
    documentation: { fr: '', en: '' }
  },
  {
    id: 'billing-manager',
    name: 'billing-manager',
    displayName: { fr: 'Gestionnaire de Facturation', en: 'Billing Manager' },
    description: { 
      fr: "Système de facturation avancé avec gestion des assurances, suivi des paiements, rapports financiers et conformité fiscale marocaine.", 
      en: 'Advanced billing system with insurance management, payment tracking, financial reporting and Moroccan tax compliance.' 
    },
    version: '1.0.0',
    category: 'finance',
    icon: 'CreditCard',
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
    permissions: ['ADMIN','SECRETARY'],
    routes: [
      { path: '/modules/billing-manager', name: { fr: 'Gestionnaire de Facturation', en: 'Billing Manager' } }
    ],
    menuItems: [
      { name: { fr: 'Facturation', en: 'Billing' }, path: '/modules/billing-manager', icon: 'CreditCard', permissions: ['ADMIN','SECRETARY'] }
    ],
    dashboardWidgets: [
      { id: 'billing-revenue-widget', name: { fr: 'Revenus du Mois', en: 'Monthly Revenue' }, size: 'medium', permissions: ['ADMIN','SECRETARY'] },
      { id: 'billing-outstanding-widget', name: { fr: 'Factures en Attente', en: 'Outstanding Invoices' }, size: 'medium', permissions: ['ADMIN','SECRETARY'] }
    ],
    quickActions: [
      { name: { fr: 'Nouvelle Facture', en: 'New Invoice' }, icon: 'FileText', action: 'billing.create-invoice', color: '#059669', permissions: ['ADMIN','SECRETARY'] },
      { name: { fr: 'Enregistrer Paiement', en: 'Record Payment' }, icon: 'Receipt', action: 'billing.record-payment', color: '#0891b2', permissions: ['ADMIN','SECRETARY'] }
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
          { label: { fr: 'Voir les factures', en: 'View invoices' }, action: 'billing.view-overdue' }
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
        default: 'MAD'
      },
      {
        key: 'billing.taxRate',
        name: { fr: 'Taux de TVA (%)', en: 'VAT Rate (%)' },
        type: 'number',
        min: 0,
        max: 100,
        default: 20
      },
      {
        key: 'billing.autoReminders',
        name: { fr: 'Rappels automatiques', en: 'Automatic reminders' },
        type: 'boolean',
        default: true
      }
    ],
    dependencies: [],
    author: 'SIL Lab Systems',
    license: 'proprietary',
    documentation: { fr: '', en: '' }
  }
];
