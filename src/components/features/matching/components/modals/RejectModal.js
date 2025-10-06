// src/components/features/matching/components/modals/RejectModal.js
import React, { useState } from 'react';

/**
 * RejectModal Component
 * Modal for rejecting/declining connection requests with reason input
 */
const RejectModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading 
}) => {
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    onSubmit(rejectReason);
  };

  const handleClose = () => {
    setRejectReason(''); // Clear reason when closing
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '500px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Decline Connection Request</h3>
          <button
            className="modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Please provide a brief reason for declining this connection request:
        </p>
        
        <textarea
          className="input mb-4"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g., Different preferences, timing not right, looking for different location, etc."
          style={{ minHeight: '100px', resize: 'vertical' }}
          disabled={loading}
        />
        
        <div className="grid-2">
          <button
            className="btn btn-outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleSubmit}
            disabled={loading || !rejectReason.trim()}
          >
            {loading ? 'Declining...' : 'Decline Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;