// src/components/features/connections/utils/connectionUtils.js
import { db } from '../../../../utils/supabase';

// Connection type icons and labels
export const CONNECTION_TYPES = {
  housing: {
    icon: '🏠',
    label: 'Housing Match',
    color: 'var(--primary-purple)'
  },
  peer_support: {
    icon: '🤝',
    label: 'Peer Support',
    color: 'var(--secondary-teal)'
  },
  applicant_peer: {
    icon: '👥',
    label: 'Peer Match',
    color: 'var(--accent-green)'
  },
  employer: {
    icon: '💼',
    label: 'Employer Connect',
    color: 'var(--orange)'
  }
};

// Status configurations
export const CONNECTION_STATUS = {
  active: {
    icon: '✅',
    label: 'Active',
    color: 'var(--accent-green)',
    bgColor: 'rgba(34, 197, 94, 0.1)'
  },
  pending: {
    icon: '⏳',
    label: 'Pending',
    color: 'var(--orange)',
    bgColor: 'rgba(249, 115, 22, 0.1)'
  },
  completed: {
    icon: '🎉',
    label: 'Completed',
    color: 'var(--secondary-teal)',
    bgColor: 'rgba(20, 184, 166, 0.1)'
  },
  dissolved: {
    icon: '❌',
    label: 'Ended',
    color: 'var(--gray-500)',
    bgColor: 'rgba(107, 114, 128, 0.1)'
  }
};

// Get connection type from match group data
export const getConnectionType = (matchGroup) => {
  if (matchGroup.property_id && matchGroup.landlord_id) {
    return 'housing';
  } else if (matchGroup.peer_support_id) {
    return 'peer_support';
  } else if (matchGroup.applicant_1_id && matchGroup.applicant_2_id) {
    return 'applicant_peer';
  }
  return 'unknown';
};

// Get the other person in a connection
export const getOtherPerson = (matchGroup, currentUserId) => {
  const connectionType = getConnectionType(matchGroup);
  
  switch (connectionType) {
    case 'housing':
      if (matchGroup.landlord_id === currentUserId) {
        return matchGroup.applicant_1 || matchGroup.applicant_2;
      } else {
        return matchGroup.landlord;
      }
    
    case 'peer_support':
      if (matchGroup.peer_support_id === currentUserId) {
        return matchGroup.applicant_1 || matchGroup.applicant_2;
      } else {
        return matchGroup.peer_support;
      }
    
    case 'applicant_peer':
      if (matchGroup.applicant_1_id === currentUserId) {
        return matchGroup.applicant_2;
      } else {
        return matchGroup.applicant_1;
      }
    
    default:
      return null;
  }
};

// Get connection display data
export const getConnectionDisplayData = (matchGroup, currentUserId) => {
  const connectionType = getConnectionType(matchGroup);
  const otherPerson = getOtherPerson(matchGroup, currentUserId);
  const typeConfig = CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.applicant_peer;
  const statusConfig = CONNECTION_STATUS[matchGroup.status] || CONNECTION_STATUS.pending;

  let title = `${typeConfig.label}`;
  let subtitle = otherPerson?.first_name || 'Unknown User';
  let description = '';

  // Customize based on connection type
  switch (connectionType) {
    case 'housing':
      if (matchGroup.property) {
        title = matchGroup.property.title || 'Housing Match';
        subtitle = `with ${otherPerson?.first_name || 'Unknown'}`;
        description = `${matchGroup.property.city} • $${matchGroup.property.monthly_rent}/month`;
      }
      break;
      
    case 'peer_support':
      if (matchGroup.peer_support_id === currentUserId) {
        title = 'Supporting';
        subtitle = otherPerson?.first_name || 'Unknown User';
      } else {
        title = 'Peer Support from';
        subtitle = otherPerson?.first_name || 'Unknown Supporter';
      }
      break;
      
    case 'applicant_peer':
      title = 'Peer Connection';
      subtitle = otherPerson?.first_name || 'Unknown Peer';
      description = 'Recovery journey partner';
      break;
  }

  return {
    id: matchGroup.id,
    type: connectionType,
    title,
    subtitle,
    description,
    status: matchGroup.status,
    createdAt: matchGroup.created_at,
    otherPerson,
    property: matchGroup.property,
    typeConfig,
    statusConfig
  };
};

// Format date for display
export const formatConnectionDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Get connection priority score (for sorting)
export const getConnectionPriority = (connection) => {
  let score = 0;
  
  // Status priority
  switch (connection.status) {
    case 'active': score += 100; break;
    case 'pending': score += 80; break;
    case 'completed': score += 40; break;
    case 'dissolved': score += 10; break;
  }
  
  // Type priority
  switch (connection.type) {
    case 'housing': score += 30; break;
    case 'peer_support': score += 20; break;
    case 'applicant_peer': score += 15; break;
    case 'employer': score += 10; break;
  }
  
  // Recency bonus (more recent = higher score)
  const daysSinceCreated = Math.floor(
    (new Date() - new Date(connection.createdAt)) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 30 - daysSinceCreated); // Up to 30 point bonus for recent connections
  
  return score;
};

// Sort connections by priority
export const sortConnectionsByPriority = (connections) => {
  return [...connections]
    .map(conn => ({
      ...conn,
      priority: getConnectionPriority(conn)
    }))
    .sort((a, b) => b.priority - a.priority);
};

// Filter connections
export const filterConnections = (connections, filters) => {
  let filtered = [...connections];
  
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(conn => conn.type === filters.type);
  }
  
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(conn => conn.status === filters.status);
  }
  
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase().trim();
    filtered = filtered.filter(conn => 
      conn.title.toLowerCase().includes(searchLower) ||
      conn.subtitle.toLowerCase().includes(searchLower) ||
      conn.description.toLowerCase().includes(searchLower) ||
      conn.otherPerson?.first_name?.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

// Default communication templates
export const DEFAULT_TEMPLATES = {
  first_contact: [
    {
      title: "Initial Introduction",
      content: "Hi {name}, I'm excited to connect with you through our recovery housing program. I'd love to learn more about you and see if we might be a good match as housemates.",
      category: "first_contact",
      is_system: true
    },
    {
      title: "Peer Support Introduction", 
      content: "Hello {name}, I'm reaching out as a peer in recovery. I'd like to offer my support and share experiences if you're interested in connecting.",
      category: "first_contact",
      is_system: true
    }
  ],
  follow_up: [
    {
      title: "Gentle Follow-up",
      content: "Hi {name}, just wanted to follow up on our previous conversation. No pressure - just checking in to see if you'd like to continue our discussion about {topic}.",
      category: "follow_up", 
      is_system: true
    }
  ],
  meeting_request: [
    {
      title: "Coffee Meet Request",
      content: "Hi {name}, would you like to meet for coffee this week to discuss our potential housing arrangement? I'm free {availability} and would love to chat in person.",
      category: "meeting_request",
      is_system: true
    }
  ]
};

// Communication log helpers
export const createCommunicationLog = async (logData) => {
  try {
    return await db.communicationLogs.create({
      ...logData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to create communication log:', error);
    return { data: null, error };
  }
};

// Get recent communication activity
export const getRecentActivity = async (userId, limit = 10) => {
  try {
    const { data, error } = await db.communicationLogs.getByUserId(userId, limit);
    
    if (error || !data) {
      return { data: [], error };
    }

    // Format activity items
    const activities = data.map(log => ({
      id: log.id,
      type: 'communication',
      action: log.communication_type,
      timestamp: log.created_at,
      description: `${log.communication_type} with ${log.recipient?.first_name || log.sender?.first_name}`,
      matchGroup: log.match_group,
      otherPerson: log.sender_id === userId ? log.recipient : log.sender
    }));

    return { data: activities, error: null };
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return { data: [], error };
  }
};

// Template variable replacement
export const replaceTemplateVariables = (template, variables = {}) => {
  let content = template;
  
  // Default variables
  const defaultVars = {
    name: 'there',
    topic: 'our connection',
    availability: 'most days this week',
    ...variables
  };
  
  // Replace variables in format {variableName}
  Object.entries(defaultVars).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    content = content.replace(regex, value || `{${key}}`);
  });
  
  return content;
};

// Export all utilities
export default {
  CONNECTION_TYPES,
  CONNECTION_STATUS,
  getConnectionType,
  getOtherPerson,
  getConnectionDisplayData,
  formatConnectionDate,
  getConnectionPriority,
  sortConnectionsByPriority,
  filterConnections,
  DEFAULT_TEMPLATES,
  createCommunicationLog,
  getRecentActivity,
  replaceTemplateVariables
};