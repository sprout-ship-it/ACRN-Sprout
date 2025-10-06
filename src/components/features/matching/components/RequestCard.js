// src/components/features/matching/components/RequestCard.js
import React from 'react';

/**
 * RequestCard Component
 * Renders an individual request card with appropriate actions based on variant
 */
const RequestCard = ({ 
  request, 
  actions, 
  variant, 
  profileIds,
  actionLoading 
}) => {
  
  // Connection type utilities
  const getConnectionType = (request) => {
    const typeMap = {
      'housing': 'Housing',
      'employment': 'Employment',
      'peer-support': 'Peer Support',
      'roommate': 'Roommate'
    };
    return typeMap[request.request_type] || 'Connection';
  };

  const getConnectionIcon = (request) => {
    const iconMap = {
      'housing': '🏠',
      'employment': '💼',
      'peer-support': '🤝',
      'roommate': '👥'
    };
    return iconMap[request.request_type] || '🔗';
  };

  // Status badge rendering
  const renderStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-error',
      matched: 'badge-success',
      withdrawn: 'badge',
      cancelled: 'badge'
    }[status] || 'badge';
    
    return (
      <span className={`badge ${statusClass}`}>
        {status === 'accepted' ? 'Active' : status === 'pending' ? 'Pending' : status}
      </span>
    );
  };

  // Determine user relationship to request
  const isRecipient = (
    (request.recipient_type === 'applicant' && request.recipient_id === profileIds.applicant) ||
    (request.recipient_type === 'peer-support' && request.recipient_id === profileIds.peerSupport) ||
    (request.recipient_type === 'landlord' && request.recipient_id === profileIds.landlord) ||
    (request.recipient_type === 'employer' && request.recipient_id === profileIds.employer)
  );

  const isSent = !isRecipient;

  // Get display name from profile data - show the OTHER person's name
  const getDisplayName = () => {
    // If current user is recipient, show requester's name
    // If current user is requester, show recipient's name
    const otherProfile = isRecipient 
      ? request.requester_profile?.registrant_profiles
      : request.recipient_profile?.registrant_profiles;
    
    if (otherProfile?.first_name) {
      return otherProfile.first_name;
    }
    
    // Fallback: try to get any available name that's not the current user
    if (!isRecipient && request.recipient_profile?.registrant_profiles?.first_name) {
      return request.recipient_profile.registrant_profiles.first_name;
    }
    if (isRecipient && request.requester_profile?.registrant_profiles?.first_name) {
      return request.requester_profile.registrant_profiles.first_name;
    }
    
    return 'Unknown User';
  };

  // Render action buttons based on variant and request status
  const renderActionButtons = () => {
    const { status } = request;

    // Awaiting response (received requests)
    if (variant === 'awaiting-response' && status === 'pending' && isRecipient) {
      return (
        <div className="grid-3">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => actions.onViewDetails?.(request)}
            disabled={actionLoading}
          >
            View Details
          </button>
          
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => actions.onApprove(request.id)}
            disabled={actionLoading}
          >
            Accept
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => actions.onReject(request)}
            disabled={actionLoading}
          >
            Decline
          </button>
        </div>
      );
    }

    // Sent requests
    if (variant === 'sent-requests' && status === 'pending' && isSent) {
      return (
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => actions.onCancel(request.id)}
            disabled={actionLoading}
          >
            Cancel Request
          </button>
        </div>
      );
    }

    // Active connections
    if (variant === 'active-connections' && status === 'accepted') {
      return (
        <div className="grid-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => actions.onViewContact?.(request)}
          >
            View Contact Info
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => actions.onUnmatch(request.id)}
            disabled={actionLoading}
          >
            End Connection
          </button>
        </div>
      );
    }

    // Connection history - allow reconnection for withdrawn requests
    if (variant === 'connection-history' && status === 'withdrawn') {
      return (
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => actions.onReconnect(request)}
            disabled={actionLoading}
          >
            Request Reconnection
          </button>
        </div>
      );
    }

    return null;
  };

  // Get subtitle text based on variant
  const getSubtitle = () => {
    const date = new Date(request.responded_at || request.created_at).toLocaleDateString();
    
    switch (variant) {
      case 'active-connections':
        return `Connected on ${date}`;
      case 'awaiting-response':
        return `Request from on ${date}`;
      case 'sent-requests':
        return `Sent on ${date}`;
      case 'connection-history':
        return `${getConnectionType(request)} on ${date}`;
      default:
        return date;
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div>
          <div className="card-title">
            {getConnectionIcon(request)} {getDisplayName()}
          </div>
          <div className="card-subtitle">
            {getSubtitle()}
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
          
          <div>
            <span className="label">Status</span>
            <span className="text-gray-800">
              {variant === 'active-connections' 
                ? 'Active Connection'
                : variant === 'awaiting-response'
                ? 'Pending your approval'
                : variant === 'sent-requests'
                ? 'Pending their approval'
                : request.status.charAt(0).toUpperCase() + request.status.slice(1)
              }
            </span>
          </div>
        </div>
        
        {request.message && (
          <div className="mb-4">
            <div className="label mb-2">
              {variant === 'sent-requests' ? 'Your Message' : 
               variant === 'awaiting-response' ? 'Their Message' : 
               'Original Message'}
            </div>
            <div className="alert alert-info">
              {request.message}
            </div>
          </div>
        )}
        
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default RequestCard;