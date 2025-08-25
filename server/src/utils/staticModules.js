// Static modules that are shipped with the frontend but may not exist in the database.
// This file provides a lightweight fallback so the Module Store UI can show modules
// (for example during development) even when they are not seeded into the DB).
module.exports = [
  {
    id: 'analytics-pro',
    name: 'analytics-pro',
    displayName: 'Analytics Pro',
    description: 'Advanced analytics and business intelligence with custom dashboards, KPI tracking, and predictive insights.',
    version: '0.1.0',
    author: 'SIL Labs',
    category: 'analytics',
    price: 0,
    features: [
      'Custom dashboards',
      'KPI tracking',
      'Predictive analytics'
    ],
    requirements: {},
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
