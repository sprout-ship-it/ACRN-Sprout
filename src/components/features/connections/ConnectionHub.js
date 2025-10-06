// src/components/features/connections/ConnectionHub.js - FIXED: User ID queries
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './ConnectionHub.module.css';

const ConnectionHub = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
   * ✅ FIXED: Load both match requests (pending) and match groups (active) connections
   * Key Fix: Use user.id (auth user ID) for peer_support_profiles queries, not profile.id
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
      
      const allConnections = [];

      // Get role-specific profile IDs
      let applicantProfileId = null;
      let peerSupportProfileId = null;

      // Only check for applicant profile if user has 'applicant' role
      if (profile.roles && profile.roles.includes('applicant')) {
        try {
          console.log('🔍 Querying applicant_matching_profiles for user_id:', user.id);
          const { data: applicantProfile, error: applicantError } = await supabase
            .from('applicant_matching_profiles')
            .select('id, user_id')
            .eq('user_id', user.id)  // ✅ FIXED: Use auth user ID
            .single();
          
          if (applicantProfile && !applicantError) {
            applicantProfileId = applicantProfile.id;
            console.log('👤 Found applicant profile ID:', applicantProfileId);
          } else {
            console.log('ℹ️ No applicant profile found for auth user:', user.id);
          }
        } catch (err) {
          console.log('ℹ️ No applicant profile found:', err.message);
        }
      } else {
        console.log('ℹ️ User is not an applicant, skipping applicant profile check');
      }

      // Only check for peer support profile if user has 'peer-support' role
      if (profile.roles && profile.roles.includes('peer-support')) {
        try {
          console.log('🔍 Querying peer_support_profiles for user_id (registrant profile ID):', profile.id);
          const { data: peerProfile, error: peerError } = await supabase
            .from('peer_support_profiles')
            .select('id, user_id')
            .eq('user_id', profile.id)  // ✅ CORRECT: Use registrant profile ID
            .single();
          
          if (peerProfile && !peerError) {
            peerSupportProfileId = peerProfile.id;
            console.log('🤝 Found peer support profile ID:', peerSupportProfileId);
            console.log('🔗 peer_support_profiles.user_id:', peerProfile.user_id, '(should match registrant profile ID)');
          } else {
            console.log('ℹ️ No peer support profile found for registrant profile:', profile.id);
            console.log('Error details:', peerError);
          }
        } catch (err) {
          console.log('ℹ️ No peer support profile found:', err.message);
        }
      } else {
        console.log('ℹ️ User is not a peer specialist, skipping peer support profile check');
      }

      // 1. ✅ LOAD PENDING REQUESTS from match_requests table
      console.log('🔄 Loading pending match requests...');
      console.log('📊 Profile IDs found:', { applicantProfileId, peerSupportProfileId });
      
      // Query for requests where this user is the recipient (peer specialist receiving requests)
      if (peerSupportProfileId) {
        try {
          console.log('🔍 Looking for requests with recipient_type=peer-support and recipient_id:', peerSupportProfileId);
          
          const { data: pendingRequests, error: requestsError } = await supabase
            .from('match_requests')
            .select('*')
            .eq('recipient_type', 'peer-support')
            .eq('recipient_id', peerSupportProfileId)
            .eq('status', 'pending');

          if (requestsError) {
            console.error('❌ Error querying match_requests:', requestsError);
          } else {
            console.log(`📋 Found ${pendingRequests?.length || 0} pending requests for peer support specialist`);
            console.log('📋 Raw pending requests:', pendingRequests);
            
            if (pendingRequests && pendingRequests.length > 0) {
              // Process pending requests
              for (const request of pendingRequests) {
                try {
                  console.log('🔍 Processing request:', request);
                  
                  // Get requester's profile (should be applicant)
                  const { data: requesterProfile, error: profileError } = await supabase
                    .from('applicant_matching_profiles')
                    .select(`
                      id,
                      user_id,
                      primary_phone,
                      registrant_profiles!inner(
                        id,
                        first_name,
                        last_name,
                        email
                      )
                    `)
                    .eq('id', request.requester_id)
                    .single();

                  if (requesterProfile && !profileError) {
                    console.log('👤 Found requester profile:', requesterProfile);
                    
                    allConnections.push({
                      id: `request_${request.id}`,
                      profile_id: request.requester_id,
                      name: `${requesterProfile.registrant_profiles.first_name} ${requesterProfile.registrant_profiles.last_name}`,
                      type: 'peer_support',
                      status: 'pending_request',
                      source: 'match_request',
                      request_id: request.id,
                      created_at: request.created_at,
                      last_activity: request.updated_at || request.created_at,
                      shared_contact: false,
                      contact_info: null,
                      avatar: '🤝',
                      request_message: request.message
                    });
                    console.log('✅ Added pending request from:', requesterProfile.registrant_profiles.first_name);
                  } else {
                    console.warn('⚠️ Could not find requester profile for request:', request.id, profileError);
                  }
                } catch (profileErr) {
                  console.warn('⚠️ Error loading requester profile:', profileErr);
                }
              }
            } else {
              console.log('ℹ️ No pending requests found for this peer support specialist');
            }
          }
        } catch (requestErr) {
          console.warn('⚠️ Error loading match requests:', requestErr);
        }
      } else {
        console.log('ℹ️ No peer support profile ID found, skipping peer support request check');
      }

      // Also check if this user has sent requests (as an applicant)
      if (applicantProfileId) {
        try {
          console.log('🔍 Looking for requests sent by this user with requester_type=applicant and requester_id:', applicantProfileId);
          
          const { data: sentRequests, error: sentError } = await supabase
            .from('match_requests')
            .select('*')
            .eq('requester_type', 'applicant')
            .eq('requester_id', applicantProfileId)
            .eq('request_type', 'peer-support')
            .in('status', ['pending', 'accepted']);

          if (!sentError && sentRequests && sentRequests.length > 0) {
            console.log(`📤 Found ${sentRequests.length} requests sent by this user`);
            
            for (const request of sentRequests) {
              try {
                // ✅ FIXED: Query correct table based on recipient_type
                let recipientProfile = null;
                
                if (request.recipient_type === 'peer-support') {
                  // Query peer_support_profiles table
                  const { data: peerProfile, error: peerError } = await supabase
                    .from('peer_support_profiles')
                    .select('id, user_id, first_name, last_name, professional_title')
                    .eq('id', request.recipient_id)
                    .single();
                    
                  if (peerProfile && !peerError) {
                    recipientProfile = {
                      id: peerProfile.id,
                      name: `${peerProfile.first_name || 'Anonymous'} ${peerProfile.last_name || ''}`.trim(),
                      title: peerProfile.professional_title || 'Peer Support Specialist'
                    };
                  } else {
                    console.warn('⚠️ Could not find peer support profile for recipient_id:', request.recipient_id, peerError);
                  }
                } else if (request.recipient_type === 'applicant') {
                  // Query applicant_matching_profiles table
                  const { data: applicantProfile, error: applicantError } = await supabase
                    .from('applicant_matching_profiles')
                    .select(`
                      id,
                      user_id,
                      registrant_profiles!inner(
                        first_name,
                        last_name,
                        email
                      )
                    `)
                    .eq('id', request.recipient_id)
                    .single();
                    
                  if (applicantProfile && !applicantError) {
                    recipientProfile = {
                      id: applicantProfile.id,
                      name: `${applicantProfile.registrant_profiles.first_name} ${applicantProfile.registrant_profiles.last_name}`,
                      title: 'Applicant'
                    };
                  } else {
                    console.warn('⚠️ Could not find applicant profile for recipient_id:', request.recipient_id, applicantError);
                  }
                }

                if (recipientProfile) {
                  allConnections.push({
                    id: `sent_request_${request.id}`,
                    profile_id: request.recipient_id,
                    name: recipientProfile.name,
                    type: request.request_type.replace('-', '_'), // peer-support -> peer_support
                    status: request.status === 'pending' ? 'request_sent' : 'active_connection',
                    source: 'match_request',
                    request_id: request.id,
                    created_at: request.created_at,
                    last_activity: request.updated_at || request.created_at,
                    shared_contact: request.status === 'accepted',
                    contact_info: null,
                    avatar: request.request_type === 'peer-support' ? '🤝' : '👥',
                    request_message: request.message,
                    recipient_type: request.recipient_type
                  });
                  console.log('✅ Added sent request:', recipientProfile.name, 'Type:', request.recipient_type);
                } else {
                  console.warn('⚠️ Could not load recipient profile for request:', request.id);
                }
              } catch (recipientErr) {
                console.warn('⚠️ Error loading recipient profile:', recipientErr);
              }
            }
          }
        } catch (sentErr) {
          console.warn('⚠️ Error loading sent requests:', sentErr);
        }
      }

      // 2. ✅ LOAD ACTIVE CONNECTIONS from match_groups table
      console.log('🔄 Loading active connections from match_groups...');
      
      const orConditions = [];
      
      if (applicantProfileId) {
        orConditions.push(`applicant_1_id.eq.${applicantProfileId}`);
        orConditions.push(`applicant_2_id.eq.${applicantProfileId}`);
      }
      
      if (peerSupportProfileId) {
        orConditions.push(`peer_support_id.eq.${peerSupportProfileId}`);
      }

      if (orConditions.length > 0) {
        try {
          const { data: matchGroups, error: matchError } = await supabase
            .from('match_groups')
            .select('*')
            .or(orConditions.join(','))
            .in('status', ['confirmed', 'active']);

          if (matchError) {
            console.warn('⚠️ Error loading match groups:', matchError);
          } else if (matchGroups && matchGroups.length > 0) {
            console.log(`📊 Found ${matchGroups.length} active match groups`);
            
            for (const match of matchGroups) {
              let otherProfileId = null;
              let connectionType = 'roommate';
              let avatar = '👥';
              
              if (match.peer_support_id) {
                // This is a peer support connection
                connectionType = 'peer_support';
                avatar = '🤝';
                if (match.peer_support_id === peerSupportProfileId) {
                  // Current user is the peer supporter
                  otherProfileId = match.applicant_1_id || match.applicant_2_id;
                } else {
                  // Current user is the applicant
                  otherProfileId = match.peer_support_id;
                }
              } else {
                // This is a roommate connection
                connectionType = 'roommate';
                avatar = '👥';
                otherProfileId = match.applicant_1_id === applicantProfileId ? match.applicant_2_id : match.applicant_1_id;
              }
              
              // Get other user's profile info
              if (otherProfileId) {
                try {
                  const { data: otherProfile, error: profileError } = await supabase
                    .from('registrant_profiles')
                    .select('id, first_name, last_name, email, user_id')
                    .eq('id', otherProfileId)
                    .single();
                  
                  if (otherProfile && !profileError) {
                    allConnections.push({
                      id: `active_${match.id}`,
                      profile_id: otherProfileId,
                      name: `${otherProfile.first_name} ${otherProfile.last_name}` || 'Anonymous',
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
                  }
                } catch (profileErr) {
                  console.warn('⚠️ Error loading other profile:', profileErr);
                }
              }
            }
          }
        } catch (matchErr) {
          console.warn('⚠️ Error loading match groups:', matchErr);
        }
      } else {
        console.log('ℹ️ No matching profile IDs found, skipping match_groups query');
      }

      // Sort connections by most recent activity, with pending requests first
      allConnections.sort((a, b) => {
        // Pending requests first
        if (a.status === 'pending_request' && b.status !== 'pending_request') return -1;
        if (b.status === 'pending_request' && a.status !== 'pending_request') return 1;
        
        // Then by most recent activity
        return new Date(b.last_activity) - new Date(a.last_activity);
      });

      console.log(`✅ Loaded ${allConnections.length} total connections:`);
      console.log('- Pending requests:', allConnections.filter(c => c.status === 'pending_request').length);
      console.log('- Sent requests:', allConnections.filter(c => c.status === 'request_sent').length);
      console.log('- Active connections:', allConnections.filter(c => c.status === 'active_connection').length);
      
      setConnections(allConnections);

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

      // Update the match request status to 'accepted'
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

      // Remove from connections list (it will become a match_group)
      setConnections(prev => prev.filter(conn => conn.id !== connection.id));
      
      alert(`Request from ${connection.name} accepted! They can now connect with you.`);
      
      // Refresh connections to pick up any new match_groups
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

      // Update the match request status to 'rejected'
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

      // Remove from connections list
      setConnections(prev => prev.filter(conn => conn.id !== connection.id));
      
      alert(`Request from ${connection.name} declined.`);

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

        setConnections(prev => prev.map(conn => 
          conn.id === connection.id 
            ? { ...conn, shared_contact: true, contact_info: contactInfo }
            : conn
        ));
        
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

      {/* No Connections State */}
      {!loading && !error && connections.length === 0 && (
        <div className="card">
          <div className={styles.noConnectionsState}>
            <h3 className={styles.noConnectionsTitle}>No Active Connections Yet</h3>
            <p className={styles.noConnectionsDescription}>
              Your approved matches and connections will appear here.
            </p>
            <p className={styles.noConnectionsHint}>Start building connections by:</p>
            <div className={styles.noConnectionsActions}>
              <button className="btn btn-outline">👥 Find Matches</button>
              <button className="btn btn-outline">🤝 Connect with Peers</button>
            </div>
          </div>
        </div>
      )}

      {/* Connections Grid */}
      {!loading && !error && connections.length > 0 && (
        <>
          <div className="card mb-4">
            <div className={styles.connectionStats}>
              <h3 className="card-title">
                {connections.length} Connection{connections.length !== 1 ? 's' : ''}
              </h3>
              <div className={styles.connectionTypes}>
                {connections.filter(c => c.status === 'pending_request').length > 0 && (
                  <span className="badge badge-warning">
                    {connections.filter(c => c.status === 'pending_request').length} Pending
                  </span>
                )}
                {connections.filter(c => c.status === 'request_sent').length > 0 && (
                  <span className="badge badge-info">
                    {connections.filter(c => c.status === 'request_sent').length} Sent
                  </span>
                )}
                {connections.filter(c => c.status === 'active_connection').length > 0 && (
                  <span className="badge badge-success">
                    {connections.filter(c => c.status === 'active_connection').length} Active
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

          <div className="grid-auto mb-5">
            {connections.map((connection) => (
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
                  ) : (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Back Button */}
      {onBack && (
        <div className="text-center">
          <button
            className="btn btn-outline"
            onClick={onBack}
          >
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