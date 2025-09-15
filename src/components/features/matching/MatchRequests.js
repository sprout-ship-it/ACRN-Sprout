// src/components/dashboard/MatchRequests.js - FIXED CONNECTION SYSTEM
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import '../../../styles/global.css';

const Connections = () => {
  const { user, profile, hasRole } = useAuth();
  
  // ✅ FIXED: Start with Active Connections as default tab
  const [activeTab, setActiveTab] = useState('active-connections');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  
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
      case 'active-connections':
        return requests.filter(r => r.status === 'matched');
      case 'awaiting-response':
        return requests.filter(r => r.status === 'pending' && r.target_id === user.id);
      case 'sent-requests':
        return requests.filter(r => r.status === 'pending' && r.requester_id === user.id);
      case 'connection-history':
        return requests.filter(r => ['rejected', 'unmatched', 'cancelled'].includes(r.status));
      default:
        return requests;
    }
  };
  
  // Get tab counts
  const getTabCounts = () => {
    return {
      activeConnections: requests.filter(r => r.status === 'matched').length,
      awaitingResponse: requests.filter(r => r.status === 'pending' && r.target_id === user.id).length,
      sentRequests: requests.filter(r => r.status === 'pending' && r.requester_id === user.id).length,
      connectionHistory: requests.filter(r => ['rejected', 'unmatched', 'cancelled'].includes(r.status)).length
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
  
  // ✅ FIXED: Improved approval workflow based on new architecture
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    
    try {
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

      // ✅ SIMPLIFIED: For employment connections, just approve the request (no match group needed)
      if (request.request_type === 'employment') {
        const { error: updateError } = await db.matchRequests.update(requestId, {
          status: 'matched',
          target_approved: true,
          matched_at: new Date().toISOString()
        });
        
        if (updateError) {
          throw updateError;
        }

        console.log('✅ Employment connection approved (no match group created)');
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'matched',
            target_approved: true,
            matched_at: new Date().toISOString()
          } : req
        ));
        
        alert('Employment connection approved! You can now exchange contact information.');
        return;
      }

      // ✅ FIXED: For all other connection types, create match group first
      console.log('🏠 Creating match group for household/support connection...');

      // Step 1: Determine match group structure based on connection type
      const matchGroupData = await determineMatchGroupStructure(request);

      // Step 2: Create the match group
      const { data: matchGroup, error: groupError } = await db.matchGroups.create(matchGroupData);

      if (groupError) {
        console.error('❌ Failed to create match group:', groupError);
        throw groupError;
      }

      console.log('✅ Match group created:', matchGroup);

      // Step 3: Update match request to matched status with group reference
      const { error: matchedError } = await db.matchRequests.update(requestId, {
        status: 'matched',
        target_approved: true,
        match_group_id: matchGroup[0].id,
        matched_at: new Date().toISOString()
      });

      if (matchedError) {
        console.error('❌ Failed to update to matched status:', matchedError);
        throw matchedError;
      }

      console.log('✅ Connection request updated to matched status with match group');

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
      
      alert('Connection approved and match group created successfully!');
      
    } catch (error) {
      console.error('💥 Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ IMPROVED: Better match group structure determination
  const determineMatchGroupStructure = async (request) => {
    try {
      const { data: requesterProfile } = await db.profiles.getById(request.requester_id);
      const { data: targetProfile } = await db.profiles.getById(request.target_id);

      const requesterRoles = requesterProfile?.roles || [];
      const targetRoles = targetProfile?.roles || [];

      const baseData = {
        status: 'forming',
        created_at: new Date().toISOString(),
        connection_type: request.request_type
      };

      // ✅ FIXED: Improved role-based match group creation
      if (request.request_type === 'peer_support') {
        if (requesterRoles.includes('applicant') && targetRoles.includes('peer')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            peer_support_id: request.target_id
          };
        }
        
        if (requesterRoles.includes('peer') && targetRoles.includes('applicant')) {
          return {
            ...baseData,
            applicant_1_id: request.target_id,
            peer_support_id: request.requester_id
          };
        }
      }

      if (request.request_type === 'housing') {
        if (requesterRoles.includes('applicant') && targetRoles.includes('landlord')) {
          return {
            ...baseData,
            applicant_1_id: request.requester_id,
            landlord_id: request.target_id
          };
        }
        
        if (requesterRoles.includes('landlord') && targetRoles.includes('applicant')) {
          return {
            ...baseData,
            applicant_1_id: request.target_id,
            landlord_id: request.requester_id
          };
        }
      }

      // ✅ NEW: Default to roommate setup (both are applicants)
      if (request.request_type === 'roommate' || !request.request_type) {
        return {
          ...baseData,
          applicant_1_id: request.requester_id,
          applicant_2_id: request.target_id
        };
      }

      // ✅ FALLBACK: Default structure
      return {
        ...baseData,
        applicant_1_id: request.requester_id,
        applicant_2_id: request.target_id
      };

    } catch (error) {
      console.error('Error determining match group structure:', error);
      // Safe fallback
      return {
        status: 'forming',
        applicant_1_id: request.requester_id,
        applicant_2_id: request.target_id,
        connection_type: request.request_type || 'roommate',
        created_at: new Date().toISOString()
      };
    }
  };
  
  // Handle reject request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setShowContactModal(false);
    setContactInfo(null);
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
        rejection_reason: rejectReason,
        rejected_at: new Date().toISOString()
      };

      const { error } = await db.matchRequests.update(selectedRequest.id, updates);
      
      if (error) throw error;

      setRequests(prev => prev.map(request => 
        request.id === selectedRequest.id ? { ...request, ...updates } : request
      ));
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      setShowContactModal(false);
      setContactInfo(null);
      
      alert('Connection request rejected.');
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FIXED: Handle cancel sent request with cancelled_at timestamp
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

      // ✅ FIXED: Only end match group for non-employment connections
      if (request.match_group_id && request.request_type !== 'employment') {
        const { error: groupError } = await db.matchGroups.endGroup(
          request.match_group_id,
          user.id,
          'User initiated disconnect'
        );
        
        if (groupError) {
          console.error('❌ Failed to end match group:', groupError);
          throw groupError;
        }
      }

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

  // ✅ IMPROVED: Handle view contact info for both employment and household connections
  const handleViewContactInfo = async (request) => {
    try {
      // ✅ NEW: For employment connections, get contact info directly from profiles
      if (request.request_type === 'employment') {
        const otherUserId = request.requester_id === user.id ? request.target_id : request.requester_id;
        const { data: otherProfile, error } = await db.profiles.getById(otherUserId);
        
        if (error) {
          console.error('Error fetching profile:', error);
          alert('Failed to load contact information.');
          return;
        }

        if (!otherProfile) {
          alert('Could not find contact information.');
          return;
        }

        // Get additional contact info from employer profile if available
        let phoneNumber = 'Not provided';
        let website = null;
        
        if (otherProfile.roles?.includes('employer')) {
          try {
            const { data: employerProfiles } = await db.employerProfiles.getByUserId(otherUserId);
            if (employerProfiles && employerProfiles.length > 0) {
              const employerProfile = employerProfiles[0];
              phoneNumber = employerProfile.phone || employerProfile.contact_phone || 'Not provided';
              website = employerProfile.website;
            }
          } catch (err) {
            console.warn('Could not load employer profile:', err);
          }
        }

        setContactInfo({
          name: otherProfile.first_name,
          email: otherProfile.email || 'Not provided',
          phone: phoneNumber,
          website: website,
          connectionType: 'employment opportunity'
        });
        
        setShowContactModal(true);
        return;
      }

      // ✅ EXISTING: For household connections, use match group
      if (!request.match_group_id) {
        alert('No match group found for this connection.');
        return;
      }

      const { data: matchGroup, error } = await db.matchGroups.getById(request.match_group_id);
      
      if (error) {
        console.error('Error fetching match group:', error);
        alert('Failed to load contact information.');
        return;
      }

      const otherPerson = db.matchGroups.getOtherPerson(matchGroup, user.id);

      if (!otherPerson) {
        alert('Could not determine contact information.');
        return;
      }

      let phoneNumber = 'Not provided';
      
      if (otherPerson.applicant_forms && otherPerson.applicant_forms.length > 0 && otherPerson.applicant_forms[0].phone) {
        phoneNumber = otherPerson.applicant_forms[0].phone;
      }
      else if (otherPerson.peer_support_profiles && otherPerson.peer_support_profiles.length > 0 && otherPerson.peer_support_profiles[0].phone) {
        phoneNumber = otherPerson.peer_support_profiles[0].phone;
      }
      else if (otherPerson.properties && otherPerson.properties.length > 0 && otherPerson.properties[0].phone) {
        phoneNumber = otherPerson.properties[0].phone;
      }
      else if (otherPerson.employer_profiles && otherPerson.employer_profiles.length > 0 && otherPerson.employer_profiles[0].phone) {
        phoneNumber = otherPerson.employer_profiles[0].phone;
      }
      else if (otherPerson.phone) {
        phoneNumber = otherPerson.phone;
      }

      const matchType = db.matchGroups.getMatchType(matchGroup);
      const matchTypeLabel = {
        'housing': 'housing connection',
        'peer_support': 'peer support connection',
        'applicant_peer': 'roommate connection',
        'employment': 'employment connection'
      }[matchType] || 'connection';

      setContactInfo({
        name: otherPerson.first_name,
        email: otherPerson.email || 'Not provided',
        phone: phoneNumber,
        connectionType: matchTypeLabel
      });
      
      setShowContactModal(true);

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
        : "You don't have any requests awaiting your response.";
      
      const emptyIcon = isSentRequests ? '📤' : '📥';
      const emptyTitle = isSentRequests ? 'No Sent Requests' : 'No Requests Awaiting Response';

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
            
            <div>
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
              
              {request.message && (
                <div className="mb-4">
                  <div className="label mb-2">{isSentRequests ? 'Your Message' : 'Their Message'}</div>
                  <div className="alert alert-info">
                    {request.message}
                  </div>
                </div>
              )}
              
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
          <p>You don't have any active connections yet. Start by finding roommates, peer support, housing, or employment opportunities.</p>
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
                      
                      {request.message && (
                        <div className="mb-4">
                          <div className="label mb-2">Original Message</div>
                          <div className="alert alert-info">
                            {request.message}
                          </div>
                        </div>
                      )}
                      
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
      
      {/* ✅ FIXED: Reordered tabs with Active Connections first and renamed Pending Requests */}
      <div className="navigation mb-5">
        <ul className="nav-list">
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
              className={`nav-button ${activeTab === 'awaiting-response' ? 'active' : ''}`}
              onClick={() => setActiveTab('awaiting-response')}
            >
              <span className="nav-icon">📥</span>
              Requests Awaiting Response ({tabCounts.awaitingResponse})
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
      {activeTab === 'active-connections' && renderActiveMatches()}
      {activeTab === 'awaiting-response' && renderPendingRequests(false)}
      {activeTab === 'sent-requests' && renderPendingRequests(true)}
      {activeTab === 'connection-history' && (
        getFilteredRequests().length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No Connection History</h3>
            <p>Your past connections and rejected requests will appear here.</p>
          </div>
        ) : (
          getFilteredRequests().map(request => (
            <div key={request.id} className="card mb-4">
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
              
              <div>
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
                
                {request.message && (
                  <div className="mb-4">
                    <div className="label mb-2">Message</div>
                    <div className="alert alert-info">
                      {request.message}
                    </div>
                  </div>
                )}
                
                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mb-4">
                    <div className="label mb-2">Reason</div>
                    <div className="alert alert-warning">
                      {request.rejection_reason}
                    </div>
                  </div>
                )}
                
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

      {/* ✅ IMPROVED: Contact Info Modal with employment support */}
      {showContactModal && contactInfo && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">📞 Contact Information</h3>
              <button
                className="modal-close"
                onClick={() => setShowContactModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {contactInfo.connectionType === 'employment opportunity' ? '💼' : '👤'}
              </div>
              <h4 style={{ color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
                {contactInfo.name}
              </h4>
              <p className="text-gray-600" style={{ margin: 0 }}>
                Your {contactInfo.connectionType} contact
              </p>
            </div>
            
            <div className="contact-details" style={{ marginBottom: '2rem' }}>
              <div className="contact-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem', 
                background: 'var(--bg-light-cream)', 
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📧</div>
                <div>
                  <div className="label" style={{ marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
                    {contactInfo.email}
                  </div>
                  {contactInfo.email !== 'Not provided' && (
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      style={{ color: 'var(--primary-purple)', fontSize: '0.9rem' }}
                    >
                      Send Email →
                    </a>
                  )}
                </div>
              </div>
              
              <div className="contact-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem', 
                background: 'var(--bg-light-cream)', 
                borderRadius: 'var(--radius-md)',
                marginBottom: contactInfo.website ? '1rem' : '0'
              }}>
                <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📱</div>
                <div>
                  <div className="label" style={{ marginBottom: '0.25rem' }}>Phone</div>
                  <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
                    {contactInfo.phone}
                  </div>
                  {contactInfo.phone !== 'Not provided' && (
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      style={{ color: 'var(--primary-purple)', fontSize: '0.9rem' }}
                    >
                      Call Now →
                    </a>
                  )}
                </div>
              </div>

              {/* ✅ NEW: Website link for employment connections */}
              {contactInfo.website && (
                <div className="contact-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  background: 'var(--bg-light-cream)', 
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>🌐</div>
                  <div>
                    <div className="label" style={{ marginBottom: '0.25rem' }}>Website</div>
                    <a 
                      href={contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-purple)', fontWeight: '600' }}
                    >
                      Visit Company Website →
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <strong>💡 Next Steps:</strong> Reach out to {contactInfo.name} to coordinate your {contactInfo.connectionType}. 
              Remember to be respectful and professional in all communications.
            </div>
            
            <div className="text-center">
              <button
                className="btn btn-primary"
                onClick={() => setShowContactModal(false)}
                style={{ minWidth: '150px' }}
              >
                Got It!
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