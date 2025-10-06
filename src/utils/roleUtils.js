// src/utils/roleUtils.js
/**
 * Role-specific utility functions for the matching system
 */

/**
 * Get role-specific tab labels based on user's primary role
 * @param {string} primaryRole - User's primary role
 * @returns {Object} Tab labels object
 */
export const getTabLabels = (primaryRole) => {
  switch (primaryRole) {
    case 'applicant':
      return {
        received: 'Awaiting Response',
        sent: 'Sent Requests', 
        active: 'Active Matches',
        history: 'Match History'
      };
    case 'peer-support':
      return {
        received: 'Client Requests',
        sent: 'Outreach Sent',
        active: 'Active Clients', 
        history: 'Client History'
      };
    case 'landlord':
      return {
        received: 'Tenant Applications',
        sent: 'Property Invites',
        active: 'Current Tenants',
        history: 'Rental History'
      };
    case 'employer':
      return {
        received: 'Job Applications', 
        sent: 'Job Offers',
        active: 'Current Employees',
        history: 'Hiring History'
      };
    default:
      return {
        received: 'Pending Requests',
        sent: 'Sent Requests',
        active: 'Active Connections', 
        history: 'Connection History'
      };
  }
};

/**
 * Check if user is the recipient of a request
 * @param {Object} request - Match request object
 * @param {Object} userProfileIds - User's profile IDs for all roles
 * @returns {boolean} True if user is recipient
 */
export const isUserRecipient = (request, userProfileIds) => {
  return (
    (request.recipient_type === 'applicant' && request.recipient_id === userProfileIds.applicant) ||
    (request.recipient_type === 'peer-support' && request.recipient_id === userProfileIds.peerSupport) ||
    (request.recipient_type === 'landlord' && request.recipient_id === userProfileIds.landlord) ||
    (request.recipient_type === 'employer' && request.recipient_id === userProfileIds.employer)
  );
};

/**
 * Check if user is the requester of a request
 * @param {Object} request - Match request object
 * @param {Object} userProfileIds - User's profile IDs for all roles
 * @returns {boolean} True if user is requester
 */
export const isUserRequester = (request, userProfileIds) => {
  return (
    (request.requester_type === 'applicant' && request.requester_id === userProfileIds.applicant) ||
    (request.requester_type === 'peer-support' && request.requester_id === userProfileIds.peerSupport) ||
    (request.requester_type === 'landlord' && request.requester_id === userProfileIds.landlord) ||
    (request.requester_type === 'employer' && request.requester_id === userProfileIds.employer)
  );
};

/**
 * Get user's primary role from roles array
 * @param {Array} roles - Array of user roles
 * @returns {string} Primary role
 */
export const getPrimaryRole = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return 'applicant'; // Default fallback
  }
  
  // Priority order for determining primary role
  const rolePriority = ['applicant', 'peer-support', 'landlord', 'employer'];
  
  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return role;
    }
  }
  
  return roles[0]; // Fallback to first role
};

/**
 * Get connection type display name
 * @param {Object} request - Match request object
 * @returns {string} Display name for connection type
 */
export const getConnectionType = (request) => {
  const typeMap = {
    'housing': 'Housing',
    'employment': 'Employment',
    'peer-support': 'Peer Support',
    'roommate': 'Roommate'
  };
  return typeMap[request.request_type] || 'Connection';
};

/**
 * Get connection type icon
 * @param {Object} request - Match request object
 * @returns {string} Emoji icon for connection type
 */
export const getConnectionIcon = (request) => {
  const iconMap = {
    'housing': '🏠',
    'employment': '💼',
    'peer-support': '🤝',
    'roommate': '👥'
  };
  return iconMap[request.request_type] || '🔗';
};

/**
 * Get role-specific contact information fields
 * @param {string} userType - User type (applicant, peer-support, etc.)
 * @returns {Array} Array of relevant contact fields
 */
export const getRoleContactFields = (userType) => {
  const fieldMap = {
    'applicant': ['email', 'phone', 'emergencyContact'],
    'peer-support': ['email', 'phone', 'professionalTitle', 'experience'],
    'landlord': ['email', 'phone', 'contactPerson', 'companyType'],
    'employer': ['email', 'phone', 'contactPerson', 'companyName', 'industry']
  };
  
  return fieldMap[userType] || ['email', 'phone'];
};

/**
 * Format user display name from profile data
 * @param {Object} profile - Profile object with registrant_profiles
 * @returns {string} Formatted display name
 */
export const formatDisplayName = (profile) => {
  if (!profile) return 'Unknown User';
  
  const registrant = profile.registrant_profiles || profile;
  const firstName = registrant.first_name || '';
  const lastName = registrant.last_name || '';
  
  return `${firstName} ${lastName}`.trim() || 'User';
};

/**
 * Get request status display text
 * @param {string} status - Request status
 * @param {boolean} isRecipient - Whether current user is recipient
 * @returns {string} Display text for status
 */
export const getStatusDisplayText = (status, isRecipient) => {
  switch (status) {
    case 'pending':
      return isRecipient ? 'Pending your approval' : 'Pending their approval';
    case 'accepted':
      return 'Active Connection';
    case 'rejected':
      return 'Declined';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Categorize requests based on user perspective
 * @param {Array} requests - Array of match requests
 * @param {Object} userProfileIds - User's profile IDs
 * @returns {Object} Categorized requests object
 */
export const categorizeRequests = (requests, userProfileIds) => {
  const categorized = {
    received: [], // Requests TO this user (awaiting response)
    sent: [],     // Requests FROM this user  
    active: [],   // Accepted/active connections
    history: []   // Completed/rejected
  };

  requests.forEach(request => {
    const isRecipient = isUserRecipient(request, userProfileIds);

    if (request.status === 'pending') {
      if (isRecipient) {
        categorized.received.push(request);
      } else {
        categorized.sent.push(request);
      }
    } else if (request.status === 'accepted') {
      categorized.active.push(request);
    } else {
      categorized.history.push(request);
    }
  });

  return categorized;
};

/**
 * Default export with all utilities
 */
const roleUtils = {
  getTabLabels,
  isUserRecipient,
  isUserRequester,
  getPrimaryRole,
  getConnectionType,
  getConnectionIcon,
  getRoleContactFields,
  formatDisplayName,
  getStatusDisplayText,
  categorizeRequests
};

export default roleUtils;   