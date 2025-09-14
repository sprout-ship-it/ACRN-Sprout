// src/components/dashboard/MatchRequests.js - COMPLETE WITH PENDING REQUESTS
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const Connections = () => {
  const { user, profile, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('pending-requests'); // Start with pending requests
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
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter requests based on active tab
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending-requests':
        // Show incoming pending requests that need user's approval
        return requests.filter(r => r.status === 'pending' && r.target_id === user.id);
      case 'sent-requests':
        // Show outgoing pending requests waiting for other person's approval
        return requests.filter(r => r.status === 'pending' && r.requester_id === user.id);
      case 'active-connections':
        // Show active connections: matched status for current connections
        return requests.filter(r => r.status === 'matched');
      case 'connection-history':
        // Show all previous matches including unmatched, rejected, etc.
        return requests.filter(r => ['rejected', 'unmatched'].includes(r.status));
      default:
        return requests;
    }
  };
  
  // Get tab counts
  const getTabCounts = () => {
    return {
      pendingRequests: requests.filter(r => r.status === 'pending' && r.target_id === user.id).length,
      sentRequests: requests.filter(r => r.status === 'pending' && r.requester_id === user.id).length,
      activeConnections: requests.filter(r => r.status === 'matched').length,
      connectionHistory: requests.filter(r => ['rejected', 'unmatched'].includes(r.status)).length
    };
  };
  
  // Get connection type display name
  const getConnectionType = (request) => {
    const typeMap = {
      'roommate': 'Roommate',
      'peer_support': 'Peer Support',
      'employment': 'Employment',
      'housing': 'Housing'
    };
    return typeMap[request.request_type] || 'Connection';
  };

  // Get connection type icon
  const getConnectionIcon = (request) => {
    const iconMap = {
      'roommate': '🏠',
      'peer_support': '🤝',
      'employment': '💼',
      'housing': '🏢'
    };
    return iconMap[request.request_type] || '🔗';
  };

  // Organize active matches by type for better display
  const getActiveMatchesByType = () => {
    const activeMatches = requests.filter(r => r.status === 'matched');
    const organized = {
      roommate: [],
      peer_support: [],
      employment: [],
      housing: []
    };

    activeMatches.forEach(request => {
      const type = request.request_type || 'roommate';
      if (organized[type]) {
        organized[type].push(request);
      }
    });

    return organized;
  };
  
  // Handle approve request
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    
    try {
      // Get the full request details
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      console.log('📋 Approving connection request:', {
        requestId,
        requester: request.requester_id,
        target: request.target_id,
        requestType: request.request_type
      });

      // Step 1: Update match request to approved
      const { error: updateError } = await db.matchRequests.update(requestId, {
        status: 'approved',
        target_approved: true
      });
      
      if (updateError) {
        console.error('❌ Failed to update match request:', updateError);
        throw updateError;
      }

      console.log('✅ Connection request updated to approved');

      // Step 2: Determine match group structure based on request type and user roles
      const matchGroupData = await determineMatchGroupStructure(request);

      const { data: matchGroup, error: groupError } = await db.matchGroups.create(matchGroupData);

      if (groupError) {
        console.error('❌ Failed to create match group:', groupError);
        throw groupError;
      }

      console.log('✅ Match group created:', matchGroup);

      // Step 3: Update match request to matched status
      const { error: matchedError } = await db.matchRequests.update(requestId, {
        status: 'matched',
        match_group_id: matchGroup[0].id,
        matched_at: new Date().toISOString()
      });

      if (matchedError) {
        console.error('❌ Failed to update to matched status:', matchedError);
        throw matchedError;
      }

      console.log('✅ Connection request updated to matched status');

      // Step 4: Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { 
          ...req, 
          status: 'matched',
          target_approved: true,
          match_group_id: matchGroup[0].id,
          matched_at: new Date().toISOString()
        } : req
      ));
      
      alert('Connection approved and created successfully!');
      
    } catch (error) {
      console.error('💥 Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to determine correct table structure
  const determineMatchGroupStructure = async (request) => {
    try {
      // Get user profiles to determine roles
      const { data: requesterProfile } = await db.profiles.getById(request.requester_id);
      const { data: targetProfile } = await db.profiles.getById(request.target_id);

      const requesterRoles = requesterProfile?.roles || [];
      const targetRoles = targetProfile?.roles || [];

      // Base match group data
      const baseData = {
        status: 'forming', // Start as forming, activate later if needed
        created_at: new Date().toISOString()
      };

      // Determine structure based on request type and roles
      if (request.request_type === 'peer_support' || !request.request_type) {
        
        // Case 1: Applicant requesting peer support specialist
        if (requesterRoles.includes('applicant') && targetRoles.includes('peer')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            peer_support_id: request.target_id
          };
        }
        
        // Case 2: Peer support specialist connecting with applicant
        if (requesterRoles.includes('peer') && targetRoles.includes('applicant')) {
          return {
            ...baseData,
            applicant_1_id: request.target_id,
            peer_support_id: request.requester_id
          };
        }
        
        // Case 3: Two applicants doing peer support
        if (requesterRoles.includes('applicant') && targetRoles.includes('applicant')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            applicant_2_id: request.target_id
          };
        }
      }

      // Case 4: Employment request
      if (request.request_type === 'employment') {
        if (requesterRoles.includes('applicant') && targetRoles.includes('employer')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            employer_id: request.target_id
          };
        }
      }

      // Case 5: Housing request
      if (request.request_type === 'housing') {
        if (requesterRoles.includes('applicant') && targetRoles.includes('landlord')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            landlord_id: request.target_id,
            // property_id would be set when landlord selects a property
          };
        }
      }

      // Default fallback - treat as applicant peer support
      return {
        ...baseData,
        applicant_1_id: request.requester_id,
        applicant_2_id: request.target_id
      };

    } catch (error) {
      console.error('Error determining match group structure:', error);
      // Fallback structure
      return {
        status: 'forming',
        applicant_1_id: request.requester_id,
        applicant_2_id: request.target_id,
        created_at: new Date().toISOString()
      };
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
      
      alert('Connection request rejected.');
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel sent request
  const handleCancelSentRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const { error } = await db.matchRequests.update(requestId, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      });
      
      if (error) throw error;

      // Update local state - remove cancelled requests from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('Request cancelled successfully.');
      
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle unmatch
  const handleUnmatch = async (requestId) => {
    if (!window.confirm('Are you sure you want to end this connection? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      console.log('📋 Ending connection:', {
        requestId,
        matchGroupId: request.match_group_id
      });

      // Step 1: End the match group if it exists
      if (request.match_group_id) {
        const { error: groupError } = await db.matchGroups.endGroup(
          request.match_group_id,
          user.id,
          'User initiated disconnect'
        );
        
        if (groupError) {
          console.error('❌ Failed to end match group:', groupError);
          throw groupError;
        }

        console.log('✅ Match group ended');
      }

      // Step 2: Update match request to unmatched
      const updates = {
        status: 'unmatched',
        unmatched_at: new Date().toISOString(),
        unmatched_by: user.id
      };

      const { error: updateError } = await db.matchRequests.update(requestId, updates);
      
      if (updateError) {
        console.error('❌ Failed to update match request:', updateError);
        throw updateError;
      }

      console.log('✅ Connection updated to ended');

      // Step 3: Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updates } : req
      ));
      
      alert('Connection ended successfully.');
      
    } catch (error) {
      console.error('💥 Error ending connection:', error);
      alert(`Failed to end connection: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // UPDATED: Enhanced handleViewContactInfo function with proper phone extraction
  const handleViewContactInfo = async (request) => {
    try {
      if (!request.match_group_id) {
        alert('No match group found for this connection.');
        return;
      }

      // Get full match group details with contact info
      const { data: matchGroup, error } = await db.matchGroups.getById(request.match_group_id);
      
      if (error) {
        console.error('Error fetching match group:', error);
        alert('Failed to load contact information.');
        return;
      }

      // Use the helper function to get the other person
      const otherPerson = db.matchGroups.getOtherPerson(matchGroup, user.id);

      if (!otherPerson) {
        alert('Could not determine contact information.');
        return;
      }

      // Extract phone number from nested data structure based on user type
      let phoneNumber = 'Not provided';
      
      // For applicants: phone is in applicant_forms array
      if (otherPerson.applicant_forms && otherPerson.applicant_forms.length > 0 && otherPerson.applicant_forms[0].phone) {
        phoneNumber = otherPerson.applicant_forms[0].phone;
      }
      // For peer supporters: phone is in peer_support_profiles array  
      else if (otherPerson.peer_support_profiles && otherPerson.peer_support_profiles.length > 0 && otherPerson.peer_support_profiles[0].phone) {
        phoneNumber = otherPerson.peer_support_profiles[0].phone;
      }
      // For landlords: phone is in properties array
      else if (otherPerson.properties && otherPerson.properties.length > 0 && otherPerson.properties[0].phone) {
        phoneNumber = otherPerson.properties[0].phone;
      }
      // For employers: phone is in employer_profiles array
      else if (otherPerson.employer_profiles && otherPerson.employer_profiles.length > 0 && otherPerson.employer_profiles[0].phone) {
        phoneNumber = otherPerson.employer_profiles[0].phone;
      }
      // Fallback: check if phone is directly on the person object
      else if (otherPerson.phone) {
        phoneNumber = otherPerson.phone;
      }

      // Determine match type for context
      const matchType = db.matchGroups.getMatchType(matchGroup);
      const matchTypeLabel = {
        'housing': 'housing connection',
        'peer_support': 'peer support connection',
        'applicant_peer': 'peer support connection',
        'employment': 'employment connection'
      }[matchType] || 'connection';

      // Create contact info display
      const contactInfo = `
Contact Information for ${otherPerson.first_name}:

Email: ${otherPerson.email || 'Not provided'}
Phone: ${phoneNumber}

You can now reach out to continue your ${matchTypeLabel}!
      `;

      alert(contactInfo);

      // Optional: Update activity timestamp
      try {
        await db.matchGroups.update(request.match_group_id, {
          updated_at: new Date().toISOString()
        });
      } catch (updateError) {
        console.warn('Could not update match group activity:', updateError);
      }

    } catch (error) {
      console.error('Error viewing contact info:', error);
      alert('Failed to load contact information.');
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-warning',
      approved: 'badge-info',
      rejected: 'badge-error',
      matched: 'badge-success',
      unmatched: 'badge',
      cancelled: 'badge'
    }[status] || 'badge';
    
    return (
      <span className={`badge ${statusClass}`}>
        {status === 'matched' ? 'Active' : status === 'pending' ? 'Pending' : status}
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
            Accept
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleReject(request)}
            disabled={actionLoading}
          >
            Decline
          </button>
        </div>
      );
    }
    
    if (status === 'pending' && isSent) {
      return (
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleCancelSentRequest(request.id)}
            disabled={actionLoading}
          >
            Cancel Request
          </button>
        </div>
      );
    }
    
    if (status === 'matched') {
      return (
        <div className="grid-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleViewContactInfo(request)}
          >
            View Contact Info
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleUnmatch(request.id)}
            disabled={actionLoading}
          >
            End Connection
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
            Request Reconnection
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

  // Render pending requests (both incoming and outgoing)
  const renderPendingRequests = (isSentRequests = false) => {
    const filteredRequests = getFilteredRequests();

    if (filteredRequests.length === 0) {
      const emptyMessage = isSentRequests 
        ? "You haven't sent any pending requests."
        : "You don't have any pending requests to review.";
      
      const emptyIcon = isSentRequests ? '📤' : '📥';
      const emptyTitle = isSentRequests ? 'No Sent Requests' : 'No Pending Requests';

      return (
        <div className="empty-state">
          <div className="empty-state-icon">{emptyIcon}</div>
          <h3 className="empty-state-title">{emptyTitle}</h3>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="requests-list">
        {filteredRequests.map(request => (
          <div key={request.id} className="card mb-4">
            {/* Request Header */}
            <div className="card-header">
              <div>
                <div className="card-title">
                  {getConnectionIcon(request)} {getOtherPersonName(request)}
                </div>
                <div className="card-subtitle">
                  {getConnectionType(request)} • {isSentRequests ? 'Sent to' : 'Request from'} {getOtherPersonName(request)} on{' '}
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
                  <span className="label">Connection Type</span>
                  <span className="text-gray-800">
                    {getConnectionType(request)}
                  </span>
                </div>
                
                {request.match_score && (
                  <div>
                    <span className="label">Compatibility</span>
                    <span className="text-gray-800">
                      {request.match_score}%
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="label">Status</span>
                  <span className="text-gray-800">
                    Pending {isSentRequests ? 'their approval' : 'your approval'}
                  </span>
                </div>
              </div>
              
              {/* Message */}
              {request.message && (
                <div className="mb-4">
                  <div className="label mb-2">{isSentRequests ? 'Your Message' : 'Their Message'}</div>
                  <div className="alert alert-info">
                    {request.message}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              {renderActionButtons(request)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Active Matches organized by type
  const renderActiveMatches = () => {
    const matchesByType = getActiveMatchesByType();
    const hasAnyMatches = Object.values(matchesByType).some(matches => matches.length > 0);

    if (!hasAnyMatches) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <h3 className="empty-state-title">No Active Connections</h3>
          <p>You don't have any active connections yet. Start by finding roommates, peer support, or other services.</p>
        </div>
      );
    }

    return (
      <div className="connections-by-type">
        {Object.entries(matchesByType).map(([type, connections]) => {
          if (connections.length === 0) return null;

          return (
            <div key={type} className="connection-type-section mb-5">
              <h4 className="connection-type-title">
                {getConnectionIcon({ request_type: type })} {getConnectionType({ request_type: type }) + (connections.length > 1 ? 's' : '')}
                <span className="connection-count">({connections.length})</span>
              </h4>
              
              <div className="connections-grid">
                {connections.map(request => (
                  <div key={request.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {getOtherPersonName(request)}
                        </div>
                        <div className="card-subtitle">
                          Connected on {new Date(request.matched_at || request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {renderStatusBadge(request.status)}
                    </div>
                    
                    <div>
                      {/* Connection Info */}
                      <div className="grid-auto mb-4">
                        <div>
                          <span className="label">Connection Type</span>
                          <span className="text-gray-800">
                            {getConnectionType(request)}
                          </span>
                        </div>
                        
                        {request.match_score && (
                          <div>
                            <span className="label">Compatibility</span>
                            <span className="text-gray-800">
                              {request.match_score}%
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="label">Status</span>
                          <span className="text-gray-800">
                            Active Connection
                          </span>
                        </div>
                      </div>
                      
                      {/* Message */}
                      {request.message && (
                        <div className="mb-4">
                          <div className="label mb-2">Original Message</div>
                          <div className="alert alert-info">
                            {request.message}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      {renderActionButtons(request)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="content">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner message="Loading your connections..." />
        </div>
      </div>
    );
  }

  if (!hasRole('applicant') && !hasRole('peer') && !hasRole('landlord') && !hasRole('employer')) {
    return (
      <div className="content">
        <div className="alert alert-info">
          <p>Connections are available for all platform users.</p>
        </div>
      </div>
    );
  }

  const tabCounts = getTabCounts();
  
  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connections</h1>
        <p className="welcome-text">
          Manage your connection requests and active connections
        </p>
      </div>
      
      {/* Tabs */}
      <div className="navigation mb-5">
        <ul className="nav-list">
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'pending-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending-requests')}
            >
              <span className="nav-icon">📥</span>
              Pending Requests ({tabCounts.pendingRequests})
            </button>
          </li>
          
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'sent-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent-requests')}
            >
              <span className="nav-icon">📤</span>
              Sent Requests ({tabCounts.sentRequests})
            </button>
          </li>
          
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'active-connections' ? 'active' : ''}`}
              onClick={() => setActiveTab('active-connections')}
            >
              <span className="nav-icon">⚡</span>
              Active Connections ({tabCounts.activeConnections})
            </button>
          </li>
          
          <li className="nav-item">
            <button
              className={`nav-button ${activeTab === 'connection-history' ? 'active' : ''}`}
              onClick={() => setActiveTab('connection-history')}
            >
              <span className="nav-icon">📋</span>
              History ({tabCounts.connectionHistory})
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'pending-requests' && renderPendingRequests(false)}
      {activeTab === 'sent-requests' && renderPendingRequests(true)}
      {activeTab === 'active-connections' && renderActiveMatches()}
      {activeTab === 'connection-history' && (
        /* Connection History */
        getFilteredRequests().length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No Connection History</h3>
            <p>Your past connections and rejected requests will appear here.</p>
          </div>
        ) : (
          getFilteredRequests().map(request => (
            <div key={request.id} className="card mb-4">
              {/* Request Header */}
              <div className="card-header">
                <div>
                  <div className="card-title">
                    {getOtherPersonName(request)}
                  </div>
                  <div className="card-subtitle">
                    {getConnectionType(request)} • {getRequestDirection(request) === 'received' ? 'Received' : 'Sent'} on{' '}
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
                    <span className="label">Connection Type</span>
                    <span className="text-gray-800">
                      {getConnectionType(request)}
                    </span>
                  </div>
                  
                  {request.match_score && (
                    <div>
                      <span className="label">Compatibility</span>
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
                    <div className="label mb-2">Reason</div>
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
        )
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
              <h3 className="modal-title">Decline Connection Request</h3>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
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
              placeholder="e.g., Different preferences, timing not right, etc."
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
                {actionLoading ? 'Declining...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for connection type sections */}
      <style jsx>{`
        .connections-by-type {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .connection-type-section {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          border: 2px solid var(--border-beige);
        }

        .connection-type-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-beige);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .connection-count {
          color: var(--gray-600);
          font-weight: 500;
          font-size: 1rem;
        }

        .connections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .requests-list {
          max-width: 800px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .connections-grid {
            grid-template-columns: 1fr;
          }
          
          .connection-type-title {
            font-size: 1.1rem;
          }
          
          .nav-list {
            flex-direction: column;
          }
          
          .nav-button {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Connections;