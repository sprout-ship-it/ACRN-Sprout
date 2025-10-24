// src/utils/roleUtils.js - Enhanced with profile completion status
/**
 * Role-specific utility functions for the matching system
 * UPDATED: Added multi-role support with completion status tracking
 */

/**
 * Get completion status level from percentage
 * @param {number} percentage - Completion percentage (0-100)
 * @returns {string} Status level: 'complete', 'incomplete', or 'not-started'
 */
export const getCompletionStatus = (percentage) => {
  if (percentage === null || percentage === undefined) return 'not-started';
  if (percentage === 0) return 'not-started';
  if (percentage === 100) return 'complete';
  return 'incomplete'; // 1-99%
};

/**
 * Get status icon based on completion status
 * @param {string} status - Status level
 * @returns {string} Emoji icon
 */
export const getStatusIcon = (status) => {
  const icons = {
    'complete': '✅',
    'incomplete': '⚠️',
    'not-started': '🔒'
  };
  return icons[status] || '❓';
};

/**
 * Get status color based on completion status
 * @param {string} status - Status level
 * @returns {string} CSS color value
 */
export const getStatusColor = (status) => {
  const colors = {
    'complete': '#10b981', // green
    'incomplete': '#f59e0b', // yellow/orange
    'not-started': '#6b7280' // gray
  };
  return colors[status] || '#6b7280';
};

/**
 * Get status label for display
 * @param {string} status - Status level
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  const labels = {
    'complete': 'Profile Complete',
    'incomplete': 'Profile Incomplete',
    'not-started': 'Profile Not Started'
  };
  return labels[status] || 'Unknown Status';
};

/**
 * Get user-friendly role label
 * @param {string} role - Role identifier
 * @returns {string} Display name
 */
export const getRoleLabel = (role) => {
  const labels = {
    'applicant': 'Housing Seeker',
    'peer-support': 'Peer Support',
    'landlord': 'Property Owner',
    'employer': 'Employer'
  };
  return labels[role] || role;
};

/**
 * Get role icon emoji
 * @param {string} role - Role identifier
 * @returns {string} Emoji icon
 */
export const getRoleIcon = (role) => {
  const icons = {
    'applicant': '🏠',
    'peer-support': '🤝',
    'landlord': '🏢',
    'employer': '💼'
  };
  return icons[role] || '👤';
};

/**
 * Get role color for styling
 * @param {string} role - Role identifier
 * @returns {string} CSS color value
 */
export const getRoleColor = (role) => {
  const colors = {
    'applicant': '#a020f0', // purple
    'peer-support': '#20b2aa', // teal
    'landlord': '#ffd700', // gold
    'employer': '#ff6f61' // coral
  };
  return colors[role] || '#6366f1';
};

/**
 * Calculate profile completion for a specific role
 * @param {string} role - Role identifier
 * @param {Object} profileData - Role-specific profile data
 * @returns {number} Completion percentage (0-100)
 */
export const calculateRoleCompletion = (role, profileData) => {
  if (!profileData) return 0;

  // Check if profile has explicit completion_percentage field
  if (profileData.completion_percentage !== null && 
      profileData.completion_percentage !== undefined) {
    return profileData.completion_percentage;
  }

  // Calculate based on profile_completed flag
  if (profileData.profile_completed === true) {
    return 100;
  }
  if (profileData.profile_completed === false && profileData.id) {
    // Profile exists but not completed - estimate based on filled fields
    return estimateCompletionFromFields(role, profileData);
  }

  // No profile data at all
  return 0;
};

/**
 * Estimate completion percentage from filled fields
 * @private
 * @param {string} role - Role identifier
 * @param {Object} profileData - Profile data
 * @returns {number} Estimated completion percentage
 */
const estimateCompletionFromFields = (role, profileData) => {
  switch (role) {
    case 'applicant':
      return estimateApplicantCompletion(profileData);
    case 'peer-support':
      return estimatePeerSupportCompletion(profileData);
    case 'landlord':
      return estimateLandlordCompletion(profileData);
    case 'employer':
      return estimateEmployerCompletion(profileData);
    default:
      return 0;
  }
};

/**
 * Estimate applicant profile completion
 * @private
 */
const estimateApplicantCompletion = (profile) => {
  let completedFields = 0;
  const totalFields = 10;
  
  if (profile.date_of_birth) completedFields++;
  if (profile.primary_phone) completedFields++;
  if (profile.about_me) completedFields++;
  if (profile.looking_for) completedFields++;
  if (profile.recovery_stage) completedFields++;
  if (profile.budget_min && profile.budget_max) completedFields++;
  if (profile.primary_city && profile.primary_state) completedFields++;
  if (profile.interests?.length > 0) completedFields++;
  if (profile.recovery_methods?.length > 0) completedFields++;
  if (profile.spiritual_affiliation) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Estimate peer support profile completion
 * @private
 */
const estimatePeerSupportCompletion = (profile) => {
  let completedFields = 0;
  const totalFields = 8;
  
  if (profile.primary_phone) completedFields++;
  if (profile.bio) completedFields++;
  if (profile.professional_title) completedFields++;
  if (profile.specialties?.length > 0) completedFields++;
  if (profile.recovery_stage) completedFields++;
  if (profile.supported_recovery_methods?.length > 0) completedFields++;
  if (profile.service_city && profile.service_state) completedFields++;
  if (profile.about_me) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Estimate landlord profile completion
 * UPDATED: Simplified to match minimal landlord profile (phone + email only)
 * @private
 */
const estimateLandlordCompletion = (profile) => {
  // Simplified landlord profile only requires primary_phone
  // If profile exists and has phone, it's complete enough to use the platform
  if (profile.primary_phone) {
    return 100; // Has minimum required info
  }
  
  return 0; // No phone = not started
};

/**
 * Estimate employer profile completion
 * @private
 */
const estimateEmployerCompletion = (profile) => {
  // For employers, having at least one company profile = 100%
  // No profile = 0%
  return profile ? 100 : 0;
};

/**
 * Calculate completion status for all user roles
 * @param {Array} userRoles - Array of role strings
 * @param {Object} profilesData - Object with role-specific profile data
 * @returns {Object} Status object for each role
 * 
 * @example
 * const status = calculateAllRolesCompletion(
 *   ['applicant', 'peer-support'],
 *   {
 *     applicant: { completion_percentage: 100, profile_completed: true },
 *     'peer-support': { completion_percentage: 45, profile_completed: false }
 *   }
 * );
 * // Returns: { applicant: 'complete', 'peer-support': 'incomplete' }
 */
export const calculateAllRolesCompletion = (userRoles, profilesData = {}) => {
  if (!userRoles || !Array.isArray(userRoles)) {
    return {};
  }

  const completionStatus = {};

  userRoles.forEach(role => {
    const profileData = profilesData[role];
    const percentage = calculateRoleCompletion(role, profileData);
    completionStatus[role] = getCompletionStatus(percentage);
  });

  return completionStatus;
};

/**
 * Get the most complete role from user's roles
 * @param {Array} userRoles - Array of role strings
 * @param {Object} profilesData - Object with role-specific profile data
 * @returns {string} Role with highest completion
 */
export const getMostCompleteRole = (userRoles, profilesData = {}) => {
  if (!userRoles || userRoles.length === 0) return null;
  if (userRoles.length === 1) return userRoles[0];

  let maxCompletion = -1;
  let mostCompleteRole = userRoles[0];

  userRoles.forEach(role => {
    const profileData = profilesData[role];
    const percentage = calculateRoleCompletion(role, profileData);
    
    if (percentage > maxCompletion) {
      maxCompletion = percentage;
      mostCompleteRole = role;
    }
  });

  return mostCompleteRole;
};

/**
 * Get localStorage key for selected role
 * @param {string} userId - User ID for scoping
 * @returns {string} localStorage key
 */
export const getSelectedRoleKey = (userId) => {
  return `rhc_selected_role_${userId}`;
};

/**
 * Save selected role to localStorage
 * @param {string} userId - User ID
 * @param {string} role - Selected role
 */
export const saveSelectedRole = (userId, role) => {
  try {
    const key = getSelectedRoleKey(userId);
    localStorage.setItem(key, role);
  } catch (error) {
    console.warn('Failed to save selected role to localStorage:', error);
  }
};

/**
 * Load selected role from localStorage
 * @param {string} userId - User ID
 * @param {Array} userRoles - Valid roles for this user
 * @returns {string|null} Selected role or null
 */
export const loadSelectedRole = (userId, userRoles) => {
  try {
    const key = getSelectedRoleKey(userId);
    const savedRole = localStorage.getItem(key);
    
    // Validate that saved role is still valid for this user
    if (savedRole && userRoles && userRoles.includes(savedRole)) {
      return savedRole;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to load selected role from localStorage:', error);
    return null;
  }
};

/**
 * Get initial selected role for user
 * Priority: localStorage → most complete → first role
 * @param {string} userId - User ID
 * @param {Array} userRoles - Array of user roles
 * @param {Object} profilesData - Profile data for all roles
 * @returns {string} Initial role to select
 */
export const getInitialSelectedRole = (userId, userRoles, profilesData = {}) => {
  if (!userRoles || userRoles.length === 0) return null;

  // Try localStorage first
  const savedRole = loadSelectedRole(userId, userRoles);
  if (savedRole) return savedRole;

  // Try most complete role
  const mostComplete = getMostCompleteRole(userRoles, profilesData);
  if (mostComplete) return mostComplete;

  // Fallback to first role
  return userRoles[0];
};

// ============================================================================
// EXISTING FUNCTIONS (preserved from original roleUtils.js)
// ============================================================================

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
  // NEW: Multi-role completion functions
  getCompletionStatus,
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
  getRoleIcon,
  getRoleColor,
  calculateRoleCompletion,
  calculateAllRolesCompletion,
  getMostCompleteRole,
  getSelectedRoleKey,
  saveSelectedRole,
  loadSelectedRole,
  getInitialSelectedRole,
  
  // EXISTING: Connection/request functions
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