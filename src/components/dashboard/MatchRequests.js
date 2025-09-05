// src/components/dashboard/MatchRequests.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const MatchRequests = () => {
  const { user, profile, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Load match requests
  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await db.matchRequests.getByUserId(user.id);
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading match requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter requests based on active tab
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'received':
        return requests.filter(r => r.target_id === user.id);
      case 'sent':
        return requests.filter(r => r.requester_id === user.id);
      case 'matched':
        return requests.filter(r => r.status === 'matched');
      case 'pending':
        return requests.filter(r => r.status === 'pending');
      default:
        return requests;
    }
  };
  
  // Get tab counts
  const getTabCounts = () => {
    return {
      all: requests.length,
      received: requests.filter(r => r.target_id === user.id).length,
      sent: requests.filter(r => r.requester_id === user.id).length,
      matched: requests.filter(r => r.status === 'matched').length,
      pending: requests.filter(r => r.status === 'pending').length
    };
  };
  
  // Handle approve request
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    
    try {
      const updates = {
        status: 'approved',
        target_approved: true
      };

      const { error } = await db.matchRequests.update(requestId, updates);
      
      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, ...updates } : request
      ));
      
      alert('Match request approved!');
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reject request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };
  
  // Submit rejection
  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    setActionLoading(true);
    
    try {
      const updates = {
        status: 'rejected',
        rejection_reason: rejectReason
      };

      const { error } = await db.matchRequests.update(selectedRequest.id, updates);
      
      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === selectedRequest.id ? { ...request, ...updates } : request
      ));
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      
      alert('Match request rejected.');
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle unmatch
  const handleUnmatch = async (requestId) => {
    if (!window.confirm('Are you sure you want to unmatch? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const updates = {
        status: 'unmatched',
        unmatched_at: new Date().toISOString(),
        unmatched_by: user.id
      };

      const { error } = await db.matchRequests.update(requestId, updates);
      
      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, ...updates } : request
      ));
      
      alert('Successfully unmatched.');
      
    } catch (error) {
      console.error('Error unmatching:', error);
      alert('Failed to unmatch. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-warning',
      approved: 'badge-info',
      rejected: 'badge-error',
      matched: 'badge-success',
      unmatched: 'badge'
    }[status] || 'badge';
    
    return (
      <span className={`badge ${statusClass}`}>
        {status}
      </span>
    );
  };
  
  // Render action buttons
  const renderActionButtons = (request) => {
    const isReceived = request.target_id === user.id;
    const isSent = request.requester_id === user.id;
    const { status } = request;
    
    if (status === 'pending' && isReceived) {
      return (
        <div className="grid-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleApprove(request.id)}
            disabled={actionLoading}
          >
            Approve
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleReject(request)}
            disabled={actionLoading}
          >
            Reject
          </button>
        </div>
      );
    }
    
    if (status === 'matched') {
      return (
        <div className="grid-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => alert('Opening contact information...')}
          >
            View Contact Info
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleUnmatch(request.id)}
            disabled={actionLoading}
          >
            Unmatch
          </button>
        </div>
      );
    }
    
    if (status === 'unmatched') {
      return (
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => alert('Sending reconnection request...')}
          >
            Request Rematch
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Get the other person's name from the request
  const getOtherPersonName = (request) => {
    if (request.requester_id === user.id) {
      return request.target?.first_name || 'Unknown User';
    } else {
      return request.requester?.first_name || 'Unknown User';
    }
  };

  // Get request direction
  const getRequestDirection = (request) => {
    return request.requester_id === user.id ? 'sent' : 'received';
  };

  if (loading) {
    return (
      <div className="content">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner message="Loading your match requests..." />
        </div>
      </div>
    );
  }

  if (!hasRole('applicant') && !hasRole('peer')) {
    return (
      <div className="content">
        <div className="alert alert-info">
          <p>Match requests are available for applicants and peer support specialists.</p>
        </div>
      </div>
    );
  }

  const filteredRequests = getFilteredRequests();
  const tabCounts = getTabCounts();
  
  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Match Requests</h1>
        <p className="welcome-text">
          Manage your incoming and outgoing match requests
        </p>
      </div>
      
      {/* Tabs */}
      <div className="navigation mb-5">
        <ul className="nav-list">
          {[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'received', label: 'Received', count: tabCounts.received },
            { id: 'sent', label: 'Sent', count: tabCounts.sent },
            { id: 'matched', label: 'Matched', count: tabCounts.matched },
            { id: 'pending', label: 'Pending', count: tabCounts.pending }
          ].map(tab => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <h3 className="empty-state-title">No {activeTab === 'all' ? '' : activeTab} requests</h3>
          <p>
            {activeTab === 'received' && 'You haven\'t received any match requests yet.'}
            {activeTab === 'sent' && 'You haven\'t sent any match requests yet.'}
            {activeTab === 'matched' && 'You don\'t have any active matches yet.'}
            {activeTab === 'pending' && 'You don\'t have any pending requests.'}
            {activeTab === 'all' && 'You don\'t have any match requests yet.'}
          </p>
        </div>
      ) : (
        filteredRequests.map(request => (
          <div
            key={request.id}
            className="card mb-4"
          >
            {/* Request Header */}
            <div className="card-header">
              <div>
                <div className="card-title">
                  {getOtherPersonName(request)}
                </div>
                <div className="card-subtitle">
                  {getRequestDirection(request) === 'received' ? 'Received' : 'Sent'} on{' '}
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
              {renderStatusBadge(request.status)}
            </div>
            
            {/* Request Body */}
            <div>
              {/* Basic Info */}
              <div className="grid-auto mb-4">
                <div>
                  <span className="label">Request Type</span>
                  <span className="text-gray-800">
                    {getRequestDirection(request) === 'received' ? 'Incoming' : 'Outgoing'}
                  </span>
                </div>
                
                {request.match_score && (
                  <div>
                    <span className="label">Match Score</span>
                    <span className="text-gray-800">
                      {request.match_score}%
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="label">Status</span>
                  <span className="text-gray-800">
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Message */}
              {request.message && (
                <div className="mb-4">
                  <div className="label mb-2">Message</div>
                  <div className="alert alert-info">
                    {request.message}
                  </div>
                </div>
              )}
              
              {/* Rejection Reason */}
              {request.status === 'rejected' && request.rejection_reason && (
                <div className="mb-4">
                  <div className="label mb-2">Rejection Reason</div>
                  <div className="alert alert-warning">
                    {request.rejection_reason}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              {renderActionButtons(request)}
            </div>
          </div>
        ))
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Reject Match Request</h3>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a brief reason for rejecting this match request:
            </p>
            
            <textarea
              className="input mb-4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Different lifestyle preferences, scheduling conflicts, etc."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
            
            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={submitRejection}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchRequests;