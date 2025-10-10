// src/components/features/peer-support/PeerSupportDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import styles from './PeerSupportDashboard.module.css';

const PeerSupportDashboard = ({ onBack, onClientSelect }) => {
  const { user, profile } = useAuth();
  const [clients, setClients] = useState([]);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Load clients and available connections on mount
  useEffect(() => {
    if (profile?.id) {
      loadClients();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadAvailableConnections();
    }
  }, [profile?.id, clients.length]);

  /**
   * Load existing PSS clients for this peer specialist
   */
  const loadClients = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading PSS clients...');
      
      let clientData = [];
      
      try {
        // Check if PSS clients service exists
        if (db.pssClients && typeof db.pssClients.getByPeerSpecialistId === 'function') {
          const result = await db.pssClients.getByPeerSpecialistId(profile.id);
          if (result.data && !result.error) {
            clientData = result.data;
          }
        } else {
          // Fallback method via match_groups
          console.log('🔄 Using fallback method via match_groups...');
          const matchResult = await db.matchGroups.getByUserId('peer-support', profile.id);
          
          if (matchResult.data && !matchResult.error) {
            const peerSupportConnections = matchResult.data.filter(match => 
              match.peer_support_id === profile.id && 
              match.status === 'active'
            );
            
            clientData = peerSupportConnections.map(match => ({
              id: `fallback_${match.id}`,
              peer_specialist_id: profile.id,
              client_id: match.applicant_1_id || match.applicant_2_id,
              match_group_id: match.id,
              status: 'active',
              recovery_goals: [],
              total_sessions: 0,
              created_at: match.created_at,
              updated_at: match.updated_at,
              next_followup_date: null,
              followup_frequency: 'weekly',
              last_contact_date: null
            }));
          }
        }
      } catch (serviceError) {
        console.warn('PSS clients service not available, using match_groups fallback:', serviceError);
      }

      console.log(`📊 Found ${clientData.length} PSS clients`);

      // Enrich client data with profile information
      const enrichedClients = await Promise.all(
        clientData.map(async (client) => {
          try {
            const applicantData = client.applicant;
            const clientProfile = applicantData?.registrant;

            if (!applicantData || !clientProfile) {
              console.warn(`Incomplete data for client:`, client);
              return {
                ...client,
                displayName: 'Unknown Client',
                recoveryGoals: [],
                status: 'active'
              };
            }

            return {
              ...client,
              profile: clientProfile,
              applicantProfile: applicantData,
              displayName: clientProfile.first_name 
                ? `${clientProfile.first_name} ${clientProfile.last_name?.charAt(0) || ''}.`
                : 'Anonymous Client',
              phone: applicantData.primary_phone || 'Not provided',
              email: clientProfile.email,
              
              // Recovery information
              primarySubstances: applicantData.primary_substance ? [applicantData.primary_substance] : [],
              recoveryStage: applicantData.recovery_stage || 'Not specified',
              timeInRecovery: applicantData.time_in_recovery || 'Not specified',
              sobrietyDate: applicantData.sobriety_date || null,
              recoveryMethods: applicantData.recovery_methods || [],
              supportMeetings: applicantData.support_meetings || 'Not specified',
              sponsorMentor: applicantData.sponsor_mentor || 'Not specified',
              recoveryContext: applicantData.recovery_context || '',
              spiritualAffiliation: applicantData.spiritual_affiliation || 'Not specified',
              wantRecoverySupport: applicantData.want_recovery_support || false,
              comfortableDiscussing: applicantData.comfortable_discussing_recovery || false,
              attendMeetingsTogether: applicantData.attend_meetings_together || false,
              recoveryAccountability: applicantData.recovery_accountability || false,
              mentorshipInterest: applicantData.mentorship_interest || false,
              
              // Goals and session tracking
              recoveryGoals: client.recovery_goals || [],
              nextFollowup: client.next_followup_date,
              followupFrequency: client.followup_frequency || 'weekly',
              lastContact: client.last_contact_date,
              totalSessions: client.total_sessions || 0,
              status: client.status || 'active'
            };
          } catch (err) {
            console.warn(`Error enriching client data for ${client.client_id}:`, err);
            return {
              ...client,
              displayName: 'Unknown Client',
              recoveryGoals: [],
              status: 'active'
            };
          }
        })
      );

      setClients(enrichedClients);

    } catch (err) {
      console.error('💥 Error loading PSS clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available peer support connections that haven't been added as clients yet
   */
  const loadAvailableConnections = async () => {
    if (!profile?.id) return;

    try {
      console.log('🔄 Loading available peer support connections...');
      
      const result = await db.matchGroups.getByUserId('peer-support', profile.id);
      
      if (result.data && !result.error) {
        const peerSupportConnections = result.data.filter(match => 
          match.peer_support_id === profile.id && 
          (match.status === 'confirmed' || match.status === 'forming')
        );

        console.log(`📊 Found ${peerSupportConnections.length} potential peer support connections`);

        const existingClientIds = clients.map(client => client.client_id);
        console.log(`📊 Found ${existingClientIds.length} existing clients to filter out`);

        const availableConnections = peerSupportConnections.filter(connection => {
          const clientId = connection.applicant_1_id || connection.applicant_2_id;
          return clientId && !existingClientIds.includes(clientId);
        });

        console.log(`📊 Found ${availableConnections.length} available connections after filtering`);

        // Enrich with profile data
        const enrichedConnections = await Promise.all(
          availableConnections.map(async (connection) => {
            const clientId = connection.applicant_1_id || connection.applicant_2_id;
            
            try {
              const profileResult = await db.profiles.getById(clientId);
              let applicantProfile = null;
              
              try {
                const applicantResult = await db.matchingProfiles.getByUserId(clientId);
                applicantProfile = applicantResult.data;
              } catch (err) {
                console.warn(`Could not load matching profile for potential client ${clientId}`);
              }
              
              return {
                ...connection,
                client_id: clientId,
                profile: profileResult.data,
                applicantProfile: applicantProfile,
                displayName: profileResult.data?.first_name 
                  ? `${profileResult.data.first_name} ${profileResult.data.last_name?.charAt(0) || ''}.`
                  : 'Anonymous'
              };
            } catch (err) {
              console.warn(`Error enriching connection ${clientId}:`, err);
              return {
                ...connection,
                client_id: clientId,
                displayName: 'Unknown Connection'
              };
            }
          })
        );

        setAvailableConnections(enrichedConnections);
        console.log(`✅ Loaded ${enrichedConnections.length} enriched available connections`);
      }

    } catch (err) {
      console.warn('Error loading available connections:', err);
    }
  };

  /**
   * Add a connection as a new PSS client
   */
  const handleAddClient = async (connection) => {
    if (!profile?.id) return;

    try {
      console.log('➕ Adding new PSS client:', connection.displayName);

      if (db.pssClients && typeof db.pssClients.create === 'function') {
        const clientData = {
          peer_specialist_id: profile.id,
          client_id: connection.client_id,
          match_group_id: connection.id,
          status: 'active',
          next_followup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          followup_frequency: 'weekly',
          recovery_goals: [],
          total_sessions: 0,
          created_by: profile.id
        };

        const result = await db.pssClients.create(clientData);

        if (result.error) {
          throw new Error(result.error.message || 'Failed to add client');
        }

        alert(`${connection.displayName} has been added as your client!`);
      } else {
        // Fallback: Update match_group status
        console.log('🔄 Using fallback method to mark as client...');
        
        const result = await db.matchGroups.update(connection.id, {
          status: 'active',
          notes: 'Active PSS client relationship',
          updated_at: new Date().toISOString()
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update connection status');
        }

        alert(`${connection.displayName} has been marked as your client! Full client management features will be available when the PSS system is fully implemented.`);
      }
      
      // Remove from available connections and refresh client list
      setAvailableConnections(prev => 
        prev.filter(conn => conn.id !== connection.id)
      );
      loadClients();

    } catch (err) {
      console.error('💥 Error adding client:', err);
      alert(`Failed to add client: ${err.message}`);
    }
  };

  /**
   * Open the unified client management modal
   */
const handleOpenClientModal = (client) => {
  setSelectedClient(client);
  console.log('Opening client modal for:', client.displayName);
  
  // Call parent's callback if provided (for modal integration)
  if (onClientSelect) {
    onClientSelect(client);
  }
};

  /**
   * Utility functions
   */
  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', class: 'badge-success' },
      on_hold: { text: 'On Hold', class: 'badge-warning' },
      completed: { text: 'Completed', class: 'badge-info' },
      transferred: { text: 'Transferred', class: 'badge-secondary' },
      inactive: { text: 'Inactive', class: 'badge-error' }
    };
    return badges[status] || badges.active;
  };

  const formatFollowupFrequency = (frequency) => {
    const frequencies = {
      daily: 'Daily',
      twice_weekly: '2x/week',
      weekly: 'Weekly',
      bi_weekly: 'Bi-weekly',
      monthly: 'Monthly',
      as_needed: 'As needed'
    };
    return frequencies[frequency] || frequency;
  };

  const getDaysUntilFollowup = (followupDate) => {
    if (!followupDate) return null;
    const today = new Date();
    const followup = new Date(followupDate);
    const diffTime = followup - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFollowupAlertClass = (daysUntilFollowup) => {
    if (daysUntilFollowup === null) return styles.followupOnTrack;
    if (daysUntilFollowup < 0) return styles.followupOverdue;
    if (daysUntilFollowup <= 2) return styles.followupDueSoon;
    return styles.followupOnTrack;
  };

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Peer Support Hub</h1>
        <p className="welcome-text">
          Manage your peer support clients, track recovery goals, and coordinate ongoing support
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <div className="alert alert-error">
            <h4>Error Loading Clients</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setError(null);
                loadClients();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading your clients..." />
        </div>
      )}

      {/* Available Connections to Add */}
      {!loading && availableConnections.length > 0 && (
        <div className={styles.availableConnectionsCard}>
          <h3 className="card-title">Available Connections</h3>
          <p className="card-text mb-4">
            These individuals have connected with you for peer support but haven't been added to your client list yet.
          </p>
          
          <div className={styles.availableConnectionsGrid}>
            {availableConnections.map((connection) => (
              <div key={connection.id} className={styles.connectionCard}>
                <h4 className={styles.connectionName}>{connection.displayName}</h4>
                <div className={styles.connectionMeta}>
                  <div>Connected: {new Date(connection.created_at).toLocaleDateString()}</div>
                  {connection.applicantProfile?.recovery_stage && (
                    <div>Recovery Stage: {connection.applicantProfile.recovery_stage}</div>
                  )}
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddClient(connection)}
                >
                  Add as Client
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Clients */}
      {!loading && clients.length > 0 && (
        <>
          <div className={styles.clientsHeader}>
            <h3 className="card-title">
              Your Clients ({clients.length})
            </h3>
            <button 
              className={styles.refreshButton}
              onClick={loadClients}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          <div className={styles.clientsGrid}>
            {clients.map((client) => {
              const statusBadge = getStatusBadge(client.status);
              const daysUntilFollowup = getDaysUntilFollowup(client.nextFollowup);
              const followupAlertClass = getFollowupAlertClass(daysUntilFollowup);
              
              return (
                <div key={client.id} className={styles.clientCard}>
                  {/* Client Header */}
                  <div className={styles.clientCardHeader}>
                    <div>
                      <div className={styles.clientName}>{client.displayName}</div>
                      <div className={styles.clientSubtitle}>
                        {client.totalSessions || 0} sessions • 
                        {client.lastContact 
                          ? ` Last contact: ${new Date(client.lastContact).toLocaleDateString()}`
                          : ' No recent contact'
                        }
                      </div>
                    </div>
                    
                    <div className={styles.clientStatusBadge}>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className={styles.clientInfo}>
                    <div className={styles.clientInfoGrid}>
                      <div>
                        <span className={styles.infoLabel}>Phone:</span>
                        <span className={styles.infoValue}> {client.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}> {client.email || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className={styles.clientInfoGrid}>
                      <div>
                        <span className={styles.infoLabel}>Recovery Stage:</span>
                        <span className={styles.infoValue}> {client.recoveryStage}</span>
                      </div>
                      <div>
                        <span className={styles.infoLabel}>Follow-up:</span>
                        <span className={styles.infoValue}> {formatFollowupFrequency(client.followupFrequency)}</span>
                      </div>
                    </div>

                    {/* Primary Substances */}
                    {client.primarySubstances?.length > 0 && (
                      <div className="mb-3">
                        <span className={styles.infoLabel}>Primary Substances:</span>
                        <div className={styles.substancesList}>
                          {client.primarySubstances.map((substance, i) => (
                            <span key={i} className={styles.substanceBadge}>
                              {substance}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Status */}
                    {client.nextFollowup && (
                      <div className={`${styles.followupAlert} ${followupAlertClass}`}>
                        <strong>Next Follow-up:</strong> {new Date(client.nextFollowup).toLocaleDateString()}
                        {daysUntilFollowup < 0 && (
                          <span className="ml-2">(Overdue by {Math.abs(daysUntilFollowup)} days)</span>
                        )}
                        {daysUntilFollowup >= 0 && daysUntilFollowup <= 2 && (
                          <span className="ml-2">(Due in {daysUntilFollowup} days)</span>
                        )}
                      </div>
                    )}

                    {/* Recovery Goals Preview */}
                    <div className={styles.goalsSection}>
                      <div className={styles.goalsHeader}>
                        🎯 Recovery Goals ({client.recoveryGoals?.length || 0}/5)
                      </div>
                      {client.recoveryGoals?.length > 0 ? (
                        <div className={styles.goalsList}>
                          {client.recoveryGoals.slice(0, 2).map((goal) => (
                            <div key={goal.id} className={styles.goalItem}>
                              <span className={`${styles.goalStatus} ${styles[`goalStatus${goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}`]}`}>
                                {goal.status}
                              </span>
                              <span className={styles.goalText}>{goal.goal}</span>
                            </div>
                          ))}
                          {client.recoveryGoals.length > 2 && (
                            <div className={styles.moreGoalsText}>+{client.recoveryGoals.length - 2} more goals</div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.noGoalsText}>No goals set yet</div>
                      )}
                    </div>
                  </div>

                  {/* Simplified Action Button */}
                  <div className={styles.clientActions}>
                    <button
                      className={`${styles.actionButton} ${styles.actionPrimary}`}
                      onClick={() => handleOpenClientModal(client)}
                    >
                      📝 Manage Client
                    </button>
                    
                    <div className={styles.quickActions}>
                      <button
                        className={`${styles.quickActionButton} ${styles.phoneAction}`}
                        onClick={() => {
                          const phoneUrl = client.phone ? `tel:${client.phone}` : '#';
                          if (client.phone && client.phone !== 'Not provided') {
                            window.location.href = phoneUrl;
                          } else {
                            alert('No phone number available for this client');
                          }
                        }}
                        disabled={!client.phone || client.phone === 'Not provided'}
                        title="Call client"
                      >
                        📞
                      </button>

                      <button
                        className={`${styles.quickActionButton} ${styles.emailAction}`}
                        onClick={() => {
                          const emailUrl = client.email ? `mailto:${client.email}` : '#';
                          if (client.email) {
                            window.location.href = emailUrl;
                          } else {
                            alert('No email address available for this client');
                          }
                        }}
                        disabled={!client.email}
                        title="Email client"
                      >
                        📧
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* No Clients State */}
      {!loading && clients.length === 0 && availableConnections.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👥</div>
          <h3 className={styles.emptyStateTitle}>No Clients Yet</h3>
          <p className={styles.emptyStateMessage}>Once individuals connect with you for peer support, they'll appear here as potential clients.</p>
          <div className={styles.emptyStateSubtext}>To get started:</div>
          <div className={styles.emptyStateActions}>
            <button className="btn btn-outline">
              📋 Update Your Profile
            </button>
            <button className="btn btn-outline">
              📞 Check Connection Requests
            </button>
          </div>
        </div>
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

      {/* Expose selected client for parent component to handle modal */}
      {selectedClient && (
        <div className={styles.hiddenClientData} data-selected-client={JSON.stringify(selectedClient)} />
      )}
    </div>
  );
};

export default PeerSupportDashboard;