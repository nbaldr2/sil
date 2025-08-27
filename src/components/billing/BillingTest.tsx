import React from 'react';
import { useAuth } from '../../App';

const BillingTest: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Billing Manager Test</h1>
      <div className="space-y-4">
        <div>
          <strong>User:</strong> {user ? user.name : 'Not logged in'}
        </div>
        <div>
          <strong>Role:</strong> {user ? user.role : 'No role'}
        </div>
        <div>
          <strong>Email:</strong> {user ? user.email : 'No email'}
        </div>
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">✅ Billing Manager route is working!</p>
          <p className="text-sm text-green-600 mt-2">
            If you can see this message, the route is properly configured and the component is rendering.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingTest;