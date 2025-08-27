import React from 'react';

const SimpleBillingTest: React.FC = () => {
  console.log('SimpleBillingTest rendering');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '400px' }}>
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
        🎯 BILLING MODULE TEST - THIS SHOULD BE VISIBLE
      </h1>
      <div style={{ border: '2px solid red', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <p style={{ fontSize: '18px', color: 'black' }}>
          If you can see this red text and border, the route is working correctly!
        </p>
        <p style={{ fontSize: '14px', color: 'gray', marginTop: '10px' }}>
          Route: /modules/billing-manager
        </p>
        <p style={{ fontSize: '14px', color: 'gray' }}>
          Component: SimpleBillingTest
        </p>
      </div>
    </div>
  );
};

export default SimpleBillingTest;