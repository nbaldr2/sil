import React from 'react';
import { BackupRestore } from './admin/BackupRestore';
import { AuditTrail } from './admin/AuditTrail';
import { PluginStore } from './admin/PluginStore';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('backup');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'backup' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('backup')}
          >
            Backup & Restore
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'audit' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Trail
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'plugins' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('plugins')}
          >
            Plugin Store
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        {activeTab === 'backup' && <BackupRestore />}
        {activeTab === 'audit' && <AuditTrail />}
        {activeTab === 'plugins' && <PluginStore />}
      </div>
    </div>
  );
};
