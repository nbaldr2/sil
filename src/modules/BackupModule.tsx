import React from 'react';
import { Database, Download, Upload, Settings, Shield, Calendar, HardDrive } from 'lucide-react';
import { BackupRestore } from '../components/admin/BackupRestore';

export const BackupModule = {
  id: 'backup-manager',
  name: {
    fr: 'Gestionnaire de Sauvegarde',
    en: 'Backup Manager'
  },
  description: {
    fr: 'Système complet de sauvegarde et restauration avec rappels automatiques et gestion des paramètres',
    en: 'Complete backup and restore system with automatic reminders and settings management'
  },
  version: '1.0.0',
  category: 'system',
  icon: Database,
  color: 'bg-blue-600',
  features: {
    fr: [
      'Création de sauvegardes manuelles et automatiques',
      'Import/Export de fichiers de sauvegarde',
      'Restauration complète du système',
      'Rappels intelligents sur le tableau de bord',
      'Statistiques et monitoring des sauvegardes',
      'Configuration des paramètres de rétention',
      'Validation et compression des fichiers',
      'Suivi de progression en temps réel'
    ],
    en: [
      'Manual and automatic backup creation',
      'Import/Export backup files',
      'Complete system restoration',
      'Smart dashboard reminders',
      'Backup statistics and monitoring',
      'Retention settings configuration',
      'File validation and compression',
      'Real-time progress tracking'
    ]
  },
  permissions: ['ADMIN'],
  routes: [
    {
      path: '/backup',
      component: BackupRestore,
      name: {
        fr: 'Sauvegarde et Restauration',
        en: 'Backup & Restore'
      }
    }
  ],
  menuItems: [
    {
      name: {
        fr: 'Sauvegardes',
        en: 'Backups'
      },
      path: '/backup',
      icon: Database,
      permissions: ['ADMIN']
    }
  ],
  dashboardWidgets: [
    {
      id: 'backup-stats',
      name: {
        fr: 'Statistiques de Sauvegarde',
        en: 'Backup Statistics'
      },
      component: ({ language }: { language: 'fr' | 'en' }) => {
        const t = {
          fr: {
            title: 'Statistiques de Sauvegarde',
            totalBackups: 'Total Sauvegardes',
            lastBackup: 'Dernière Sauvegarde',
            totalSize: 'Taille Totale',
            status: 'Statut Système'
          },
          en: {
            title: 'Backup Statistics',
            totalBackups: 'Total Backups',
            lastBackup: 'Last Backup',
            totalSize: 'Total Size',
            status: 'System Status'
          }
        }[language];

        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.title}
              </h3>
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.totalBackups}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2d</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.lastBackup}</div>
              </div>
            </div>
          </div>
        );
      },
      size: 'small',
      permissions: ['ADMIN']
    }
  ],
  quickActions: [
    {
      name: {
        fr: 'Créer Sauvegarde',
        en: 'Create Backup'
      },
      icon: Download,
      action: 'create-backup',
      color: 'bg-blue-600',
      permissions: ['ADMIN']
    },
    {
      name: {
        fr: 'Importer Sauvegarde',
        en: 'Import Backup'
      },
      icon: Upload,
      action: 'import-backup',
      color: 'bg-green-600',
      permissions: ['ADMIN']
    },
    {
      name: {
        fr: 'Paramètres',
        en: 'Settings'
      },
      icon: Settings,
      action: 'backup-settings',
      color: 'bg-gray-600',
      permissions: ['ADMIN']
    }
  ],
  notifications: [
    {
      id: 'backup-reminder',
      type: 'warning',
      condition: 'daysSinceLastBackup >= 30',
      message: {
        fr: 'Il y a {days} jours depuis votre dernière sauvegarde',
        en: 'It has been {days} days since your last backup'
      },
      actions: [
        {
          label: { fr: 'Créer Sauvegarde', en: 'Create Backup' },
          action: 'create-backup'
        }
      ]
    }
  ],
  settings: [
    {
      key: 'autoBackupEnabled',
      name: {
        fr: 'Sauvegarde Automatique',
        en: 'Auto Backup'
      },
      type: 'boolean',
      default: false,
      description: {
        fr: 'Activer les sauvegardes automatiques',
        en: 'Enable automatic backups'
      }
    },
    {
      key: 'backupFrequency',
      name: {
        fr: 'Fréquence',
        en: 'Frequency'
      },
      type: 'select',
      options: [
        { value: 'DAILY', label: { fr: 'Quotidien', en: 'Daily' } },
        { value: 'WEEKLY', label: { fr: 'Hebdomadaire', en: 'Weekly' } },
        { value: 'MONTHLY', label: { fr: 'Mensuel', en: 'Monthly' } }
      ],
      default: 'WEEKLY'
    },
    {
      key: 'retentionDays',
      name: {
        fr: 'Rétention (jours)',
        en: 'Retention (days)'
      },
      type: 'number',
      min: 1,
      max: 365,
      default: 30
    }
  ],
  dependencies: [],
  author: 'SIL Lab Team',
  license: 'MIT',
  documentation: {
    fr: `
# Gestionnaire de Sauvegarde

## Vue d'ensemble
Le module Gestionnaire de Sauvegarde fournit un système complet de sauvegarde et restauration pour le système SIL Lab Management.

## Fonctionnalités
- Création de sauvegardes manuelles et automatiques
- Import/Export de fichiers de sauvegarde
- Restauration complète du système
- Rappels intelligents
- Statistiques et monitoring

## Utilisation
1. Accédez au module via le menu Configuration
2. Créez des sauvegardes manuelles ou configurez les sauvegardes automatiques
3. Gérez vos fichiers de sauvegarde
4. Surveillez les statistiques et les rappels

## Configuration
- Fréquence de sauvegarde automatique
- Politique de rétention
- Options de compression et chiffrement
    `,
    en: `
# Backup Manager

## Overview
The Backup Manager module provides a comprehensive backup and restore system for the SIL Lab Management System.

## Features
- Manual and automatic backup creation
- Import/Export backup files
- Complete system restoration
- Smart reminders
- Statistics and monitoring

## Usage
1. Access the module via Configuration menu
2. Create manual backups or configure automatic backups
3. Manage your backup files
4. Monitor statistics and reminders

## Configuration
- Automatic backup frequency
- Retention policy
- Compression and encryption options
    `
  }
};