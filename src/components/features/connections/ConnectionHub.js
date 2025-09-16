// src/components/features/connections/ConnectionHub.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import '../../../styles/global.css';

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
    landlord: [
      {
        title: 'Request Property Viewing',
        template: 'Hello {name}! I\'m interested in viewing your property "{property}". My roommate and I are available {availability}. Thank you!'
      },
      {
        title: 'Ask About Application Process',
        template: 'Hi {name}! Could you please provide information about the application process and requirements for "{property}"?'
      },
      {
        title: 'Inquire About Recovery Support',
        template: 'Hello {name}! I wanted to confirm that your property is recovery-friendly and ask about any specific policies or support available.'
      },
      {
        title: 'Follow-up on Application',
        template: 'Hi {name}! I wanted to follow up on my application for "{property}". Please let me know if you need any additional information.'
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
   * Load all active connections from different sources
   */
  const loadConnections = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading all connections for user:', user.id);
      
      const allConnections = [];

      // 1. Load roommate and peer support matches from match_groups
      try {
        const matchResult = await db.matchGroups.getByUserId(user.id);
        if (matchResult.data && !matchResult.error) {
          for (const match of matchResult.data) {
            // Determine the other user in the match
            let otherUserId = null;
            let connectionType = 'roommate';
            let avatar = '👥';
            
            if (match.peer_support_id) {
              // This is a peer support connection
              connectionType = 'peer_support';
              avatar = '🤝';
              if (match.peer_support_id === user.id) {
                // Current user is the peer supporter
                otherUserId = match.applicant_1_id || match.applicant_2_id;
              } else {
                // Current user is the applicant
                otherUserId = match.peer_support_id;
              }
            } else if (match.landlord_id) {
              // This is a housing connection
              connectionType = 'landlord';
              avatar = '🏠';
              if (match.landlord_id === user.id) {
                // Current user is the landlord
                otherUserId = match.applicant_1_id || match.applicant_2_id;
              } else {
                // Current user is an applicant
                otherUserId = match.landlord_id;
              }
            } else {
              // This is a roommate connection
              connectionType = 'roommate';
              avatar = '👥';
              otherUserId = match.applicant_1_id === user.id ? match.applicant_2_id : match.applicant_1_id;
            }
            
            if (otherUserId) {
              // Get other user's profile
              const profileResult = await db.profiles.getById(otherUserId);
              
              if (profileResult.data && !profileResult.error) {
                const otherProfile = profileResult.data;
                
                allConnections.push({
                  id: match.id,
                  user_id: otherUserId,
                  name: otherProfile.first_name || 'Anonymous',
                  type: connectionType,
                  status: match.status === 'active' ? 'active' : match.status,
                  source: 'match_group',
                  match_group_id: match.id,
                  created_at: match.created_at,
                  last_activity: match.updated_at || match.created_at,
                  shared_contact: match.contact_shared || false,
                  contact_info: match.shared_contact_info || null,
                  property: match.property || null,
                  avatar: avatar
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error loading match groups:', err);
      }

      // 2. Load housing connections from match_requests (approved housing requests)
      try {
        const housingResult = await db.matchRequests.getByUserId(user.id);
        if (housingResult.data && !housingResult.error) {
          const approvedHousingRequests = housingResult.data.filter(
            req => req.request_type === 'housing' && req.status === 'matched'
          );

          for (const request of approvedHousingRequests) {
            const landlordId = request.target_id;
            
            // Get landlord profile
            const profileResult = await db.profiles.getById(landlordId);
            
            if (profileResult.data && !profileResult.error) {
              const landlordProfile = profileResult.data;
              
              allConnections.push({
                id: `housing_${request.id}`,
                user_id: landlordId,
                name: landlordProfile.first_name || 'Property Owner',
                type: 'landlord',
                status: 'active',
                source: 'housing_request',
                request_id: request.id,
                property_title: 'Property',
                created_at: request.created_at,
                last_activity: request.updated_at || request.created_at,
                shared_contact: false,
                contact_info: null,
                avatar: '🏠'
              });
            }
          }
        }
      } catch (err) {
        console.warn('Error loading housing connections:', err);
      }

      // 3. Load employer favorites (if the table exists)
      try {
        if (db.employerFavorites) {
          const favoritesResult = await db.employerFavorites.getByUserId(user.id);
          if (favoritesResult.data && !favoritesResult.error) {
            for (const favorite of favoritesResult.data) {
              // The employer favorites view should include employer profile data
              const employerData = favorite;
              
              if (employerData.company_name) {
                allConnections.push({
                  id: `employer_${favorite.id}`,
                  user_id: favorite.employer_user_id,
                  name: employerData.company_name || 'Employer',
                  type: 'employer',
                  status: 'favorited',
                  source: 'employer_favorite',
                  favorite_id: favorite.id,
                  company_name: employerData.company_name,
                  created_at: favorite.created_at,
                  last_activity: favorite.created_at,
                  shared_contact: false,
                  contact_info: {
                    email: employerData.contact_email,
                    phone: employerData.phone,
                    preferred_contact: 'email',
                    availability: 'Business hours'
                  },
                  avatar: '💼'
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error loading employer favorites:', err);
        // This is expected if employer_favorites table doesn't exist yet
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
    if (!user?.id) return;

    try {
      console.log('📞 Sharing contact with:', connection.name);

      // For match_group connections, update the contact sharing
      if (connection.source === 'match_group') {
        const contactInfo = {
          phone: profile?.phone || '',
          email: user.email || '',
          preferred_contact: 'email',
          availability: 'Evenings after 6pm',
          notes: 'Contact me anytime about our housing search!'
        };

        const result = await db.matchGroups.update(connection.match_group_id, {
          contact_shared: true,
          shared_contact_info: contactInfo
        });

        if (result.data && !result.error) {
          // Update local state
          setConnections(prev => prev.map(conn => 
            conn.id === connection.id 
              ? { ...conn, shared_contact: true, contact_info: contactInfo }
              : conn
          ));
          
          alert(`Contact information shared with ${connection.name}!`);
        } else {
          throw new Error(result.error?.message || 'Failed to share contact');
        }
      } else {
        alert('Contact sharing for this connection type will be available soon!');
      }

    } catch (err) {
      console.error('💥 Error sharing contact:', err);
      alert(`Failed to share contact: ${err.message}`);
    }
  };

  /**
   * Send a templated message via email
   */
  const handleSendTemplate = (template, connection) => {
    const replacements = {
      name: connection.name,
      address: '[PROPERTY ADDRESS]',
      date: '[DATE]',
      time: '[TIME]',
      availability: '[YOUR AVAILABILITY]',
      update: '[YOUR UPDATE]',
      program: '[PROGRAM NAME]',
      topic: '[TOPIC]',
      property: connection.property_title || '[PROPERTY NAME]',
      position: '[POSITION TITLE]',
      company: connection.company_name || connection.name,
      skills: '[YOUR SKILLS]'
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
   * Get connection type info for styling
   */
  const getConnectionTypeInfo = (type) => {
    const types = {
      roommate: { label: 'Roommate Match', color: 'var(--primary-purple)', bgColor: 'rgba(160, 32, 240, 0.1)' },
      peer_support: { label: 'Peer Support', color: 'var(--secondary-teal)', bgColor: 'rgba(32, 178, 170, 0.1)' },
      landlord: { label: 'Property Owner', color: 'var(--gold)', bgColor: 'rgba(255, 215, 0, 0.1)' },
      employer: { label: 'Employer', color: 'var(--coral)', bgColor: 'rgba(255, 111, 97, 0.1)' }
    };
    return types[type] || { label: type, color: 'var(--gray-600)', bgColor: 'var(--gray-100)' };
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
    loadConnections();
  }, [user?.id]);

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Connection Hub</h1>
        <p className="welcome-text">
          Manage communication with your matches, landlords, and saved employers through secure contact exchange
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="card mb-5">
          <div className="alert alert-error">
            <h4>Error Loading Connections</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline"
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
        <div className="empty-state">
          <LoadingSpinner />
          <p>Loading your connections...</p>
        </div>
      )}

      {/* No Connections State */}
      {!loading && !error && connections.length === 0 && (
        <div className="card text-center">
          <h3>No Active Connections Yet</h3>
          <p>Your approved matches, housing connections, and saved employers will appear here.</p>
          <div className="mt-4">
            <p className="text-gray-600 mb-3">Start building connections by:</p>
            <div className="grid-auto">
              <button className="btn btn-outline">
                👥 Find Roommates
              </button>
              <button className="btn btn-outline">
                🤝 Connect with Peer Support
              </button>
              <button className="btn btn-outline">
                🏠 Search Housing
              </button>
              <button className="btn btn-outline">
                💼 Browse Employers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connections Grid */}
      {!loading && !error && connections.length > 0 && (
        <>
          <div className="card mb-4">
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="card-title">
                {connections.length} Active Connection{connections.length !== 1 ? 's' : ''}
              </h3>
              <button 
                className="btn btn-outline btn-sm"
                onClick={loadConnections}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="grid-auto mb-5">
            {connections.map((connection) => {
              const typeInfo = getConnectionTypeInfo(connection.type);
              
              return (
                <div key={connection.id} className="card">
                  {/* Connection Header */}
                  <div className="card-header">
                    <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{connection.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div className="card-title">{connection.name}</div>
                        <div className="card-subtitle">
                          {connection.company_name && `${connection.company_name} • `}
                          {connection.property_title && `${connection.property_title} • `}
                          Active {formatTimeAgo(connection.last_activity)}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          background: typeInfo.bgColor, 
                          color: typeInfo.color,
                          border: `1px solid ${typeInfo.color}40`
                        }}
                      >
                        {typeInfo.label}
                      </span>
                      
                      {connection.status === 'active' && (
                        <span className="badge badge-success">✓ Connected</span>
                      )}
                      {connection.status === 'favorited' && (
                        <span className="badge badge-info">⭐ Saved</span>
                      )}
                    </div>
                  </div>

                  {/* Connection Info */}
                  <div className="mb-4">
                    <div className="text-gray-600 mb-3">
                      <strong>Source:</strong> {
                        connection.source === 'match_group' ? 'Roommate/Peer Matching' :
                        connection.source === 'housing_request' ? 'Property Search' :
                        connection.source === 'employer_favorite' ? 'Employer Directory' :
                        'Unknown'
                      }
                    </div>

                    {/* Contact Status */}
                    {connection.shared_contact ? (
                      <div className="alert alert-success">
                        <strong>📞 Contact Shared:</strong> You can communicate directly with {connection.name}
                      </div>
                    ) : connection.type === 'employer' ? (
                      <div className="alert alert-info">
                        <strong>💼 Employer Contact:</strong> Use the contact buttons below to reach out professionally
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        <strong>⏳ Contact Pending:</strong> Share your contact information to enable direct communication
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="button-grid">
                    {/* Contact/Share Button */}
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
              );
            })}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Information - {selectedConnection.name}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            {selectedConnection.contact_info ? (
              <div style={{ padding: '1rem' }}>
                <div className="mb-4">
                  <h4>📞 Contact Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {selectedConnection.contact_info.phone && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--gray-100)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <span style={{ fontWeight: '600', minWidth: '80px' }}>Phone:</span>
                        <span style={{ flex: 1 }}>{selectedConnection.contact_info.phone}</span>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => window.location.href = `tel:${selectedConnection.contact_info.phone}`}
                        >
                          Call
                        </button>
                      </div>
                    )}
                    
                    {selectedConnection.contact_info.email && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--gray-100)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <span style={{ fontWeight: '600', minWidth: '80px' }}>Email:</span>
                        <span style={{ flex: 1 }}>{selectedConnection.contact_info.email}</span>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => window.location.href = `mailto:${selectedConnection.contact_info.email}`}
                        >
                          Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {selectedConnection.contact_info.availability && (
                  <div className="mb-4">
                    <h4>⏰ Availability</h4>
                    <p style={{ 
                      padding: '1rem',
                      background: 'var(--info-bg)',
                      borderRadius: 'var(--radius-md)',
                      margin: '0.5rem 0 0 0',
                      color: 'var(--info-text)'
                    }}>
                      {selectedConnection.contact_info.availability}
                    </p>
                    {selectedConnection.contact_info.preferred_contact && (
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        <strong>Prefers:</strong> {selectedConnection.contact_info.preferred_contact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="alert alert-warning">
                  <h4>⏳ Contact Information Not Available</h4>
                  <p>Contact details haven't been shared yet or aren't available for this connection type.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Templates Modal */}
      {activeModal === 'templates' && selectedConnection && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Message Templates - {selectedConnection.name}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>

            <div style={{ padding: '1rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>💬 Quick Message Templates</h4>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                Choose a template to send via email. You can customize the message before sending.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messageTemplates[selectedConnection.type]?.map((template, index) => (
                  <button
                    key={index}
                    className="btn btn-outline"
                    style={{ 
                      textAlign: 'left',
                      padding: '1rem',
                      justifyContent: 'flex-start'
                    }}
                    onClick={() => handleSendTemplate(template, selectedConnection)}
                  >
                    <strong>{template.title}</strong>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--gray-600)', 
                      marginTop: '0.25rem',
                      fontWeight: 'normal'
                    }}>
                      {template.template.substring(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
              
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--info-text)', margin: 0 }}>
                  💡 <strong>Tip:</strong> Templates will open your email client with a pre-filled message. 
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