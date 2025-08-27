import React from 'react';
import { useAuth } from '../../App';

const MinimalBillingModule: React.FC = () => {
  console.log('MinimalBillingModule rendering');
  const { user } = useAuth();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'green', color: 'white', padding: '5px', zIndex: 9999 }}>
        MINIMAL BILLING MODULE LOADED
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        💰 Billing Manager
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">125,000 MAD</p>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pending Invoices</h3>
          <p className="text-2xl font-bold text-yellow-600">15</p>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Overdue Amount</h3>
          <p className="text-2xl font-bold text-red-600">25,000 MAD</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Create Invoice
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Record Payment
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            View Reports
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Settings
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
        <p className="text-green-800">
          ✅ Billing Manager is working! User: {user?.name || 'Unknown'} ({user?.role || 'No role'})
        </p>
      </div>
    </div>
  );
};

export default MinimalBillingModule;