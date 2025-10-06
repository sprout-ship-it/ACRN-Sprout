// src/components/features/matching/components/RequestList.js
import React from 'react';
import RequestCard from './RequestCard';

/**
 * RequestList Component
 * Renders a list of requests with appropriate empty states
 */
const RequestList = ({ 
  requests, 
  actions, 
  variant, 
  profileIds,
  actionLoading 
}) => {
  // Empty state configurations for different tabs
  const getEmptyStateConfig = () => {
    switch (variant) {
      case 'active-connections':
        return {
          icon: '🤝',
          title: 'No Active Connections',
          message: 'You don\'t have any active connections yet. Start by finding roommates, peer support, housing, or employment opportunities.'
        };
      case 'awaiting-response':
        return {
          icon: '📥',
          title: 'No Requests Awaiting Response',
          message: 'You don\'t have any requests awaiting your response.'
        };
      case 'sent-requests':
        return {
          icon: '📤',
          title: 'No Sent Requests',
          message: 'You haven\'t sent any pending requests.'
        };
      case 'connection-history':
        return {
          icon: '📋',
          title: 'No Connection History',
          message: 'Your past connections and rejected requests will appear here.'
        };
      default:
        return {
          icon: '🔍',
          title: 'No Requests Found',
          message: 'No requests found for this category.'
        };
    }
  };

  // Render empty state
  if (!requests || requests.length === 0) {
    const emptyState = getEmptyStateConfig();
    
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{emptyState.icon}</div>
        <h3 className="empty-state-title">{emptyState.title}</h3>
        <p>{emptyState.message}</p>
      </div>
    );
  }

  // Render request cards
  return (
    <div className="requests-list">
      {requests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          actions={actions}
          variant={variant}
          profileIds={profileIds}
          actionLoading={actionLoading}
        />
      ))}
    </div>
  );
};

export default RequestList;