// src/components/features/connections/ConnectionHub.js - FULL RESTORATION: Tabs + All Features
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './ConnectionHub.module.css';

const ConnectionHub = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState({
    active: [],
    sent: [],
    awaiting: [],
    history: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Communication templates for different connection types
  const messageTemplates = {
    roommate: [
      {
        title: 'Schedule Housing Tour',
        template: 'Hi {name}! I found a property at {address} that looks perfect for us. Are you available to tour it together on {date} at {time}?'
      },
      {
        title: 'Discuss Budget Split',
        template: 'Hi {name}! I wanted to discuss how we want to split utilities and other shared expenses. When would be a good time to talk?'
      },
      {
        title: 'Share Application Update',
        template: 'Hi {name}! Update on our housing search: {update}. Let me know what you think!'
      },
      {
        title: 'Coordinate Move-in',
        template: 'Hi {name}! I wanted to coordinate our move-in plans. My preferred move-in date is {date}. What works for you?'
      }
    ],
    peer_support: [
      {
        title: 'Schedule First Session',
        template: 'Hi {name}! I\'d like to schedule our first peer support session. I\'m available {availability}. What works best for you?'
      },
      {
        title: 'Ask About Program',
        template: 'Hi {name}! I\'m interested in learning more about {program}. Could we discuss this in our next session?'
      },
      {
        title: 'Request Check-in',
        template: 'Hi {name}! I\'ve been going through some challenges and would appreciate a check-in call. Are you available sometime this week?'
      },
      {
        title: 'Session Follow-up',
        template: 'Hi {name}! Thank you for our last session. I wanted to follow up on {topic} we discussed. When can we talk again?'
      }
    ],
    housing_approved: [
      {
        title: 'Schedule Property Viewing',
        template: 'Hi {name}! Thank you for approving my housing inquiry for "{property}". I\'d love to schedule a viewing. I\'m available {availability}. What works best for you?'
      },
      {
        title: 'Application Process Questions',
        template: 'Hi {name}! I\'m excited about "{property}" and would like to know more about the application process, required documents, and next steps.'
      },
      {
        title: 'Move-in Timeline Discussion',
        template: 'Hi {name}! I wanted to discuss the move-in timeline for "{property}". My preferred move-in date is {date}. Is this feasible?'
      },
      {
        title: 'Property Details Inquiry',
        template: 'Hi {name}! I have a few questions about "{property}" regarding utilities, neighborhood amenities, and building policies. When would be a good time to discuss?'
      }
    ],
    employer: [
      {
        title: 'Express Interest in Position',
        template: 'Hello! I\'m very interested in the {position} role at {company}. I believe my recovery journey has given me valuable skills including {skills}. I\'d love to discuss this opportunity.'
      },
      {
        title: 'Request Informational Interview',
        template: 'Hello! I\'m exploring career opportunities and would appreciate an informational interview to learn more about {company} and potential positions that might be a good fit.'
      },
      {
        title: 'Follow-up on Application',
        template: 'Hello! I recently applied for the {position} role and wanted to follow up. I\'m very excited about the opportunity to contribute to {company}.'
      },
      {
        title: 'Ask About Recovery-Friendly Policies',
        template: 'Hello! I\'m interested in learning about {company}\'s policies and support for employees in recovery. I believe this would be an excellent fit for my career goals.'
      }
    ]
  };

  /**
   * ✅ FULL RESTORATION: Load connections with deduplication and tab organization
   */
  const loadConnections = async () => {
    if (!user?.id || !profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading all connections for:', {
        authUserId: user.id,
        registrantProfileId: profile.id, 
        roles: profile.roles
      });
      
      // Initialize connection categories
      const connectionCategories = {
        active: [],
        sent: [],
        awaiting: [],
        history: []
      };

      // Get role-specific profile IDs
      let applicantProfileId = null;
      let peerSupportProfileId = null;

      // Check for applicant profile
      if (profile.roles && profile.roles.includes('applicant')) {
        try {
          const { data: applicantProfile, error: applicantError } = await supabase
            .from('applicant_matching_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id)
            .single();
          
          if (applicantProfile && !applicantError) {
            applicantProfileId = applicantProfile.id;
            console.log('👤 Found applicant profile ID:', applicantProfileId);
          }
        } catch (err) {
          console.log('ℹ️ No applicant profile found:', err.message);
        }
      }

      // Check for peer support profile
      if (profile.roles && profile.roles.includes('peer-support')) {
        try {
          const { data: peerProfile, error: peerError } = await supabase
            .from('peer_support_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id)
            .single();
          
          if (peerProfile && !peerError) {
            peerSupportProfileId = peerProfile.id;
            console.log('🤝 Found peer support profile ID:', peerSupportProfileId);
          }
        } catch (err) {
          console.log('ℹ️ No peer support profile found:', err.message);
        }
      }

      // ✅ STEP 1: Load ACTIVE connections from match_groups (forming/active/confirmed)
      console.log('🔄 Loading ACTIVE connections from match_groups...');
      
      const orConditions = [];
      if (applicantProfileId) {
        orConditions.push(`applicant_1_id.eq.${applicantProfileId}`);
        orConditions.push(`applicant_2_id.eq.${applicantProfileId}`);
      }
      if (peerSupportProfileId) {
        orConditions.push(`peer_support_id.eq.${peerSupportProfileId}`);
      }

      if (orConditions.length > 0) {
        const { data: activeMatchGroups, error: matchError } = await supabase
          .from('match_groups')
          .select('*')
          .or(orConditions.join(','))
          .in('status', ['forming', 'active', 'confirmed']);

        console.log('📊 Active match_groups found:', activeMatchGroups?.length || 0);

        if (activeMatchGroups && activeMatchGroups.length > 0) {
          for (const match of activeMatchGroups) {
            let otherProfileId = null;
            let connectionType = 'roommate';
            let avatar = '👥';
            
            if (match.peer_support_id) {
              connectionType = 'peer_support';
              avatar = '🤝';
              if (match.peer_support_id === peerSupportProfileId) {
                otherProfileId = match.applicant_1_id || match.applicant_2_id;
              } else {
                otherProfileId = match.peer_support_id;
              }
            } else {
              connectionType = 'roommate';
              avatar = '👥';
              if (match.applicant_1_id === applicantProfileId) {
                otherProfileId = match.applicant_2_id;
              } else if (match.applicant_2_id === applicantProfileId) {
                otherProfileId = match.applicant_1_id;
              }
            }
            
            if (otherProfileId) {
              let otherProfile = null;
              
              try {
                if (connectionType === 'peer_support') {
                  if (match.peer_support_id === peerSupportProfileId) {
                    // Other is applicant
                    const { data: applicantProfile } = await supabase
                      .from('applicant_matching_profiles')
                      .select(`id, user_id, registrant_profiles!inner(first_name, last_name, email)`)
                      .eq('id', otherProfileId)
                      .single();
                      
                    if (applicantProfile) {
                      otherProfile = {
                        id: applicantProfile.registrant_profiles.id,
                        name: `${applicantProfile.registrant_profiles.first_name} ${applicantProfile.registrant_profiles.last_name}`,
                        email: applicantProfile.registrant_profiles.email
                      };
                    }
                  } else {
                    // Other is peer
                    const { data: peerProfile } = await supabase
                      .from('peer_support_profiles')
                      .select(`id, user_id, professional_title, registrant_profiles!inner(first_name, last_name, email)`)
                      .eq('id', otherProfileId)
                      .single();
                      
                    if (peerProfile) {
                      otherProfile = {
                        id: peerProfile.registrant_profiles.id,
                        name: `${peerProfile.registrant_profiles.first_name} ${peerProfile.registrant_profiles.last_name}`,
                        email: peerProfile.registrant_profiles.email
                      };
                    }
                  }
                } else {
                  // Roommate connection - other is applicant
                  const { data: applicantProfile } = await supabase
                    .from('applicant_matching_profiles')
                    .select(`id, user_id, registrant_profiles!inner(first_name, last_name, email)`)
                    .eq('id', otherProfileId)
                    .single();
                    
                  if (applicantProfile) {
                    otherProfile = {
                      id: applicantProfile.registrant_profiles.id,
                      name: `${applicantProfile.registrant_profiles.first_name} ${applicantProfile.registrant_profiles.last_name}`,
                      email: applicantProfile.registrant_profiles.email
                    };
                  }
                }
                
                if (otherProfile) {
                  connectionCategories.active.push({
                    id: `active_${match.id}`,
                    profile_id: otherProfile.id,
                    name: otherProfile.name,
                    type: connectionType,
                    status: 'active_connection',
                    source: 'match_group',
                    match_group_id: match.id,
                    created_at: match.created_at,
                    last_activity: match.updated_at || match.created_at,
                    shared_contact: match.contact_shared || false,
                    contact_info: match.shared_contact_info || null,
                    avatar: avatar
                  });
                  console.log(`✅ Added ACTIVE ${connectionType}:`, otherProfile.name);
                }
              } catch (profileErr) {
                console.warn('⚠️ Error loading profile for active connection:', profileErr);
              }
            }
          }
        }

        // ✅ STEP 2: Load HISTORY connections (completed/ended match_groups)
        const { data: historyMatchGroups } = await supabase
          .from('match_groups')
          .select('*')
          .or(orConditions.join(','))
          .in('status', ['completed', 'ended', 'cancelled']);

        console.log('📚 History match_groups found:', historyMatchGroups?.length || 0);

        if (historyMatchGroups && historyMatchGroups.length > 0) {
          for (const match of historyMatchGroups) {
            let otherProfileId = null;
            let connectionType = 'roommate';
            let avatar = '📚';
            
            if (match.peer_support_id) {
              connectionType = 'peer_support';
              avatar = '🤝';
              if (match.peer_support_id === peerSupportProfileId) {
                otherProfileId = match.applicant_1_id || match.applicant_2_id;
              } else {
                otherProfileId = match.peer_support_id;
              }
            } else {
              connectionType = 'roommate';
              avatar = '👥';
              if (match.applicant_1_id === applicantProfileId) {
                otherProfileId = match.applicant_2_id;
              } else if (match.applicant_2_id === applicantProfileId) {
                otherProfileId = match.applicant_1_id;
              }
            }
            
            if (otherProfileId) {
              try {
                const { data: otherProfile } = await supabase
                  .from('registrant_profiles')
                  .select('id, first_name, last_name, email')
                  .eq('id', otherProfileId)
                  .single();
                  
                if (otherProfile) {
                  connectionCategories.history.push({
                    id: `history_${match.id}`,
                    profile_id: otherProfile.id,
                    name: `${otherProfile.first_name} ${otherProfile.last_name}`,
                    type: connectionType,
                    status: 'connection_ended',
                    source: 'match_group',
                    match_group_id: match.id,
                    created_at: match.created_at,
                    last_activity: match.updated_at || match.created_at,
                    avatar: avatar,
                    end_reason: match.status
                  });
                }
              } catch (profileErr) {
                console.warn('⚠️ Error loading profile for history connection:', profileErr);
              }
            }
          }
        }
      }

      // ✅ STEP 3: Load SENT requests (outgoing, pending)
      console.log('📤 Loading SENT requests...');
      if (applicantProfileId) {
        const { data: sentRequests } = await supabase
          .from('match_requests')
          .select('*')
          .eq('requester_type', 'applicant')
          .eq('requester_id', applicantProfileId)
          .eq('status', 'pending');

        console.log('📤 Sent requests found:', sentRequests?.length || 0);

        if (sentRequests && sentRequests.length > 0) {
          for (const request of sentRequests) {
            try {
              let recipientProfile = null;
              
              if (request.recipient_type === 'peer-support') {
                const { data: peerProfile } = await supabase
                  .from('peer_support_profiles')
                  .select(`id, user_id, professional_title, registrant_profiles!inner(first_name, last_name, email)`)
                  .eq('id', request.recipient_id)
                  .single();
                  
                if (peerProfile) {
                  recipientProfile = {
                    name: `${peerProfile.registrant_profiles.first_name} ${peerProfile.registrant_profiles.last_name}`,
                    title: peerProfile.professional_title || 'Peer Support Specialist'
                  };
                }
              }
              
              if (recipientProfile) {
                connectionCategories.sent.push({
                  id: `sent_${request.id}`,
                  profile_id: request.recipient_id,
                  name: recipientProfile.name,
                  type: request.request_type.replace('-', '_'),
                  status: 'request_sent',
                  source: 'match_request',
                  request_id: request.id,
                  created_at: request.created_at,
                  last_activity: request.updated_at || request.created_at,
                  shared_contact: false,
                  avatar: '📤',
                  request_message: request.message
                });
                console.log('✅ Added SENT request to:', recipientProfile.name);
              }
            } catch (err) {
              console.warn('⚠️ Error processing sent request:', err);
            }
          }
        }
      }

      // ✅ STEP 4: Load AWAITING RESPONSE requests (incoming, pending)
      console.log('⏳ Loading AWAITING RESPONSE requests...');
      if (peerSupportProfileId) {
        const { data: awaitingRequests } = await supabase
          .from('match_requests')
          .select('*')
          .eq('recipient_type', 'peer-support')
          .eq('recipient_id', peerSupportProfileId)
          .eq('status', 'pending');

        console.log('⏳ Awaiting requests found:', awaitingRequests?.length || 0);

        if (awaitingRequests && awaitingRequests.length > 0) {
          for (const request of awaitingRequests) {
            try {
              const { data: requesterProfile } = await supabase
                .from('applicant_matching_profiles')
                .select(`id, user_id, registrant_profiles!inner(first_name, last_name, email)`)
                .eq('id', request.requester_id)
                .single();

              if (requesterProfile) {
                connectionCategories.awaiting.push({
                  id: `awaiting_${request.id}`,
                  profile_id: request.requester_id,
                  name: `${requesterProfile.registrant_profiles.first_name} ${requesterProfile.registrant_profiles.last_name}`,
                  type: 'peer_support',
                  status: 'pending_request',
                  source: 'match_request',
                  request_id: request.id,
                  created_at: request.created_at,
                  last_activity: request.updated_at || request.created_at,
                  shared_contact: false,
                  avatar: '⏳',
                  request_message: request.message
                });
                console.log('✅ Added AWAITING request from:', requesterProfile.registrant_profiles.first_name);
              }
            } catch (err) {
              console.warn('⚠️ Error processing awaiting request:', err);
            }
          }
        }
      }

      // Sort each category by most recent activity
      Object.keys(connectionCategories).forEach(category => {
        connectionCategories[category].sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      });

      console.log('✅ Connections loaded by category:', {
        active: connectionCategories.active.length,
        sent: connectionCategories.sent.length,
        awaiting: connectionCategories.awaiting.length,
        history: connectionCategories.history.length
      });
      
      setConnections(connectionCategories);

    } catch (err) {
      console.error('💥 Error loading connections:', err);
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accept a peer support request
   */
  const handleAcceptRequest = async (connection) => {
    if (!user?.id || !profile?.id) return;

    try {
      console.log('✅ Accepting request from:', connection.name);

      const { error: updateError } = await supabase
        .from('match_requests')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.request_id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      alert(`Request from ${connection.name} accepted! They can now connect with you.`);
      
      setTimeout(() => {
        loadConnections();
      }, 1000);

    } catch (err) {
      console.error('💥 Error accepting request:', err);
      alert(`Failed to accept request: ${err.message}`);
    }
  };

  /**
   * Decline a peer support request
   */
  const handleDeclineRequest = async (connection) => {
    if (!user?.id || !profile?.id) return;

    try {
      console.log('❌ Declining request from:', connection.name);

      const { error: updateError } = await supabase
        .from('match_requests')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.request_id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      alert(`Request from ${connection.name} declined.`);
      loadConnections();

    } catch (err) {
      console.error('💥 Error declining request:', err);
      alert(`Failed to decline request: ${err.message}`);
    }
  };

  /**
   * Share contact information with a connection
   */
  const handleShareContact = async (connection) => {
    if (!user?.id || !profile?.id) return;

    try {
      console.log('📞 Sharing contact with:', connection.name);

      if (connection.source === 'match_group' && connection.match_group_id) {
        const contactInfo = {
          phone: profile?.primary_phone || '',
          email: user.email || '',
          preferred_contact: 'email',
          availability: 'Evenings after 6pm',
          notes: 'Contact me anytime about our connection!'
        };

        const { error: updateError } = await supabase
          .from('match_groups')
          .update({
            contact_shared: true,
            shared_contact_info: contactInfo
          })
          .eq('id', connection.match_group_id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update local state
        setConnections(prev => ({
          ...prev,
          active: prev.active.map(conn => 
            conn.id === connection.id 
              ? { ...conn, shared_contact: true, contact_info: contactInfo }
              : conn
          )
        }));
        
        alert(`Contact information shared with ${connection.name}!`);
      } else {
        alert('Contact sharing for this connection type will be available soon!');
      }

    } catch (err) {
      console.error('💥 Error sharing contact:', err);
      alert(`Failed to share contact: ${err.message}`);
    }
  };

  /**
   * Send template message
   */
  const handleSendTemplate = (template, connection) => {
    const replacements = {
      name: connection.name,
      date: '[DATE]',
      time: '[TIME]',
      availability: '[YOUR AVAILABILITY]',
      update: '[YOUR UPDATE]',
      program: '[PROGRAM NAME]',
      topic: '[TOPIC]'
    };

    let message = template.template;
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    const subject = template.title;
    const email = connection.contact_info?.email || '[EMAIL]';
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
    
    setActiveModal(null);
  };

  /**
   * Get connection type badge class
   */
  const getConnectionTypeBadgeClass = (type) => {
    const typeClasses = {
      roommate: styles.roommateType,
      peer_support: styles.peerSupportType,
      housing_approved: styles.housingApprovedType,
      employer: styles.employerType
    };
    return `${styles.connectionTypeBadge} ${typeClasses[type] || ''}`;
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  /**
   * Get total connections count
   */
  const getTotalCount = () => {
    return Object.values(connections).reduce((total, category) => total + category.length, 0);
  };

  /**
   * Get tab label with count
   */
  const getTabLabel = (tabName) => {
    const count = connections[tabName]?.length || 0;
    const labels = {
      active: 'Active',
      sent: 'Sent', 
      awaiting: 'Awaiting Response',
      history: 'Match History'
    };
    return `${labels[tabName]} (${count})`;
  };

  // Load connections on mount
  useEffect(() => {
    if (profile?.id && user?.id) {
      loadConnections();
    }
  }, [profile?.id, user?.id]);

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage communication with your matches and connections
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorState}>
          <div className={styles.errorAlert}>
            <h4 className={styles.errorTitle}>Error Loading Connections</h4>
            <p className={styles.errorDescription}>{error}</p>
            <button 
              className={`btn btn-outline ${styles.retryButton}`}
              onClick={() => {
                setError(null);
                loadConnections();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingState}>
          <LoadingSpinner size="large" text="Loading your connections..." />
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Summary Card */}
          <div className="card mb-4">
            <div className={styles.connectionStats}>
              <h3 className="card-title">
                {getTotalCount()} Connection{getTotalCount() !== 1 ? 's' : ''}
              </h3>
              <div className={styles.connectionTypes}>
                {connections.awaiting?.length > 0 && (
                  <span className="badge badge-warning">
                    {connections.awaiting.length} Awaiting Response
                  </span>
                )}
                {connections.sent?.length > 0 && (
                  <span className="badge badge-info">
                    {connections.sent.length} Sent
                  </span>
                )}
                {connections.active?.length > 0 && (
                  <span className="badge badge-success">
                    {connections.active.length} Active
                  </span>
                )}
              </div>
              <button 
                className={`btn btn-outline btn-sm ${styles.refreshButton}`}
                onClick={loadConnections}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                {['active', 'awaiting', 'sent', 'history'].map(tab => (
                  <li key={tab} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {getTabLabel(tab)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body">
              {/* Tab Content */}
              {connections[activeTab]?.length > 0 ? (
                <div className="grid-auto">
                  {connections[activeTab].map((connection) => (
                    <div key={connection.id} className="card">
                      {/* Connection Header */}
                      <div className="card-header">
                        <div className={styles.connectionHeader}>
                          <div className={styles.connectionAvatar}>{connection.avatar}</div>
                          <div className={styles.connectionInfo}>
                            <div className="card-title">{connection.name}</div>
                            <div className="card-subtitle">
                              Active {formatTimeAgo(connection.last_activity)}
                            </div>
                          </div>
                          <div className={styles.connectionMetaInfo}>
                            <span className={getConnectionTypeBadgeClass(connection.type)}>
                              {connection.type === 'roommate' && 'Roommate Match'}
                              {connection.type === 'peer_support' && 'Peer Support'}
                              {connection.type === 'employer' && 'Employer'}
                            </span>
                            
                            {connection.status === 'active_connection' && (
                              <span className="badge badge-success">✓ Connected</span>
                            )}
                            {connection.status === 'pending_request' && (
                              <span className="badge badge-warning">⏳ Pending</span>
                            )}
                            {connection.status === 'request_sent' && (
                              <span className="badge badge-info">📤 Sent</span>
                            )}
                            {connection.status === 'connection_ended' && (
                              <span className="badge badge-secondary">📚 Ended</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connection Info */}
                      <div className="mb-4">
                        <div className={styles.sourceInfo}>
                          <span className={styles.sourceLabel}>Source:</span> {
                            connection.source === 'match_request' && connection.status === 'pending_request' ? 'Incoming Request' :
                            connection.source === 'match_request' && connection.status === 'request_sent' ? 'Sent Request' :
                            connection.source === 'match_group' ? 'Active Connection' :
                            'Unknown'
                          }
                        </div>

                        {/* Request Message for pending requests */}
                        {(connection.status === 'pending_request' || connection.status === 'request_sent') && connection.request_message && (
                          <div className={styles.requestMessage}>
                            <span className={styles.requestLabel}>Message:</span>
                            <div className={styles.requestText}>"{connection.request_message}"</div>
                          </div>
                        )}

                        {/* Contact Status for active connections */}
                        {connection.status === 'active_connection' && (
                          <div className={styles.contactStatus}>
                            {connection.shared_contact ? (
                              <div className={styles.contactShared}>
                                <strong>📞 Contact Available:</strong> You can communicate directly with {connection.name}
                              </div>
                            ) : (
                              <div className={styles.contactPending}>
                                <strong>⏳ Contact Pending:</strong> Share your contact information to enable direct communication
                              </div>
                            )}
                          </div>
                        )}

                        {/* End reason for history */}
                        {connection.status === 'connection_ended' && connection.end_reason && (
                          <div className={styles.endReason}>
                            <span className={styles.endLabel}>Status:</span> {connection.end_reason}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="button-grid">
                        {connection.status === 'pending_request' ? (
                          // Pending request actions (for incoming requests)
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleAcceptRequest(connection)}
                            >
                              ✅ Accept Request
                            </button>
                            
                            <button
                              className="btn btn-outline"
                              onClick={() => handleDeclineRequest(connection)}
                            >
                              ❌ Decline
                            </button>
                          </>
                        ) : connection.status === 'request_sent' ? (
                          // Sent request status (waiting for response)
                          <div className={styles.requestSentStatus}>
                            <span className="badge badge-info">⏳ Waiting for response...</span>
                          </div>
                        ) : connection.status === 'active_connection' ? (
                          // Active connection actions
                          <>
                            {connection.shared_contact ? (
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setSelectedConnection(connection);
                                  setActiveModal('contact');
                                }}
                              >
                                📞 Contact Info
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleShareContact(connection)}
                              >
                                📞 Share Contact
                              </button>
                            )}
                            
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                setSelectedConnection(connection);
                                setActiveModal('templates');
                              }}
                            >
                              💬 Message Templates
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noConnectionsState}>
                  <h3 className={styles.noConnectionsTitle}>No {activeTab} connections</h3>
                  <p className={styles.noConnectionsDescription}>
                    {activeTab === 'active' && 'Your active connections will appear here'}
                    {activeTab === 'sent' && 'Requests you\'ve sent will appear here'}
                    {activeTab === 'awaiting' && 'Incoming requests waiting for your response will appear here'}
                    {activeTab === 'history' && 'Your connection history will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-4">
          <button className="btn btn-outline" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Contact Information Modal */}
      {activeModal === 'contact' && selectedConnection && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className={`modal-content ${styles.contactModal}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Information - {selectedConnection.name}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            {selectedConnection.contact_info ? (
              <div className={styles.contactDetails}>
                <h4 className={styles.contactDetailsTitle}>📞 Contact Details</h4>
                <div>
                  {selectedConnection.contact_info.phone && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Phone:</span>
                      <span className={styles.contactValue}>{selectedConnection.contact_info.phone}</span>
                      <button 
                        className={`btn btn-sm btn-outline ${styles.contactAction}`}
                        onClick={() => window.location.href = `tel:${selectedConnection.contact_info.phone}`}
                      >
                        Call
                      </button>
                    </div>
                  )}
                  
                  {selectedConnection.contact_info.email && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Email:</span>
                      <span className={styles.contactValue}>{selectedConnection.contact_info.email}</span>
                      <button 
                        className={`btn btn-sm btn-outline ${styles.contactAction}`}
                        onClick={() => window.location.href = `mailto:${selectedConnection.contact_info.email}`}
                      >
                        Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.contactNotAvailable}>
                <div className={styles.contactUnavailableAlert}>
                  <h4 className={styles.contactUnavailableTitle}>⏳ Contact Information Not Available</h4>
                  <p className={styles.contactUnavailableDescription}>
                    Contact details haven't been shared yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Templates Modal */}
      {activeModal === 'templates' && selectedConnection && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className={`modal-content ${styles.templatesModal}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Message Templates - {selectedConnection.name}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div className={styles.templatesSection}>
              <h4 className={styles.templatesTitle}>💬 Quick Message Templates</h4>
              <p className={styles.templatesDescription}>
                Choose a template to send via email. You can customize the message before sending.
              </p>
              
              <div className={styles.templatesList}>
                {messageTemplates[selectedConnection.type]?.map((template, index) => (
                  <button
                    key={index}
                    className={styles.templateButton}
                    onClick={() => handleSendTemplate(template, selectedConnection)}
                  >
                    <strong className={styles.templateTitle}>{template.title}</strong>
                    <div className={styles.templatePreview}>
                      {template.template.substring(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionHub;