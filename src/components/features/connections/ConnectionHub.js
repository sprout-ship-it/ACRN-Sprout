// src/components/features/connections/ConnectionHub.js - FIXED FOR PEER SUPPORT PROFILE IDS
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
    landlord_communication: [
      {
        title: 'Tenant Application Update',
        template: 'Hi {name}! I wanted to update you on your application for "{property}". {update}. Please let me know if you have any questions.'
      },
      {
        title: 'Viewing Confirmation',
        template: 'Hi {name}! I\'m confirming our property viewing for "{property}" on {date} at {time}. The address is {address}. Looking forward to meeting you!'
      },
      {
        title: 'Application Requirements',
        template: 'Hi {name}! To complete your application for "{property}", I\'ll need: {requirements}. Please provide these documents when convenient.'
      },
      {
        title: 'Welcome New Tenant',
        template: 'Hi {name}! Welcome to "{property}"! I\'m excited to have you as a tenant. Here are the next steps: {next_steps}.'
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
   * ✅ FIXED: Enhanced connection loading with proper peer support profile ID handling
   */
  const loadConnections = async () => {
    if (!user?.id || !profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading all connections for profile:', profile.id);
      
      const allConnections = [];

      // ✅ FIXED: Get role-specific profile IDs first
      let applicantProfileId = null;
      let peerSupportProfileId = null;
      let landlordProfileId = null;

      // Check if user has an applicant profile
      try {
        const { data: applicantProfile } = await supabase
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        
        if (applicantProfile) {
          applicantProfileId = applicantProfile.id;
          console.log('👤 Found applicant profile ID:', applicantProfileId);
        }
      } catch (err) {
        console.log('ℹ️ No applicant profile found (this is normal for non-applicants)');
      }

      // Check if user has a peer support profile
      try {
        const { data: peerProfile } = await supabase
          .from('peer_support_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        
        if (peerProfile) {
          peerSupportProfileId = peerProfile.id;
          console.log('🤝 Found peer support profile ID:', peerSupportProfileId);
        }
      } catch (err) {
        console.log('ℹ️ No peer support profile found (this is normal for non-peer specialists)');
      }

      // Check if user has a landlord profile
      try {
        const { data: landlordProfile } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        
        if (landlordProfile) {
          landlordProfileId = landlordProfile.id;
          console.log('🏠 Found landlord profile ID:', landlordProfileId);
        }
      } catch (err) {
        console.log('ℹ️ No landlord profile found (this is normal for non-landlords)');
      }

      // ✅ FIXED: Load match_groups with proper role-specific ID matching
      try {
        // Build the OR clause based on which profiles the user has
        const orConditions = [];
        
        if (applicantProfileId) {
          orConditions.push(`applicant_1_id.eq.${applicantProfileId}`);
          orConditions.push(`applicant_2_id.eq.${applicantProfileId}`);
        }
        
        if (peerSupportProfileId) {
          orConditions.push(`peer_support_id.eq.${peerSupportProfileId}`);
        }

        // Only query if we have at least one profile ID
        if (orConditions.length === 0) {
          console.log('ℹ️ No matching profile IDs found, skipping match_groups query');
        } else {
          const { data: matchGroups, error: matchError } = await supabase
            .from('match_groups')
            .select(`
              *,
              properties (
                id,
                title,
                address,
                city,
                state,
                monthly_rent,
                landlord_id
              )
            `)
            .or(orConditions.join(','))
            .eq('status', 'confirmed');

          if (matchError) {
            console.warn('Error loading match groups:', matchError);
          } else if (matchGroups && matchGroups.length > 0) {
            console.log(`📊 Found ${matchGroups.length} match groups`);
            
            for (const match of matchGroups) {
              let otherProfileId = null;
              let connectionType = 'roommate';
              let avatar = '👥';
              let isHousingConnection = false;
              
              // ✅ ENHANCED: Better handling of different match group types
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
              } else if (match.property_id && match.properties) {
                // ✅ NEW: This is an approved housing connection
                connectionType = 'housing_approved';
                avatar = '🏠';
                isHousingConnection = true;
                
                // Get landlord profile from property
                const { data: landlordProfile, error: landlordError } = await supabase
                  .from('landlord_profiles')
                  .select(`
                    id,
                    user_id,
                    primary_phone,
                    contact_email,
                    registrant_profiles!inner(
                      id,
                      first_name,
                      last_name,
                      email
                    )
                  `)
                  .eq('id', match.properties.landlord_id)
                  .single();

                if (landlordProfile && !landlordError) {
                  otherProfileId = landlordProfile.user_id;
                  
                  // Add the connection with full property and landlord context
                  allConnections.push({
                    id: `housing_${match.id}`,
                    profile_id: landlordProfile.user_id,
                    name: `${landlordProfile.registrant_profiles.first_name} ${landlordProfile.registrant_profiles.last_name}`,
                    type: connectionType,
                    status: 'approved',
                    source: 'housing_approval',
                    match_group_id: match.id,
                    property_title: match.properties.title,
                    property_address: `${match.properties.address}, ${match.properties.city}, ${match.properties.state}`,
                    property_rent: match.properties.monthly_rent,
                    property_id: match.properties.id,
                    created_at: match.created_at,
                    last_activity: match.updated_at || match.created_at,
                    shared_contact: true, // Approved housing connections have shared contact
                    contact_info: {
                      phone: landlordProfile.primary_phone,
                      email: landlordProfile.contact_email || landlordProfile.registrant_profiles.email,
                      preferred_contact: 'email',
                      availability: 'Business hours'
                    },
                    avatar: avatar,
                    // ✅ NEW: Add landlord-specific context
                    landlord_profile: landlordProfile
                  });
                }
                continue; // Skip the general processing since we handled it above
              } else {
                // This is a roommate connection
                connectionType = 'roommate';
                avatar = '👥';
                otherProfileId = match.applicant_1_id === applicantProfileId ? match.applicant_2_id : match.applicant_1_id;
              }
              
              // Process non-housing connections
              if (otherProfileId && !isHousingConnection) {
                // Get other user's registrant profile
                const { data: otherProfile, error: profileError } = await supabase
                  .from('registrant_profiles')
                  .select('id, first_name, last_name, email, user_id')
                  .eq('id', otherProfileId)
                  .single();
                
                if (otherProfile && !profileError) {
                  allConnections.push({
                    id: match.id,
                    profile_id: otherProfileId,
                    name: `${otherProfile.first_name} ${otherProfile.last_name}` || 'Anonymous',
                    type: connectionType,
                    status: match.status === 'confirmed' ? 'active' : match.status,
                    source: 'match_group',
                    match_group_id: match.id,
                    created_at: match.created_at,
                    last_activity: match.updated_at || match.created_at,
                    shared_contact: match.contact_shared || false,
                    contact_info: match.shared_contact_info || null,
                    property_id: match.property_id || null,
                    avatar: avatar
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error loading match groups:', err);
      }

      // ✅ UPDATED: Load employer favorites (if available)
      try {
        const { data: employerFavorites, error: favoritesError } = await supabase
          .from('employer_favorites')
          .select(`
            *,
            employer_profiles!inner(
              business_type,
              industry,
              description,
              service_city,
              service_state,
              contact_email,
              primary_phone,
              registrant_profiles!inner(
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('user_id', profile.id);

        if (favoritesError) {
          console.warn('Error loading employer favorites:', favoritesError);
        } else if (employerFavorites && employerFavorites.length > 0) {
          for (const favorite of employerFavorites) {
            const employerProfile = favorite.employer_profiles;
            
            allConnections.push({
              id: `employer_${favorite.id}`,
              profile_id: favorite.employer_user_id,
              name: `${employerProfile.registrant_profiles.first_name} ${employerProfile.registrant_profiles.last_name}`,
              type: 'employer',
              status: 'favorited',
              source: 'employer_favorite',
              favorite_id: favorite.id,
              company_name: employerProfile.business_type,
              industry: employerProfile.industry,
              created_at: favorite.created_at,
              last_activity: favorite.created_at,
              shared_contact: true, // Employer info is public
              contact_info: {
                email: employerProfile.contact_email || employerProfile.registrant_profiles.email,
                phone: employerProfile.primary_phone,
                preferred_contact: 'email',
                availability: 'Business hours'
              },
              avatar: '💼'
            });
          }
        }
      } catch (err) {
        console.warn('Error loading employer favorites:', err);
      }

      // Sort connections by most recent activity
      allConnections.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));

      console.log(`✅ Loaded ${allConnections.length} connections:`, allConnections);
      setConnections(allConnections);

    } catch (err) {
      console.error('💥 Error loading connections:', err);
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Share contact information with a connection
   */
  const handleShareContact = async (connection) => {
    if (!user?.id || !profile?.id) return;

    try {
      console.log('📞 Sharing contact with:', connection.name);

      // For match_group connections, update the contact sharing
      if (connection.source === 'match_group' && connection.match_group_id) {
        const contactInfo = {
          phone: profile?.primary_phone || '',
          email: user.email || '',
          preferred_contact: 'email',
          availability: 'Evenings after 6pm',
          notes: 'Contact me anytime about our housing search!'
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
   * ✅ UPDATED: Enhanced template messaging with housing-specific templates
   */
  const handleSendTemplate = (template, connection) => {
    const replacements = {
      name: connection.name,
      address: connection.property_address || '[PROPERTY ADDRESS]',
      property: connection.property_title || '[PROPERTY NAME]',
      date: '[DATE]',
      time: '[TIME]',
      availability: '[YOUR AVAILABILITY]',
      update: '[YOUR UPDATE]',
      program: '[PROGRAM NAME]',
      topic: '[TOPIC]',
      position: '[POSITION TITLE]',
      company: connection.company_name || connection.name,
      skills: '[YOUR SKILLS]',
      requirements: '[REQUIRED DOCUMENTS]',
      next_steps: '[NEXT STEPS]'
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
   * ✅ UPDATED: Enhanced connection type badge with housing approval support
   */
  const getConnectionTypeBadgeClass = (type) => {
    const typeClasses = {
      roommate: styles.roommateType,
      peer_support: styles.peerSupportType,
      housing_approved: styles.housingApprovedType,
      landlord: styles.landlordType,
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
    if (profile?.id) {
      loadConnections();
    }
  }, [profile?.id]);

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage communication with your matches, approved housing connections, and saved employers
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
              Your approved matches, housing connections, and saved employers will appear here.
            </p>
            <p className={styles.noConnectionsHint}>Start building connections by:</p>
            <div className={styles.noConnectionsActions}>
              <button className="btn btn-outline">👥 Find Roommates</button>
              <button className="btn btn-outline">🤝 Connect with Peer Support</button>
              <button className="btn btn-outline">🏠 Search Housing</button>
              <button className="btn btn-outline">💼 Browse Employers</button>
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
                {connections.length} Active Connection{connections.length !== 1 ? 's' : ''}
              </h3>
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
                        {connection.company_name && `${connection.company_name} • `}
                        {connection.property_title && `${connection.property_title} • `}
                        Active {formatTimeAgo(connection.last_activity)}
                      </div>
                    </div>
                    <div className={styles.connectionMetaInfo}>
                      <span className={getConnectionTypeBadgeClass(connection.type)}>
                        {connection.type === 'roommate' && 'Roommate Match'}
                        {connection.type === 'peer_support' && 'Peer Support'}
                        {connection.type === 'housing_approved' && 'Approved Housing'}
                        {connection.type === 'landlord' && 'Property Owner'}
                        {connection.type === 'employer' && 'Employer'}
                      </span>
                      
                      {connection.status === 'active' && (
                        <span className="badge badge-success">✓ Connected</span>
                      )}
                      {connection.status === 'approved' && (
                        <span className="badge badge-success">✅ Approved</span>
                      )}
                      {connection.status === 'favorited' && (
                        <span className="badge badge-info">⭐ Saved</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ ENHANCED: Property details for housing connections */}
                {connection.type === 'housing_approved' && (
                  <div className={styles.housingDetails}>
                    <div className={styles.propertyInfo}>
                      <h5 className={styles.propertyTitle}>🏠 Property Details</h5>
                      <div className={styles.propertyAddress}>{connection.property_address}</div>
                      <div className={styles.propertyRent}>${connection.property_rent}/month</div>
                    </div>
                    <div className={styles.approvalNotice}>
                      <span className={styles.approvalIcon}>✅</span>
                      <span className={styles.approvalText}>Your housing inquiry was approved! You can now communicate directly with the landlord.</span>
                    </div>
                  </div>
                )}

                {/* Connection Info */}
                <div className="mb-4">
                  <div className={styles.sourceInfo}>
                    <span className={styles.sourceLabel}>Source:</span> {
                      connection.source === 'match_group' ? 'Roommate/Peer Matching' :
                      connection.source === 'housing_approval' ? 'Approved Housing Inquiry' :
                      connection.source === 'housing_request' ? 'Property Search' :
                      connection.source === 'employer_favorite' ? 'Employer Directory' :
                      'Unknown'
                    }
                  </div>

                  {/* Contact Status */}
                  <div className={styles.contactStatus}>
                    {connection.shared_contact ? (
                      <div className={styles.contactShared}>
                        <strong>📞 Contact Available:</strong> You can communicate directly with {connection.name}
                      </div>
                    ) : connection.type === 'employer' || connection.type === 'housing_approved' ? (
                      <div className={styles.contactAvailable}>
                        <strong>💼 Contact Information:</strong> Use the contact buttons below to reach out professionally
                      </div>
                    ) : (
                      <div className={styles.contactPending}>
                        <strong>⏳ Contact Pending:</strong> Share your contact information to enable direct communication
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="button-grid">
                  {/* Contact/Share Button */}
                  {connection.shared_contact || connection.type === 'housing_approved' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedConnection(connection);
                        setActiveModal('contact');
                      }}
                    >
                      📞 Contact Info
                    </button>
                  ) : connection.type === 'employer' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedConnection(connection);
                        setActiveModal('templates');
                      }}
                    >
                      📧 Contact Employer
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleShareContact(connection)}
                    >
                      📞 Share Contact
                    </button>
                  )}
                  
                  {/* Templates/Schedule Button */}
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setSelectedConnection(connection);
                      setActiveModal('templates');
                    }}
                  >
                    💬 Message Templates
                  </button>
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

                {selectedConnection.contact_info.availability && (
                  <div className={styles.availabilitySection}>
                    <h4 className={styles.availabilityTitle}>⏰ Availability</h4>
                    <p className={styles.availabilityInfo}>
                      {selectedConnection.contact_info.availability}
                    </p>
                    {selectedConnection.contact_info.preferred_contact && (
                      <p className={styles.preferredContact}>
                        <span className={styles.preferredContactLabel}>Prefers:</span> {selectedConnection.contact_info.preferred_contact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.contactNotAvailable}>
                <div className={styles.contactUnavailableAlert}>
                  <h4 className={styles.contactUnavailableTitle}>⏳ Contact Information Not Available</h4>
                  <p className={styles.contactUnavailableDescription}>
                    Contact details haven't been shared yet or aren't available for this connection type.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ ENHANCED: Message Templates Modal with housing-specific templates */}
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
                {/* ✅ NEW: Use housing-specific templates for approved housing connections */}
                {messageTemplates[selectedConnection.type === 'housing_approved' ? 'housing_approved' : selectedConnection.type]?.map((template, index) => (
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
              
              <div className={styles.templatesTip}>
                <p className={styles.templatesTipText}>
                  💡 <span className={styles.templatesTipIcon}>Tip:</span> Templates will open your email client with a pre-filled message. 
                  You can edit the message before sending to personalize it.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionHub;