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
  }
];
