import React, { useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';

export const ConfirmationDialogDemo = () => {
  const [showDanger, setShowDanger] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (type: string) => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    
    // Close the appropriate dialog
    switch (type) {
      case 'danger':
        setShowDanger(false);
        break;
      case 'warning':
        setShowWarning(false);
        break;
      case 'info':
        setShowInfo(false);
        break;
      case 'success':
        setShowSuccess(false);
        break;
    }
    
    alert(`${type} action completed!`);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Confirmation Dialog Demo</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowDanger(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Show Danger Dialog
        </button>
        
        <button
          onClick={() => setShowWarning(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Show Warning Dialog
        </button>
        
        <button
          onClick={() => setShowInfo(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show Info Dialog
        </button>
        
        <button
          onClick={() => setShowSuccess(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show Success Dialog
        </button>
      </div>

      {/* Danger Dialog */}
      <ConfirmationDialog
        isOpen={showDanger}
        onClose={() => setShowDanger(false)}
        onConfirm={() => handleConfirm('danger')}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      {/* Warning Dialog */}
      <ConfirmationDialog
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => handleConfirm('warning')}
        title="Restore Backup"
        message="Are you sure you want to restore this backup? This will replace all current data."
        confirmText="Restore"
        cancelText="Cancel"
        type="warning"
        loading={loading}
      />

      {/* Info Dialog */}
      <ConfirmationDialog
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        onConfirm={() => handleConfirm('info')}
        title="Update Settings"
        message="Do you want to save these settings changes?"
        confirmText="Save"
        cancelText="Cancel"
        type="info"
        loading={loading}
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        onConfirm={() => handleConfirm('success')}
        title="Complete Task"
        message="Are you ready to mark this task as completed?"
        confirmText="Complete"
        cancelText="Cancel"
        type="success"
        loading={loading}
      />
    </div>
  );
};