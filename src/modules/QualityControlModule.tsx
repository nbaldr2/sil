import React from 'react';
import { Shield, CheckCircle, AlertTriangle, BarChart3, FileCheck, Settings } from 'lucide-react';
import QualityControl from '../components/QualityControl';

export const QualityControlModule = {
  id: 'quality-control',
  name: {
    fr: 'Contrôle Qualité',
    en: 'Quality Control'
  },
  description: {
    fr: 'Système complet de contrôle qualité avec gestion des échantillons de contrôle, validation des résultats et rapports de conformité',
    en: 'Complete quality control system with control sample management, result validation and compliance reporting'
  },
  version: '1.0.0',
  category: 'laboratory',
  icon: Shield,
  color: 'bg-green-600',
  features: {
    fr: [
      'Gestion des échantillons de contrôle',
      'Validation automatique des résultats',
      'Cartes de contrôle statistique',
      'Rapports de conformité',
      'Alertes de dérive qualité',
      'Traçabilité complète',
      'Standards de référence',
      'Audit et certification'
    ],
    en: [
      'Control sample management',
      'Automatic result validation',
      'Statistical control charts',
      'Compliance reporting',
      'Quality drift alerts',
      'Complete traceability',
      'Reference standards',
      'Audit and certification'
    ]
  },
  permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN'],
  routes: [
    {
      path: '/quality-control',
      component: QualityControl,
      name: {
        fr: 'Contrôle Qualité',
        en: 'Quality Control'
      }
    }
  ],
  menuItems: [
    {
      name: {
        fr: 'Contrôle Qualité',
        en: 'Quality Control'
      },
      path: '/quality-control',
      icon: Shield,
      permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    }
  ],
  dashboardWidgets: [
    {
      id: 'quality-status',
      name: {
        fr: 'Statut Qualité',
        en: 'Quality Status'
      },
      component: ({ language }: { language: 'fr' | 'en' }) => {
        const t = {
          fr: {
            title: 'Statut Qualité',
            conformity: 'Conformité',
            alerts: 'Alertes',
            lastControl: 'Dernier Contrôle',
            nextControl: 'Prochain Contrôle'
          },
          en: {
            title: 'Quality Status',
            conformity: 'Conformity',
            alerts: 'Alerts',
            lastControl: 'Last Control',
            nextControl: 'Next Control'
          }
        }[language];

        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.title}
              </h3>
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.conformity}</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">98.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.alerts}</span>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm font-medium text-yellow-600">2</span>
                </div>
              </div>
            </div>
          </div>
        );
      },
      size: 'small',
      permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    },
    {
      id: 'control-charts',
      name: {
        fr: 'Cartes de Contrôle',
        en: 'Control Charts'
      },
      component: ({ language }: { language: 'fr' | 'en' }) => {
        const t = {
          fr: {
            title: 'Cartes de Contrôle',
            inControl: 'Sous Contrôle',
            outOfControl: 'Hors Contrôle',
            trending: 'Tendance'
          },
          en: {
            title: 'Control Charts',
            inControl: 'In Control',
            outOfControl: 'Out of Control',
            trending: 'Trending'
          }
        }[language];

        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.title}
              </h3>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">15</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.inControl}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">1</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.outOfControl}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">2</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.trending}</div>
              </div>
            </div>
          </div>
        );
      },
      size: 'medium',
      permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    }
  ],
  quickActions: [
    {
      name: {
        fr: 'Nouveau Contrôle',
        en: 'New Control'
      },
      icon: CheckCircle,
      action: 'new-control',
      color: 'bg-green-600',
      permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    },
    {
      name: {
        fr: 'Cartes de Contrôle',
        en: 'Control Charts'
      },
      icon: BarChart3,
      action: 'control-charts',
      color: 'bg-blue-600',
      permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN']
    },
    {
      name: {
        fr: 'Rapport Qualité',
        en: 'Quality Report'
      },
      icon: FileCheck,
      action: 'quality-report',
      color: 'bg-purple-600',
      permissions: ['ADMIN', 'BIOLOGIST']
    }
  ],
  notifications: [
    {
      id: 'quality-alert',
      type: 'warning',
      condition: 'outOfControlSamples > 0',
      message: {
        fr: '{count} échantillon(s) de contrôle hors limites',
        en: '{count} control sample(s) out of limits'
      },
      actions: [
        {
          label: { fr: 'Voir Détails', en: 'View Details' },
          action: 'view-quality-alerts'
        }
      ]
    },
    {
      id: 'control-due',
      type: 'info',
      condition: 'controlsDue > 0',
      message: {
        fr: '{count} contrôle(s) à effectuer',
        en: '{count} control(s) due'
      },
      actions: [
        {
          label: { fr: 'Effectuer Contrôles', en: 'Perform Controls' },
          action: 'perform-controls'
        }
      ]
    }
  ],
  settings: [
    {
      key: 'controlFrequency',
      name: {
        fr: 'Fréquence des Contrôles',
        en: 'Control Frequency'
      },
      type: 'select',
      options: [
        { value: 'DAILY', label: { fr: 'Quotidien', en: 'Daily' } },
        { value: 'WEEKLY', label: { fr: 'Hebdomadaire', en: 'Weekly' } },
        { value: 'MONTHLY', label: { fr: 'Mensuel', en: 'Monthly' } }
      ],
      default: 'DAILY'
    },
    {
      key: 'alertThreshold',
      name: {
        fr: 'Seuil d\'Alerte (%)',
        en: 'Alert Threshold (%)'
      },
      type: 'number',
      min: 1,
      max: 10,
      default: 5,
      description: {
        fr: 'Pourcentage de déviation pour déclencher une alerte',
        en: 'Deviation percentage to trigger an alert'
      }
    },
    {
      key: 'retainControlData',
      name: {
        fr: 'Rétention Données (mois)',
        en: 'Data Retention (months)'
      },
      type: 'number',
      min: 6,
      max: 60,
      default: 24
    },
    {
      key: 'autoValidation',
      name: {
        fr: 'Validation Automatique',
        en: 'Auto Validation'
      },
      type: 'boolean',
      default: true,
      description: {
        fr: 'Valider automatiquement les contrôles dans les limites',
        en: 'Automatically validate controls within limits'
      }
    }
  ],
  dependencies: [],
  author: 'SIL Lab Team',
  license: 'MIT',
  documentation: {
    fr: `
# Module Contrôle Qualité

## Vue d'ensemble
Le module Contrôle Qualité assure la conformité et la fiabilité des analyses de laboratoire à travers un système complet de contrôle qualité.

## Fonctionnalités Principales

### Gestion des Échantillons de Contrôle
- Création et suivi des échantillons de contrôle
- Définition des valeurs cibles et limites
- Planification automatique des contrôles

### Cartes de Contrôle
- Cartes de Levey-Jennings
- Règles de Westgard
- Détection automatique des dérives

### Validation et Alertes
- Validation automatique des résultats
- Alertes en temps réel
- Notifications de non-conformité

### Rapports et Traçabilité
- Rapports de conformité
- Historique complet
- Export des données

## Configuration
1. Définir la fréquence des contrôles
2. Configurer les seuils d'alerte
3. Paramétrer la rétention des données
4. Activer la validation automatique

## Utilisation Quotidienne
1. Effectuer les contrôles planifiés
2. Vérifier les cartes de contrôle
3. Traiter les alertes
4. Valider les résultats
    `,
    en: `
# Quality Control Module

## Overview
The Quality Control module ensures compliance and reliability of laboratory analyses through a comprehensive quality control system.

## Main Features

### Control Sample Management
- Creation and tracking of control samples
- Definition of target values and limits
- Automatic control scheduling

### Control Charts
- Levey-Jennings charts
- Westgard rules
- Automatic drift detection

### Validation and Alerts
- Automatic result validation
- Real-time alerts
- Non-compliance notifications

### Reports and Traceability
- Compliance reports
- Complete history
- Data export

## Configuration
1. Define control frequency
2. Configure alert thresholds
3. Set data retention
4. Enable auto validation

## Daily Usage
1. Perform scheduled controls
2. Check control charts
3. Handle alerts
4. Validate results
    `
  }
};